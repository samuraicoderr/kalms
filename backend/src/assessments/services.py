import os
import pickle
from decimal import Decimal

from django.db import transaction

from src.assessments.models import (
    Assessment,
    AssessmentStatus,
    AssessmentType,
    Prediction,
    Recommendation,
    TrendSignal,
    WellnessCategory,
)
from src.assessments.recommendation_rules import get_recommendation_templates
from src.assessments.questions import (
    GAD7_QUESTIONS,
    PHQ9_QUESTIONS,
    PSS10_QUESTIONS,
    PSS10_REVERSE_SCORED_ITEMS,
)
from src.moods.models import MoodLog


QUESTION_COUNTS = {
    AssessmentType.PHQ9: len(PHQ9_QUESTIONS),
    AssessmentType.GAD7: len(GAD7_QUESTIONS),
    AssessmentType.PSS10: len(PSS10_QUESTIONS),
}


def normalize_answer_map(raw_answers: dict, *, count: int, max_value: int) -> dict[str, int]:
    if not isinstance(raw_answers, dict):
        raise ValueError("Answers must be an object keyed by question number.")

    normalized = {}
    for index in range(1, count + 1):
        key = str(index)
        if key not in raw_answers:
            raise ValueError(f"Question {index} is required.")
        try:
            value = int(raw_answers[key])
        except (TypeError, ValueError) as exc:
            raise ValueError(f"Question {index} must be a number.") from exc
        if value < 0 or value > max_value:
            raise ValueError(f"Question {index} must be between 0 and {max_value}.")
        normalized[key] = value
    return normalized


def score_phq9(answers: dict) -> tuple[int, dict[str, int]]:
    normalized = normalize_answer_map(answers, count=len(PHQ9_QUESTIONS), max_value=3)
    return sum(normalized.values()), normalized


def score_gad7(answers: dict) -> tuple[int, dict[str, int]]:
    normalized = normalize_answer_map(answers, count=len(GAD7_QUESTIONS), max_value=3)
    return sum(normalized.values()), normalized


def score_pss10(answers: dict) -> tuple[int, dict[str, int]]:
    normalized = normalize_answer_map(answers, count=len(PSS10_QUESTIONS), max_value=4)
    scored = {}
    for key, value in normalized.items():
        question_number = int(key)
        scored[key] = 4 - value if question_number in PSS10_REVERSE_SCORED_ITEMS else value
    return sum(scored.values()), normalized


def calculate_scores(assessment_type: str, responses: dict) -> tuple[dict, dict]:
    responses = responses or {}
    scores = {"phq9_score": None, "gad7_score": None, "pss10_score": None}
    normalized = {}

    if assessment_type in (AssessmentType.PHQ9, AssessmentType.FULL_SCAN):
        raw = responses.get("phq9", responses if assessment_type == AssessmentType.PHQ9 else {})
        scores["phq9_score"], normalized["phq9"] = score_phq9(raw)

    if assessment_type in (AssessmentType.GAD7, AssessmentType.FULL_SCAN):
        raw = responses.get("gad7", responses if assessment_type == AssessmentType.GAD7 else {})
        scores["gad7_score"], normalized["gad7"] = score_gad7(raw)

    if assessment_type in (AssessmentType.PSS10, AssessmentType.FULL_SCAN):
        raw = responses.get("pss10", responses if assessment_type == AssessmentType.PSS10 else {})
        scores["pss10_score"], normalized["pss10"] = score_pss10(raw)

    return scores, normalized


def fallback_category(*, phq9_score=None, gad7_score=None, pss10_score=None, mood_log=None) -> tuple[str, Decimal]:
    phq9 = phq9_score or 0
    gad7 = gad7_score or 0
    pss10 = pss10_score or 0
    mood_risk = 0
    if mood_log:
        mood_risk = max(0, mood_log.stress_score - 6) + max(0, 5 - mood_log.mood_score)

    if phq9 >= 15 or gad7 >= 15 or pss10 >= 27 or mood_risk >= 5:
        return WellnessCategory.DISTRESSED, Decimal("0.8200")
    if phq9 >= 10 or gad7 >= 10 or pss10 >= 20 or mood_risk >= 3:
        return WellnessCategory.AT_RISK, Decimal("0.7600")
    return WellnessCategory.HEALTHY, Decimal("0.7200")


def predict_wellness(*, assessment: Assessment, mood_log: MoodLog | None) -> dict:
    model_path = os.getenv("KALMS_RANDOM_FOREST_MODEL_PATH", "").strip()
    features = [
        assessment.phq9_score or 0,
        assessment.gad7_score or 0,
        assessment.pss10_score or 0,
        mood_log.mood_score if mood_log else 0,
        mood_log.energy_score if mood_log else 0,
        mood_log.stress_score if mood_log else 0,
    ]

    if model_path and os.path.exists(model_path):
        try:
            with open(model_path, "rb") as model_file:
                model = pickle.load(model_file)
            raw_prediction = model.predict([features])[0]
            category = str(raw_prediction)
            if category not in WellnessCategory.values:
                category = {
                    "0": WellnessCategory.HEALTHY,
                    "1": WellnessCategory.AT_RISK,
                    "2": WellnessCategory.DISTRESSED,
                }.get(category, WellnessCategory.AT_RISK)

            confidence = None
            if hasattr(model, "predict_proba"):
                probabilities = model.predict_proba([features])[0]
                confidence = Decimal(str(round(float(max(probabilities)), 4)))

            return {
                "category": category,
                "confidence": confidence,
                "model_name": "random_forest",
                "model_version": os.getenv("KALMS_RANDOM_FOREST_MODEL_VERSION", ""),
                "explanation": "Random Forest prediction based on assessment scores and recent mood data.",
            }
        except Exception:
            pass

    category, confidence = fallback_category(
        phq9_score=assessment.phq9_score,
        gad7_score=assessment.gad7_score,
        pss10_score=assessment.pss10_score,
        mood_log=mood_log,
    )
    return {
        "category": category,
        "confidence": confidence,
        "model_name": "rules_fallback_random_forest_contract",
        "model_version": "mvp-fallback-v1",
        "explanation": "MVP fallback classifier. Set KALMS_RANDOM_FOREST_MODEL_PATH to use the trained Random Forest artifact.",
    }


def calculate_trend_signal(user) -> str:
    latest = list(MoodLog.objects.filter(user=user).order_by("-log_date")[:7])
    if len(latest) < 4:
        return TrendSignal.UNKNOWN
    newest = sum(log.wellness_score for log in latest[:3]) / 3
    older = sum(log.wellness_score for log in latest[-3:]) / 3
    if newest >= older + 2:
        return TrendSignal.IMPROVING
    if newest <= older - 2:
        return TrendSignal.WORSENING
    return TrendSignal.STABLE


def build_input_snapshot(assessment: Assessment, mood_log: MoodLog | None) -> dict:
    return {
        "scores": assessment.get_score_summary(),
        "latest_mood_log": {
            "log_date": mood_log.log_date.isoformat(),
            "mood_score": mood_log.mood_score,
            "energy_score": mood_log.energy_score,
            "stress_score": mood_log.stress_score,
        } if mood_log else None,
    }


@transaction.atomic
def submit_assessment(*, user, assessment_type: str, responses: dict, submitted_via: str = "web") -> Assessment:
    scores, normalized = calculate_scores(assessment_type, responses)
    assessment = Assessment.objects.create(
        user=user,
        assessment_type=assessment_type,
        status=AssessmentStatus.COMPLETED,
        responses=normalized,
        submitted_via=submitted_via,
        **scores,
    )

    latest_mood = MoodLog.objects.filter(user=user).order_by("-log_date").first()
    prediction_result = predict_wellness(assessment=assessment, mood_log=latest_mood)
    trend_signal = calculate_trend_signal(user)
    prediction = Prediction.objects.create(
        user=user,
        assessment=assessment,
        category=prediction_result["category"],
        confidence=prediction_result["confidence"],
        trend_signal=trend_signal,
        model_name=prediction_result["model_name"],
        model_version=prediction_result["model_version"],
        input_snapshot=build_input_snapshot(assessment, latest_mood),
        explanation=prediction_result["explanation"],
    )
    Recommendation.objects.bulk_create(
        Recommendation(user=user, prediction=prediction, **template)
        for template in get_recommendation_templates(prediction.category, trend_signal)
    )
    return assessment
