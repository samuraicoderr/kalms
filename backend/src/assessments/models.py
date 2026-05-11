from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

from src.lib.utils.uuid7 import uuid7


class AssessmentType(models.TextChoices):
    PHQ9 = "phq9", "PHQ-9"
    GAD7 = "gad7", "GAD-7"
    PSS10 = "pss10", "PSS-10"
    FULL_SCAN = "full_scan", "Full wellness scan"


class AssessmentStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    COMPLETED = "completed", "Completed"
    ARCHIVED = "archived", "Archived"


class WellnessCategory(models.TextChoices):
    HEALTHY = "healthy", "Healthy"
    AT_RISK = "at_risk", "At Risk"
    DISTRESSED = "distressed", "Distressed"


class TrendSignal(models.TextChoices):
    IMPROVING = "improving", "Improving"
    STABLE = "stable", "Stable"
    WORSENING = "worsening", "Worsening"
    UNKNOWN = "unknown", "Unknown"


class RecommendationType(models.TextChoices):
    BREATHING = "breathing", "Breathing"
    SLEEP = "sleep", "Sleep"
    STUDY_BALANCE = "study_balance", "Study balance"
    SOCIAL_SUPPORT = "social_support", "Social support"
    PROFESSIONAL_SUPPORT = "professional_support", "Professional support"
    GENERAL_WELLNESS = "general_wellness", "General wellness"


class Assessment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assessments",
    )
    assessment_type = models.CharField(
        max_length=20,
        choices=AssessmentType.choices,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=AssessmentStatus.choices,
        default=AssessmentStatus.DRAFT,
        db_index=True,
    )
    phq9_score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(27)],
    )
    gad7_score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(21)],
    )
    pss10_score = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(40)],
    )
    responses = models.JSONField(default=dict, blank=True)
    submitted_via = models.CharField(max_length=40, blank=True, default="web")
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-completed_at", "-created_at"]
        indexes = [
            models.Index(fields=["user", "-completed_at"]),
            models.Index(fields=["user", "assessment_type", "-created_at"]),
            models.Index(fields=["status", "-created_at"]),
        ]
        constraints = [
            models.CheckConstraint(
                check=Q(phq9_score__isnull=True) | Q(phq9_score__gte=0, phq9_score__lte=27),
                name="assessment_phq9_score_range",
            ),
            models.CheckConstraint(
                check=Q(gad7_score__isnull=True) | Q(gad7_score__gte=0, gad7_score__lte=21),
                name="assessment_gad7_score_range",
            ),
            models.CheckConstraint(
                check=Q(pss10_score__isnull=True) | Q(pss10_score__gte=0, pss10_score__lte=40),
                name="assessment_pss10_score_range",
            ),
        ]

    def clean(self):
        required_scores = {
            AssessmentType.PHQ9: ("phq9_score",),
            AssessmentType.GAD7: ("gad7_score",),
            AssessmentType.PSS10: ("pss10_score",),
            AssessmentType.FULL_SCAN: ("phq9_score", "gad7_score", "pss10_score"),
        }
        if self.status == AssessmentStatus.COMPLETED:
            missing = [
                field
                for field in required_scores.get(self.assessment_type, ())
                if getattr(self, field) is None
            ]
            if missing:
                raise ValidationError({field: "This score is required to complete the assessment." for field in missing})

    def save(self, *args, **kwargs):
        if self.status == AssessmentStatus.COMPLETED and self.completed_at is None:
            self.completed_at = timezone.now()
        super().save(*args, **kwargs)

    @property
    def total_score(self) -> int:
        return sum(score or 0 for score in (self.phq9_score, self.gad7_score, self.pss10_score))

    def get_score_summary(self) -> dict:
        return {
            "phq9": self.phq9_score,
            "gad7": self.gad7_score,
            "pss10": self.pss10_score,
            "total": self.total_score,
        }

    def __str__(self):
        return f"{self.user_id}:{self.assessment_type}:{self.status}"


class Prediction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wellness_predictions",
    )
    assessment = models.OneToOneField(
        Assessment,
        on_delete=models.CASCADE,
        related_name="prediction",
    )
    category = models.CharField(
        max_length=20,
        choices=WellnessCategory.choices,
        db_index=True,
    )
    confidence = models.DecimalField(
        max_digits=5,
        decimal_places=4,
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
    )
    trend_signal = models.CharField(
        max_length=20,
        choices=TrendSignal.choices,
        default=TrendSignal.UNKNOWN,
        db_index=True,
    )
    model_name = models.CharField(max_length=80, default="random_forest")
    model_version = models.CharField(max_length=40, blank=True, default="")
    input_snapshot = models.JSONField(default=dict, blank=True)
    explanation = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "category"]),
            models.Index(fields=["user", "trend_signal"]),
        ]

    def __str__(self):
        return f"{self.user_id}:{self.category}:{self.created_at:%Y-%m-%d}"


class Recommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wellness_recommendations",
    )
    prediction = models.ForeignKey(
        Prediction,
        on_delete=models.CASCADE,
        related_name="recommendations",
    )
    recommendation_type = models.CharField(
        max_length=40,
        choices=RecommendationType.choices,
        default=RecommendationType.GENERAL_WELLNESS,
        db_index=True,
    )
    title = models.CharField(max_length=120)
    body = models.TextField()
    priority = models.PositiveSmallIntegerField(
        default=3,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    dismissed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["priority", "-created_at"]
        indexes = [
            models.Index(fields=["user", "is_active", "priority"]),
            models.Index(fields=["prediction", "priority"]),
        ]

    def dismiss(self):
        if self.dismissed_at is None:
            self.is_active = False
            self.dismissed_at = timezone.now()
            self.save(update_fields=["is_active", "dismissed_at"])

    def __str__(self):
        return f"{self.user_id}:{self.recommendation_type}:{self.title}"
