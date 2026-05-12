from rest_framework import serializers

from src.ai_chats.models import ChatConversation, ChatMessage


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
