import json
import os
from dataclasses import dataclass
from typing import Callable, Iterable

from django.db import transaction
from django.utils import timezone

from src.ai_chats.models import ChatConversation, ChatMessage, MessageRole
from src.assessments.models import Assessment, Recommendation
from src.moods.models import MoodLog


CRISIS_TERMS = (
    "hurt myself",
    "suicide",
    "kill myself",
    "end my life",
    "unsafe",
)

SYSTEM_PROMPT = (
    "You are Kalms AI Companion, a warm, calm mental wellness support assistant for university students. "
    "You are supportive and practical, but you do not diagnose, claim to be a therapist, or replace emergency help. "
    "Use available tools only when the user's message would benefit from their recent mood logs, assessment result, "
    "or active recommendations. Keep responses concise, emotionally safe, and grounded."
)


class LLMConfigurationError(RuntimeError):
    pass


@dataclass(frozen=True)
class CompanionReply:
    content: str
    model_name: str
    safety_flags: dict


@dataclass(frozen=True)
class ChatTurnResult:
    conversation: ChatConversation
    user_message: ChatMessage | None
    assistant_message: ChatMessage


def detect_crisis_language(content: str) -> bool:
    lower = content.lower()
    return any(term in lower for term in CRISIS_TERMS)


def crisis_reply() -> CompanionReply:
    return CompanionReply(
        content=(
            "I am really glad you said something. If you might be in immediate danger, "
            "please contact emergency services now or reach out to someone you trust who can stay with you."
        ),
        model_name="kalms-safety-guardrail",
        safety_flags={"crisis_detected": True, "tool_calls": [], "fallback": False},
    )


def truncate_title(content: str, limit: int = 50) -> str:
    normalized = " ".join(content.split())
    if not normalized:
        return "New chat"
    if len(normalized) <= limit:
        return normalized
    return f"{normalized[: limit - 1].rstrip()}..."


def _json_default(value):
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


class UserContextTools:
    def __init__(self, user):
        self.user = user

    def recent_mood_logs(self) -> str:
        logs = MoodLog.objects.filter(user=self.user).order_by("-log_date", "-created_at")[:7]
        payload = [
            {
                "date": log.log_date,
                "mood_score": log.mood_score,
                "energy_score": log.energy_score,
                "stress_score": log.stress_score,
                "mood_label": log.mood_label,
                "note": log.note,
                "wellness_score": log.wellness_score,
            }
            for log in logs
        ]
        return json.dumps(payload, default=_json_default)

    def latest_assessment(self) -> str:
        assessment = (
            Assessment.objects.filter(user=self.user)
            .select_related("prediction")
            .order_by("-completed_at", "-created_at")
            .first()
        )
        if assessment is None:
            return json.dumps(None)
        prediction = getattr(assessment, "prediction", None)
        payload = {
            "assessment_type": assessment.assessment_type,
            "scores": assessment.get_score_summary(),
            "completed_at": assessment.completed_at,
            "prediction": {
                "category": prediction.category,
                "confidence": str(prediction.confidence) if prediction.confidence is not None else None,
                "trend_signal": prediction.trend_signal,
                "explanation": prediction.explanation,
            }
            if prediction
            else None,
        }
        return json.dumps(payload, default=_json_default)

    def active_recommendations(self) -> str:
        recommendations = Recommendation.objects.filter(user=self.user, is_active=True).order_by("priority", "-created_at")[:5]
        payload = [
            {
                "title": recommendation.title,
                "body": recommendation.body,
                "type": recommendation.recommendation_type,
                "priority": recommendation.priority,
            }
            for recommendation in recommendations
        ]
        return json.dumps(payload, default=_json_default)

    def as_langchain_tools(self) -> list:
        try:
            from langchain_core.tools import StructuredTool
        except ImportError as exc:
            raise LLMConfigurationError("LangChain is not installed. Install langchain-core and provider packages.") from exc

        return [
            StructuredTool.from_function(
                name="fetch_recent_mood_logs",
                description="Fetch the authenticated user's recent mood logs, scores, labels, notes, and wellness score.",
                func=self.recent_mood_logs,
            ),
            StructuredTool.from_function(
                name="fetch_latest_assessment",
                description="Fetch the authenticated user's latest assessment scores and wellness prediction.",
                func=self.latest_assessment,
            ),
            StructuredTool.from_function(
                name="fetch_active_recommendations",
                description="Fetch the authenticated user's active wellness recommendations.",
                func=self.active_recommendations,
            ),
        ]


class LangChainModelFactory:
    def from_environment(self):
        provider = os.getenv("LANGCHAIN_LLM_PROVIDER", "").strip().lower()
        model = os.getenv("LANGCHAIN_LLM_MODEL", "").strip()
        api_key = os.getenv("LANGCHAIN_LLM_API_KEY", "").strip()

        if not provider or not model:
            raise LLMConfigurationError("LANGCHAIN_LLM_PROVIDER and LANGCHAIN_LLM_MODEL must be configured.")

        if provider == "openai":
            if not api_key:
                raise LLMConfigurationError("LANGCHAIN_LLM_API_KEY is required for OpenAI.")
            from langchain_openai import ChatOpenAI

            return ChatOpenAI(model=model, api_key=api_key, temperature=0.4)

        if provider == "anthropic":
            if not api_key:
                raise LLMConfigurationError("LANGCHAIN_LLM_API_KEY is required for Anthropic.")
            from langchain_anthropic import ChatAnthropic

            return ChatAnthropic(model=model, api_key=api_key, temperature=0.4)

        if provider in {"gemini", "google"}:
            if not api_key:
                raise LLMConfigurationError("LANGCHAIN_LLM_API_KEY is required for Gemini.")
            from langchain_google_genai import ChatGoogleGenerativeAI

            return ChatGoogleGenerativeAI(model=model, google_api_key=api_key, temperature=0.4)

        if provider == "ollama":
            try:
                from langchain_ollama import ChatOllama
            except ImportError:
                from langchain_community.chat_models import ChatOllama

            base_url = os.getenv("KALMS_LLM_BASE_URL", "").strip() or None
            kwargs = {"model": model, "temperature": 0.4}
            if base_url:
                kwargs["base_url"] = base_url
            return ChatOllama(**kwargs)

        raise LLMConfigurationError(f"Unsupported LANGCHAIN_LLM_PROVIDER: {provider}")


class LangChainCompanionService:
    def __init__(self, model_factory: LangChainModelFactory | None = None):
        self.model_factory = model_factory or LangChainModelFactory()

    def generate_reply(self, *, user, conversation: ChatConversation, content: str) -> CompanionReply:
        if detect_crisis_language(content):
            return crisis_reply()

        try:
            reply = self._generate_with_langchain(user=user, conversation=conversation)
        except LLMConfigurationError:
            raise
        except Exception as exc:
            raise LLMConfigurationError("LangChain chat generation failed.") from exc

        return reply

    def generate_title(self, *, first_message: str, first_response: str) -> str:
        try:
            model = self.model_factory.from_environment()
            messages = self._messages(
                [
                    (
                        "system",
                        "Create a short, calm chat title under 50 characters. Return only the title.",
                    ),
                    (
                        "human",
                        f"Student message: {first_message}\nAssistant response: {first_response}",
                    ),
                ]
            )
            response = model.invoke(messages)
            title = self._content_from_response(response).strip().strip('"')
            return truncate_title(title or first_message)
        except Exception:
            return truncate_title(first_message)

    def _generate_with_langchain(self, *, user, conversation: ChatConversation) -> CompanionReply:
        model = self.model_factory.from_environment()
        tools = UserContextTools(user).as_langchain_tools()
        tool_by_name = {tool.name: tool for tool in tools}
        bound_model = model.bind_tools(tools) if hasattr(model, "bind_tools") else model
        messages = self._conversation_messages(conversation.messages.order_by("message_index", "created_at"))
        first_response = bound_model.invoke(messages)
        tool_calls = getattr(first_response, "tool_calls", None) or []

        if tool_calls:
            messages.append(first_response)
            for tool_call in tool_calls:
                name = tool_call.get("name")
                selected_tool = tool_by_name.get(name)
                if selected_tool is None:
                    continue
                result = selected_tool.invoke(tool_call.get("args") or {})
                messages.append(self._tool_message(str(result), tool_call.get("id", name)))
            first_response = bound_model.invoke(messages)

        return CompanionReply(
            content=self._content_from_response(first_response),
            model_name=self._model_name(model),
            safety_flags={
                "crisis_detected": False,
                "tool_calls": [tool_call.get("name") for tool_call in tool_calls],
                "fallback": False,
            },
        )

    def _conversation_messages(self, messages: Iterable[ChatMessage]) -> list:
        pairs = [("system", SYSTEM_PROMPT)]
        for message in messages:
            if message.role == MessageRole.USER:
                pairs.append(("human", message.content))
            elif message.role == MessageRole.ASSISTANT:
                pairs.append(("ai", message.content))
        return self._messages(pairs)

    def _messages(self, pairs: list[tuple[str, str]]) -> list:
        try:
            from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
        except ImportError as exc:
            raise LLMConfigurationError("LangChain is not installed. Install langchain-core and provider packages.") from exc

        message_types = {
            "system": SystemMessage,
            "human": HumanMessage,
            "ai": AIMessage,
        }
        return [message_types[kind](content=content) for kind, content in pairs]

    def _tool_message(self, content: str, tool_call_id: str):
        try:
            from langchain_core.messages import ToolMessage
        except ImportError as exc:
            raise LLMConfigurationError("LangChain is not installed. Install langchain-core and provider packages.") from exc
        return ToolMessage(content=content, tool_call_id=tool_call_id)

    def _content_from_response(self, response) -> str:
        content = getattr(response, "content", response)
        if isinstance(content, list):
            return " ".join(str(part.get("text", part)) if isinstance(part, dict) else str(part) for part in content).strip()
        return str(content).strip()

    def _model_name(self, model) -> str:
        return (
            getattr(model, "model_name", None)
            or getattr(model, "model", None)
            or os.getenv("LANGCHAIN_LLM_MODEL", "")
            or model.__class__.__name__
        )


def get_companion_service() -> LangChainCompanionService:
    return LangChainCompanionService()


def _create_assistant_message(*, conversation: ChatConversation, user, content: str, reply: CompanionReply) -> ChatMessage:
    return ChatMessage.objects.create(
        conversation=conversation,
        user=user,
        role=MessageRole.ASSISTANT,
        content=reply.content,
        model_name=reply.model_name,
        safety_flags=reply.safety_flags,
    )


@transaction.atomic
def create_chat_turn(*, conversation: ChatConversation, user, content: str) -> ChatTurnResult:
    user_message = ChatMessage.objects.create(
        conversation=conversation,
        user=user,
        role=MessageRole.USER,
        content=content,
    )
    reply = get_companion_service().generate_reply(user=user, conversation=conversation, content=content)
    assistant_message = _create_assistant_message(conversation=conversation, user=user, content=content, reply=reply)

    if not conversation.title:
        try:
            conversation.title = get_companion_service().generate_title(
                first_message=user_message.content,
                first_response=assistant_message.content,
            )
        except Exception:
            conversation.title = truncate_title(user_message.content)
        conversation.save(update_fields=["title", "updated_at"])

    return ChatTurnResult(conversation=conversation, user_message=user_message, assistant_message=assistant_message)


@transaction.atomic
def edit_user_message(*, conversation: ChatConversation, user, message_index: int, content: str) -> ChatTurnResult:
    message = conversation.messages.select_for_update().get(
        user=user,
        role=MessageRole.USER,
        message_index=message_index,
    )
    message.content = content
    message.metadata = {**message.metadata, "edited_at": timezone.now().isoformat()}
    message.save(update_fields=["content", "metadata"])
    conversation.messages.filter(message_index__gt=message_index).delete()
    reply = get_companion_service().generate_reply(user=user, conversation=conversation, content=content)
    assistant_message = _create_assistant_message(conversation=conversation, user=user, content=content, reply=reply)
    return ChatTurnResult(conversation=conversation, user_message=message, assistant_message=assistant_message)


@transaction.atomic
def regenerate_assistant_message(*, conversation: ChatConversation, user, message_index: int) -> ChatTurnResult:
    message = conversation.messages.select_for_update().get(
        user=user,
        role=MessageRole.ASSISTANT,
        message_index=message_index,
    )
    prior_user_message = (
        conversation.messages.filter(role=MessageRole.USER, message_index__lt=message.message_index)
        .order_by("-message_index")
        .first()
    )
    if prior_user_message is None:
        raise ValueError("Cannot regenerate without a previous user message.")

    conversation.messages.filter(message_index__gte=message_index).delete()
    reply = get_companion_service().generate_reply(
        user=user,
        conversation=conversation,
        content=prior_user_message.content,
    )
    assistant_message = _create_assistant_message(
        conversation=conversation,
        user=user,
        content=prior_user_message.content,
        reply=reply,
    )
    return ChatTurnResult(conversation=conversation, user_message=None, assistant_message=assistant_message)


def make_test_reply_service(content_factory: Callable[[str], str] | None = None):
    class TestService(LangChainCompanionService):
        def generate_reply(self, *, user, conversation: ChatConversation, content: str) -> CompanionReply:
            return CompanionReply(
                content=(content_factory or (lambda text: f"Test reply to: {text}"))(content),
                model_name="test-langchain-model",
                safety_flags={"crisis_detected": False, "tool_calls": [], "fallback": False},
            )

        def generate_title(self, *, first_message: str, first_response: str) -> str:
            return truncate_title(first_message)

    return TestService()
