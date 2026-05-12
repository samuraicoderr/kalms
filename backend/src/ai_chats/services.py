from dataclasses import dataclass

from django.conf import settings

from src.ai_chats.models import ChatConversation, ChatMessage, MessageRole


CRISIS_TERMS = (
    "hurt myself",
    "suicide",
    "kill myself",
    "end my life",
    "unsafe",
)


@dataclass(frozen=True)
class CompanionReply:
    content: str
    model_name: str
    safety_flags: dict


class CompanionService:
    model_name = "mvp-supportive-rules"

    def generate_reply(self, *, user, conversation: ChatConversation, content: str) -> CompanionReply:
        lower = content.lower()
        safety_flags = {
            "crisis_detected": any(term in lower for term in CRISIS_TERMS),
            "fallback": True,
        }

        if safety_flags["crisis_detected"]:
            return CompanionReply(
                content=(
                    "I am really glad you said something. If you might be in immediate danger, "
                    "please contact emergency services now or reach out to someone you trust who can stay with you."
                ),
                model_name=self.model_name,
                safety_flags=safety_flags,
            )
        if "study" in lower or "exam" in lower or "deadline" in lower:
            content_out = (
                "That sounds heavy. Try choosing one small study task for the next 20 minutes, "
                "then pause and check what changed in your stress level."
            )
        elif "stress" in lower or "overwhelmed" in lower or "anxious" in lower:
            content_out = (
                "Let us slow the moment down. Take one breath in for four counts and out for six, "
                "then name the next tiny thing you can do safely."
            )
        else:
            content_out = (
                "I am here with you. What feels most present right now: school pressure, sleep, relationships, "
                "or something harder to name?"
            )
        return CompanionReply(content=content_out, model_name=self.model_name, safety_flags=safety_flags)


def get_companion_service() -> CompanionService:
    service_path = getattr(settings, "KALMS_COMPANION_SERVICE", "")
    if service_path:
        # Placeholder for production dependency injection without coupling the MVP to a provider.
        # A future implementation can import the configured class here.
        pass
    return CompanionService()


def create_chat_turn(*, conversation: ChatConversation, user, content: str) -> ChatMessage:
    ChatMessage.objects.create(
        conversation=conversation,
        user=user,
        role=MessageRole.USER,
        content=content,
    )
    reply = get_companion_service().generate_reply(user=user, conversation=conversation, content=content)
    return ChatMessage.objects.create(
        conversation=conversation,
        user=user,
        role=MessageRole.ASSISTANT,
        content=reply.content,
        model_name=reply.model_name,
        safety_flags=reply.safety_flags,
    )
