from django.contrib import admin

from .models import MoodLog


@admin.register(MoodLog)
class MoodLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "log_date", "mood_score", "energy_score", "stress_score", "source")
    list_filter = ("source", "log_date", "created_at")
    search_fields = ("user__email", "user__username", "mood_label", "note")
    readonly_fields = ("id", "created_at", "updated_at")
