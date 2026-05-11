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
from src.moods.models import MoodLog
from src.moods.serializers import MoodLogSerializer


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
    start = timezone.localdate() - timedelta(days=6)
    logs = {log.log_date: log for log in MoodLog.objects.filter(user=user, log_date__gte=start)}
    output = []
    for offset in range(7):
        day = start + timedelta(days=offset)
        log = logs.get(day)
        output.append(
            {
                "date": day.isoformat(),
                "mood_score": log.mood_score if log else None,
                "energy_score": log.energy_score if log else None,
                "stress_score": log.stress_score if log else None,
                "wellness_score": log.wellness_score if log else None,
                "mood_label": log.mood_label if log else "",
            }
        )
    return output


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
                "today_mood_log": MoodLogSerializer(
                    MoodLog.objects.filter(user=request.user, log_date=timezone.localdate()).first(),
                    context={"request": request},
                ).data if MoodLog.objects.filter(user=request.user, log_date=timezone.localdate()).exists() else None,
                "recommendations": RecommendationSerializer(recommendations, many=True).data,
            }
        )
