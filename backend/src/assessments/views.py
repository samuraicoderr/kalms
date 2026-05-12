from datetime import timedelta

from django.db.models import Count
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from src.assessments.models import Assessment, AssessmentStatus, Recommendation, TrendSignal
from src.assessments.serializers import (
    AssessmentDraftSerializer,
    AssessmentSerializer,
    AssessmentSubmissionSerializer,
    RecommendationSerializer,
)
from src.assessments.services import submit_assessment
from src.assessments.questions import get_questionnaire_definitions
from src.moods.models import MoodLog
from src.moods.serializers import MoodLogSerializer
from src.moods.services import build_mood_summary


class AssessmentViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = (
            Assessment.objects.filter(user=self.request.user)
            .select_related("prediction")
            .prefetch_related("prediction__recommendations")
        )
        assessment_type = self.request.query_params.get("assessment_type")
        status_filter = self.request.query_params.get("status")
        if assessment_type:
            qs = qs.filter(assessment_type=assessment_type)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action == "create":
            return AssessmentDraftSerializer
        if self.action == "submit":
            return AssessmentSubmissionSerializer
        return AssessmentSerializer

    @action(detail=False, methods=["get"])
    def questionnaires(self, request):
        return Response({"results": get_questionnaire_definitions()})

    @action(detail=False, methods=["post"])
    def submit(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            assessment = submit_assessment(user=request.user, **serializer.validated_data)
        except ValueError as exc:
            raise ValidationError({"responses": str(exc)}) from exc
        return Response(AssessmentSerializer(assessment, context={"request": request}).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def latest(self, request):
        assessment = self.get_queryset().filter(status=AssessmentStatus.COMPLETED).first()
        if not assessment:
            return Response(None, status=status.HTTP_200_OK)
        return Response(AssessmentSerializer(assessment, context={"request": request}).data)

    @action(detail=False, methods=["get"])
    def history(self, request):
        qs = self.get_queryset().filter(status=AssessmentStatus.COMPLETED)
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(AssessmentSerializer(page, many=True, context={"request": request}).data)
        return Response(AssessmentSerializer(qs, many=True, context={"request": request}).data)


class RecommendationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = RecommendationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Recommendation.objects.filter(user=self.request.user).select_related("prediction", "prediction__assessment")
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        return qs

    @action(detail=True, methods=["post"])
    def dismiss(self, request, pk=None):
        recommendation = self.get_object()
        recommendation.dismiss()
        return Response(self.get_serializer(recommendation).data)


def current_streak(user) -> int:
    dates = set(MoodLog.objects.filter(user=user).values_list("log_date", flat=True))
    if not dates:
        return 0
    cursor = timezone.localdate()
    if cursor not in dates:
        cursor -= timedelta(days=1)
    streak = 0
    while cursor in dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def weekly_mood(user) -> list[dict]:
    return build_mood_summary(user=user, days=7)["points"]


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def summary(self, request):
        latest_assessment = (
            Assessment.objects.filter(user=request.user, status=AssessmentStatus.COMPLETED)
            .select_related("prediction")
            .prefetch_related("prediction__recommendations")
            .first()
        )
        latest_prediction = getattr(latest_assessment, "prediction", None) if latest_assessment else None
        recommendations = Recommendation.objects.filter(
            user=request.user,
            is_active=True,
        ).order_by("priority", "-created_at")[:4]

        return Response(
            {
                "total_assessments": Assessment.objects.filter(
                    user=request.user,
                    status=AssessmentStatus.COMPLETED,
                ).aggregate(count=Count("id"))["count"],
                "current_streak": current_streak(request.user),
                "latest_category": latest_prediction.category if latest_prediction else None,
                "trend_signal": latest_prediction.trend_signal if latest_prediction else TrendSignal.UNKNOWN,
                "latest_scores": latest_assessment.get_score_summary() if latest_assessment else {
                    "phq9": None,
                    "gad7": None,
                    "pss10": None,
                    "total": 0,
                },
                "latest_assessment": AssessmentSerializer(latest_assessment, context={"request": request}).data if latest_assessment else None,
                "weekly_mood": weekly_mood(request.user),
                "mood_summary": build_mood_summary(user=request.user, days=7),
                "today_mood_log": MoodLogSerializer(
                    MoodLog.objects.filter(user=request.user, log_date=timezone.localdate()).first(),
                    context={"request": request},
                ).data if MoodLog.objects.filter(user=request.user, log_date=timezone.localdate()).exists() else None,
                "recommendations": RecommendationSerializer(recommendations, many=True).data,
            }
        )


class InsightsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"])
    def summary(self, request):
        mood_summary = build_mood_summary(user=request.user, days=7)
        points = mood_summary["points"]
        logged_points = [point for point in points if point["has_log"]]
        highest_stress = max(logged_points, key=lambda point: point["stress_score"] or 0, default=None)
        latest_assessment = (
            Assessment.objects.filter(user=request.user, status=AssessmentStatus.COMPLETED)
            .select_related("prediction")
            .first()
        )
        prediction = getattr(latest_assessment, "prediction", None) if latest_assessment else None

        metrics = [
            {
                "key": "wellness_direction",
                "label": "Wellness direction",
                "value": (prediction.trend_signal if prediction else TrendSignal.UNKNOWN),
                "detail": "weekly",
            },
            {
                "key": "high_stress_window",
                "label": "High stress window",
                "value": highest_stress["day_label"] if highest_stress else "Not enough data",
                "detail": "from check-ins",
            },
            {
                "key": "check_in_habit",
                "label": "Check-in habit",
                "value": f"{mood_summary['count']}/7 days",
                "detail": "this week",
            },
        ]
        cards = [
            {
                "key": "mood_energy",
                "title": "Mood and energy are your clearest signals",
                "body": "Keep logging both together. The pattern helps Kalms spot pressure before it feels too heavy.",
            },
            {
                "key": "stress_window",
                "title": "Stress is easiest to manage when it is named early",
                "body": (
                    f"Your highest saved stress check-in in this range was on {highest_stress['day_label']}."
                    if highest_stress
                    else "Add a few check-ins this week so Kalms can identify your stress windows."
                ),
            },
            {
                "key": "next_step",
                "title": "One steady habit is enough for the MVP",
                "body": "A daily check-in plus a periodic assessment gives the dashboard enough context to stay useful.",
            },
        ]
        return Response(
            {
                "metrics": metrics,
                "summary": "Your insights are based on recent mood logs and your latest completed assessment.",
                "trend_points": points,
                "cards": cards,
            }
        )
