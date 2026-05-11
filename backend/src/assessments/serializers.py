from rest_framework import serializers

from src.assessments.models import Assessment, Prediction, Recommendation


class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = (
            "id",
            "recommendation_type",
            "title",
            "body",
            "priority",
            "is_active",
            "created_at",
            "dismissed_at",
        )
        read_only_fields = fields


class PredictionSerializer(serializers.ModelSerializer):
    recommendations = RecommendationSerializer(many=True, read_only=True)

    class Meta:
        model = Prediction
        fields = (
            "id",
            "category",
            "confidence",
            "trend_signal",
            "model_name",
            "model_version",
            "input_snapshot",
            "explanation",
            "recommendations",
            "created_at",
        )
        read_only_fields = fields


class AssessmentSerializer(serializers.ModelSerializer):
    prediction = PredictionSerializer(read_only=True)
    score_summary = serializers.SerializerMethodField()

    class Meta:
        model = Assessment
        fields = (
            "id",
            "assessment_type",
            "status",
            "phq9_score",
            "gad7_score",
            "pss10_score",
            "score_summary",
            "responses",
            "submitted_via",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
            "prediction",
        )
        read_only_fields = fields

    def get_score_summary(self, obj):
        return obj.get_score_summary()


class AssessmentDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = ("id", "assessment_type", "responses", "submitted_via", "created_at", "updated_at")
        read_only_fields = ("id", "created_at", "updated_at")

    def create(self, validated_data):
        return Assessment.objects.create(user=self.context["request"].user, **validated_data)


class AssessmentSubmissionSerializer(serializers.Serializer):
    assessment_type = serializers.ChoiceField(choices=Assessment._meta.get_field("assessment_type").choices)
    responses = serializers.JSONField()
    submitted_via = serializers.CharField(max_length=40, required=False, default="web", allow_blank=True)


class DashboardSummarySerializer(serializers.Serializer):
    total_assessments = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    latest_category = serializers.CharField(allow_null=True)
    trend_signal = serializers.CharField()
    latest_scores = serializers.DictField()
    weekly_mood = serializers.ListField()
    recommendations = RecommendationSerializer(many=True)

