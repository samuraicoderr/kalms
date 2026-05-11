from django.contrib import admin

from .models import Assessment, Prediction, Recommendation


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "assessment_type",
        "status",
        "phq9_score",
        "gad7_score",
        "pss10_score",
        "completed_at",
    )
    list_filter = ("assessment_type", "status", "completed_at")
    search_fields = ("user__email", "user__username")
    readonly_fields = ("id", "created_at", "updated_at", "started_at")


@admin.register(Prediction)
class PredictionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "assessment", "category", "confidence", "trend_signal", "created_at")
    list_filter = ("category", "trend_signal", "model_name", "created_at")
    search_fields = ("user__email", "user__username", "model_version")
    readonly_fields = ("id", "created_at")


@admin.register(Recommendation)
class RecommendationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "recommendation_type", "title", "priority", "is_active", "created_at")
    list_filter = ("recommendation_type", "is_active", "priority", "created_at")
    search_fields = ("user__email", "title", "body")
    readonly_fields = ("id", "created_at", "dismissed_at")
