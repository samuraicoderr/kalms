import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from src.ai_chats.models import ChatConversation, ChatMessage, MessageRole
from src.ai_chats.services import LangChainModelFactory, LLMConfigurationError, UserContextTools, make_test_reply_service
from src.assessments.models import (
    Assessment,
    AssessmentStatus,
    AssessmentType,
    Prediction,
    Recommendation,
    WellnessCategory,
)
from src.moods.models import MoodLog


User = get_user_model()


def service_patch(factory=None):
    return patch(
        "src.ai_chats.services.get_companion_service",
        return_value=make_test_reply_service(factory),
    )


class ChatConversationTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="strong-password-123",
        )
        self.other_user = User.objects.create_user(
            username="other@example.com",
            email="other@example.com",
            password="strong-password-123",
        )
        self.client.force_authenticate(self.user)

    def test_langchain_configuration_fails_clearly_without_provider(self):
        with patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(LLMConfigurationError):
                LangChainModelFactory().from_environment()

    def test_user_context_tools_are_scoped_to_authenticated_user(self):
        MoodLog.objects.create(user=self.user, mood_score=8, energy_score=7, stress_score=3, note="steady")
        MoodLog.objects.create(user=self.other_user, mood_score=1, energy_score=1, stress_score=10, note="other")
        assessment = Assessment.objects.create(
            user=self.user,
            assessment_type=AssessmentType.PHQ9,
            status=AssessmentStatus.COMPLETED,
            phq9_score=4,
            responses={"1": 1},
        )
        prediction = Prediction.objects.create(
            user=self.user,
            assessment=assessment,
            category=WellnessCategory.HEALTHY,
            confidence="0.9000",
        )
        Recommendation.objects.create(
            user=self.user,
            prediction=prediction,
            title="Keep checking in",
            body="A short daily check-in helps patterns stay visible.",
            priority=1,
        )

        tools = UserContextTools(self.user)

        mood_payload = json.loads(tools.recent_mood_logs())
        assessment_payload = json.loads(tools.latest_assessment())
        recommendations_payload = json.loads(tools.active_recommendations())

        self.assertEqual(len(mood_payload), 1)
        self.assertEqual(mood_payload[0]["note"], "steady")
        self.assertEqual(assessment_payload["scores"]["phq9"], 4)
        self.assertEqual(recommendations_payload[0]["title"], "Keep checking in")

    def test_can_list_create_rename_and_delete_chat_threads(self):
        with service_patch():
            create_response = self.client.post(
                reverse("chat-conversations-list"),
                {"first_message": "I feel tense about exams"},
                format="json",
            )
        self.assertEqual(create_response.status_code, 201)
        conversation_id = create_response.data["id"]
        self.assertEqual(create_response.data["title"], "I feel tense about exams")

        list_response = self.client.get(reverse("chat-conversations-list"))
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.data), 1)

        rename_response = self.client.post(
            reverse("chat-conversations-rename", kwargs={"pk": conversation_id}),
            {"title": "Exam support"},
            format="json",
        )
        self.assertEqual(rename_response.status_code, 200)
        self.assertEqual(rename_response.data["title"], "Exam support")

        delete_response = self.client.delete(reverse("chat-conversations-detail", kwargs={"pk": conversation_id}))
        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(ChatConversation.objects.filter(id=conversation_id).exists())

    def test_message_history_is_scoped_to_selected_chat_thread(self):
        with service_patch():
            first = self.client.post(
                reverse("chat-conversations-list"),
                {"first_message": "First thread"},
                format="json",
            )
            second = self.client.post(
                reverse("chat-conversations-list"),
                {"first_message": "Second thread"},
                format="json",
            )

        response = self.client.get(reverse("chat-conversations-messages", kwargs={"pk": first.data["id"]}))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]["content"], "First thread")
        self.assertNotEqual(first.data["id"], second.data["id"])

    def test_auto_naming_falls_back_to_first_message_when_title_chain_fails(self):
        service = make_test_reply_service()
        with patch.object(service, "generate_title", side_effect=RuntimeError("title failed")):
            with patch("src.ai_chats.services.get_companion_service", return_value=service):
                response = self.client.post(
                    reverse("chat-conversations-list"),
                    {"first_message": "Please help me calm down before my test tomorrow"},
                    format="json",
                )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["title"], "Please help me calm down before my test tomorrow")

    def test_edit_user_message_prunes_subsequent_messages_and_regenerates(self):
        with service_patch():
            create_response = self.client.post(
                reverse("chat-conversations-list"),
                {"first_message": "Original message"},
                format="json",
            )
            conversation_id = create_response.data["id"]
            self.client.post(
                reverse("chat-conversations-send-message", kwargs={"pk": conversation_id}),
                {"content": "Follow up"},
                format="json",
            )

        with service_patch(lambda text: f"Regenerated: {text}"):
            edit_response = self.client.post(
                reverse("chat-conversations-edit-message", kwargs={"pk": conversation_id}),
                {"message_index": 0, "content": "Edited message"},
                format="json",
            )

        self.assertEqual(edit_response.status_code, 200)
        messages = ChatMessage.objects.filter(conversation_id=conversation_id).order_by("message_index")
        self.assertEqual(messages.count(), 2)
        self.assertEqual(messages[0].content, "Edited message")
        self.assertEqual(messages[1].content, "Regenerated: Edited message")
        self.assertEqual([message.message_index for message in messages], [0, 1])

    def test_regenerate_prunes_from_ai_message_and_keeps_prior_user_message(self):
        with service_patch():
            create_response = self.client.post(
                reverse("chat-conversations-list"),
                {"first_message": "Need help"},
                format="json",
            )
            conversation_id = create_response.data["id"]
            self.client.post(
                reverse("chat-conversations-send-message", kwargs={"pk": conversation_id}),
                {"content": "More context"},
                format="json",
            )

        with service_patch(lambda text: f"Fresh response: {text}"):
            regenerate_response = self.client.post(
                reverse("chat-conversations-regenerate-message", kwargs={"pk": conversation_id}),
                {"message_index": 1},
                format="json",
            )

        self.assertEqual(regenerate_response.status_code, 200)
        messages = list(ChatMessage.objects.filter(conversation_id=conversation_id).order_by("message_index"))
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0].role, MessageRole.USER)
        self.assertEqual(messages[0].content, "Need help")
        self.assertEqual(messages[1].content, "Fresh response: Need help")
