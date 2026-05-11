from rest_framework.routers import SimpleRouter

from src.ai_chats.views import ChatConversationViewSet


ai_chats_router = SimpleRouter()
ai_chats_router.register(r"chat/conversations", ChatConversationViewSet, basename="chat-conversations")

