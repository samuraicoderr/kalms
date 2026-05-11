from rest_framework import serializers

from src.ai_chats.models import ChatConversation, ChatMessage, MessageRole


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = (
            "id",
            "conversation",
            "role",
            "content",
            "model_name",
            "safety_flags",
            "metadata",
            "token_count",
            "created_at",
        )
        read_only_fields = fields


class ChatConversationSerializer(serializers.ModelSerializer):
    latest_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatConversation
        fields = (
            "id",
            "title",
            "status",
            "metadata",
            "started_at",
            "last_message_at",
            "updated_at",
            "latest_message",
        )
        read_only_fields = ("id", "started_at", "last_message_at", "updated_at", "latest_message")

    def get_latest_message(self, obj):
        message = obj.messages.order_by("-created_at").first()
        return ChatMessageSerializer(message).data if message else None

    def create(self, validated_data):
        return ChatConversation.objects.create(user=self.context["request"].user, **validated_data)


class SendChatMessageSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=4000)


def build_mvp_assistant_reply(content: str) -> str:
    lower = content.lower()
    if any(term in lower for term in ["hurt myself", "suicide", "kill myself", "unsafe"]):
        return (
            "I am really glad you said something. If you might be in immediate danger, "
            "please contact emergency services now or reach out to someone you trust who can stay with you."
        )
    if "study" in lower or "exam" in lower or "deadline" in lower:
        return (
            "That sounds heavy. Try choosing one small study task for the next 20 minutes, "
            "then pause and check what changed in your stress level."
        )
    if "stress" in lower or "overwhelmed" in lower or "anxious" in lower:
        return (
            "Let us slow the moment down. Take one breath in for four counts and out for six, "
            "then name the next tiny thing you can do safely."
        )
    return (
        "I am here with you. What feels most present right now: school pressure, sleep, relationships, "
        "or something harder to name?"
    )


def create_chat_turn(*, conversation: ChatConversation, user, content: str) -> ChatMessage:
    ChatMessage.objects.create(
        conversation=conversation,
        user=user,
        role=MessageRole.USER,
        content=content,
    )
    return ChatMessage.objects.create(
        conversation=conversation,
        user=user,
        role=MessageRole.ASSISTANT,
        content=build_mvp_assistant_reply(content),
        model_name="mvp-supportive-rules",
    )

