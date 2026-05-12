from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from src.moods.models import MoodLog


User = get_user_model()


class MoodLogTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="strong-password-123",
        )
        self.client.force_authenticate(self.user)

    def test_today_endpoint_creates_and_updates_single_daily_log(self):
        payload = {"mood_score": 7, "energy_score": 6, "stress_score": 4, "note": "steady"}
        create_response = self.client.post(reverse("mood-logs-today"), payload, format="json")
        update_response = self.client.post(
            reverse("mood-logs-today"),
            {**payload, "stress_score": 5},
            format="json",
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(MoodLog.objects.filter(user=self.user, log_date=timezone.localdate()).count(), 1)
        self.assertEqual(MoodLog.objects.get(user=self.user).stress_score, 5)

    def test_summary_returns_seven_day_points_and_averages(self):
        MoodLog.objects.create(
            user=self.user,
            log_date=timezone.localdate(),
            mood_score=8,
            energy_score=6,
            stress_score=3,
        )

        response = self.client.get(reverse("mood-logs-summary"), {"days": 7})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["days"], 7)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(len(response.data["points"]), 7)
        self.assertEqual(response.data["averages"]["mood"], 8.0)
        self.assertTrue(response.data["points"][-1]["has_log"])
