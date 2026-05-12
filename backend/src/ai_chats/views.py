from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from src.ai_chats.models import ChatConversation, ConversationStatus
from src.ai_chats.serializers import (
    ChatConversationSerializer,
    ChatMessageSerializer,
    SendChatMessageSerializer,
)
from src.ai_chats.services import create_chat_turn


class ChatConversationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ChatConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = ChatConversation.objects.filter(user=self.request.user).prefetch_related("messages")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    @action(detail=False, methods=["post"], url_path="active")
    def active(self, request):
        conversation = (
            ChatConversation.objects.filter(user=request.user, status=ConversationStatus.ACTIVE)
            .order_by("-last_message_at", "-started_at")
            .first()
        )
        if conversation is None:
            conversation = ChatConversation.objects.create(user=request.user, title="Kalms companion")
            response_status = status.HTTP_201_CREATED
        else:
            response_status = status.HTTP_200_OK
        return Response(self.get_serializer(conversation).data, status=response_status)

    @action(detail=True, methods=["get"])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all()
        return Response(ChatMessageSerializer(messages, many=True).data)

    @action(detail=True, methods=["post"], url_path="send-message")
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = SendChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assistant_message = create_chat_turn(
            conversation=conversation,
            user=request.user,
            content=serializer.validated_data["content"],
        )
        return Response(ChatMessageSerializer(assistant_message).data, status=status.HTTP_201_CREATED)
