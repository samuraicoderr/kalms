from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone

from src.lib.utils.uuid7 import uuid7


class MoodLogSource(models.TextChoices):
    DAILY_CHECK_IN = "daily_check_in", "Daily check-in"
    JOURNAL = "journal", "Journal"
    MANUAL = "manual", "Manual"


class MoodLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid7, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="mood_logs",
    )
    log_date = models.DateField(default=timezone.localdate, db_index=True)
    mood_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    energy_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    stress_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )
    mood_label = models.CharField(max_length=40, blank=True, default="")
    note = models.TextField(blank=True, default="")
    source = models.CharField(
        max_length=20,
        choices=MoodLogSource.choices,
        default=MoodLogSource.DAILY_CHECK_IN,
        db_index=True,
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-log_date", "-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "log_date"], name="unique_mood_log_per_user_day"),
        ]
        indexes = [
            models.Index(fields=["user", "-log_date"]),
            models.Index(fields=["user", "source", "-log_date"]),
        ]

    def clean(self):
        if self.log_date and self.log_date > timezone.localdate():
            raise ValidationError({"log_date": "Mood logs cannot be dated in the future."})

    @property
    def wellness_score(self) -> int:
        return self.mood_score + self.energy_score + (11 - self.stress_score)

    def __str__(self):
        return f"{self.user_id}:{self.log_date}:mood={self.mood_score}"
