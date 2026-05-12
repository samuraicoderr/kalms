from django.db import transaction
from rest_framework import serializers

from src.ai_chats.models import ChatConversation, ChatMessage
from src.ai_chats.services import create_chat_turn


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
            "message_index",
            "created_at",
        )
        read_only_fields = fields


class ChatConversationSerializer(serializers.ModelSerializer):
    latest_message = serializers.SerializerMethodField()
    first_message = serializers.CharField(max_length=4000, write_only=True, required=False, allow_blank=True)

    class Meta:
        model = ChatConversation
        fields = (
            "id",
            "title",
            "status",
            "metadata",
            "first_message",
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
        first_message = validated_data.pop("first_message", "").strip()
        with transaction.atomic():
            conversation = ChatConversation.objects.create(user=self.context["request"].user, **validated_data)
            if first_message:
                create_chat_turn(
                    conversation=conversation,
                    user=self.context["request"].user,
                    content=first_message,
                )
                conversation.refresh_from_db()
            return conversation


class SendChatMessageSerializer(serializers.Serializer):
    content = serializers.CharField(max_length=4000)


class RenameChatSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=140, trim_whitespace=True)


class EditChatMessageSerializer(serializers.Serializer):
    message_index = serializers.IntegerField(min_value=0)
    content = serializers.CharField(max_length=4000)


class RegenerateChatMessageSerializer(serializers.Serializer):
    message_index = serializers.IntegerField(min_value=0)


class ChatTurnResponseSerializer(serializers.Serializer):
    conversation = ChatConversationSerializer(read_only=True)
    assistant_message = ChatMessageSerializer(read_only=True)
    messages = ChatMessageSerializer(many=True, read_only=True)
