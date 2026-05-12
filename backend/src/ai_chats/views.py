from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from src.ai_chats.models import ChatConversation, ChatMessage, ConversationStatus
from src.ai_chats.serializers import (
    ChatConversationSerializer,
    ChatMessageSerializer,
    EditChatMessageSerializer,
    RegenerateChatMessageSerializer,
    RenameChatSerializer,
    SendChatMessageSerializer,
)
from src.ai_chats.services import LLMConfigurationError, create_chat_turn, edit_user_message, regenerate_assistant_message


class ChatConversationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = ChatConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = ChatConversation.objects.filter(user=self.request.user).prefetch_related("messages")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        else:
            qs = qs.exclude(status=ConversationStatus.DELETED)
        return qs

    def perform_destroy(self, instance):
        instance.delete()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except LLMConfigurationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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
        messages = conversation.messages.order_by("message_index", "created_at")
        return Response(ChatMessageSerializer(messages, many=True).data)

    @action(detail=True, methods=["post"], url_path="send-message")
    def send_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = SendChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = create_chat_turn(
                conversation=conversation,
                user=request.user,
                content=serializer.validated_data["content"],
            )
        except LLMConfigurationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(self._turn_payload(result.conversation, result.assistant_message), status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def rename(self, request, pk=None):
        conversation = self.get_object()
        serializer = RenameChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        conversation.title = serializer.validated_data["title"]
        conversation.save(update_fields=["title", "updated_at"])
        return Response(self.get_serializer(conversation).data)

    @action(detail=True, methods=["post"], url_path="edit-message")
    def edit_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = EditChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = edit_user_message(
                conversation=conversation,
                user=request.user,
                message_index=serializer.validated_data["message_index"],
                content=serializer.validated_data["content"],
            )
        except ChatMessage.DoesNotExist:
            return Response({"detail": "User message not found."}, status=status.HTTP_404_NOT_FOUND)
        except LLMConfigurationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(self._turn_payload(result.conversation, result.assistant_message))

    @action(detail=True, methods=["post"], url_path="regenerate-message")
    def regenerate_message(self, request, pk=None):
        conversation = self.get_object()
        serializer = RegenerateChatMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = regenerate_assistant_message(
                conversation=conversation,
                user=request.user,
                message_index=serializer.validated_data["message_index"],
            )
        except ChatMessage.DoesNotExist:
            return Response({"detail": "Assistant message not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except LLMConfigurationError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(self._turn_payload(result.conversation, result.assistant_message))

    def _turn_payload(self, conversation, assistant_message):
        conversation.refresh_from_db()
        messages = conversation.messages.order_by("message_index", "created_at")
        return {
            "conversation": self.get_serializer(conversation).data,
            "assistant_message": ChatMessageSerializer(assistant_message).data,
            "messages": ChatMessageSerializer(messages, many=True).data,
        }
