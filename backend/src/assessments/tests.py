from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from src.assessments.models import Assessment, AssessmentStatus, Prediction, Recommendation
from src.moods.models import MoodLog


User = get_user_model()


def answer_map(count: int, value: int) -> dict[str, int]:
    return {str(index): value for index in range(1, count + 1)}


class AssessmentSubmissionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="student@example.com",
            email="student@example.com",
            password="strong-password-123",
        )
        self.client.force_authenticate(self.user)

    def test_submit_full_scan_scores_and_creates_prediction(self):
        MoodLog.objects.create(
            user=self.user,
            mood_score=7,
            energy_score=6,
            stress_score=4,
        )

        response = self.client.post(
            reverse("assessments-submit"),
            {
                "assessment_type": "full_scan",
                "responses": {
                    "phq9": answer_map(9, 1),
                    "gad7": answer_map(7, 1),
                    "pss10": answer_map(10, 2),
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        assessment = Assessment.objects.get(user=self.user)
        self.assertEqual(assessment.status, AssessmentStatus.COMPLETED)
        self.assertEqual(assessment.phq9_score, 9)
        self.assertEqual(assessment.gad7_score, 7)
        self.assertEqual(assessment.pss10_score, 20)
        self.assertTrue(Prediction.objects.filter(assessment=assessment).exists())
        self.assertGreaterEqual(Recommendation.objects.filter(user=self.user).count(), 1)

    def test_rejects_incomplete_assessment(self):
        response = self.client.post(
            reverse("assessments-submit"),
            {
                "assessment_type": "phq9",
                "responses": {"1": 1},
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Assessment.objects.filter(user=self.user).exists())

    def test_dashboard_summary_is_user_scoped(self):
        other_user = User.objects.create_user(
            username="other@example.com",
            email="other@example.com",
            password="strong-password-123",
        )
        Assessment.objects.create(
            user=other_user,
            assessment_type="phq9",
            status=AssessmentStatus.COMPLETED,
            phq9_score=2,
            responses=answer_map(9, 0),
        )

        response = self.client.get(reverse("dashboard-summary"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_assessments"], 0)
