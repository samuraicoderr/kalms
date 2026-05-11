from rest_framework import serializers

from src.moods.models import MoodLog


class MoodLogSerializer(serializers.ModelSerializer):
    wellness_score = serializers.IntegerField(read_only=True)

    class Meta:
        model = MoodLog
        fields = (
            "id",
            "log_date",
            "mood_score",
            "energy_score",
            "stress_score",
            "mood_label",
            "note",
            "source",
            "metadata",
            "wellness_score",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "wellness_score", "created_at", "updated_at")

    def create(self, validated_data):
        return MoodLog.objects.create(user=self.context["request"].user, **validated_data)

