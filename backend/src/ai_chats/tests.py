from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from src.ai_chats.models import ChatMessage, MessageRole


User = get_user_model()


class ChatConversationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="strong-password-123",
        )
        self.client.force_authenticate(self.user)

    def test_can_create_active_conversation_and_send_message(self):
        active_response = self.client.post(reverse("chat-conversations-active"), {}, format="json")
        self.assertEqual(active_response.status_code, 201)

        conversation_id = active_response.data["id"]
        message_response = self.client.post(
            reverse("chat-conversations-send-message", kwargs={"pk": conversation_id}),
            {"content": "I feel overwhelmed by exams"},
            format="json",
        )

        self.assertEqual(message_response.status_code, 201)
        self.assertEqual(message_response.data["role"], MessageRole.ASSISTANT)
        self.assertEqual(ChatMessage.objects.filter(user=self.user).count(), 2)
