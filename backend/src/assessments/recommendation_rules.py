from src.assessments.models import RecommendationType, TrendSignal, WellnessCategory


RECOMMENDATION_RULESET_VERSION = "mvp-v1"

RECOMMENDATION_RULES = {
    WellnessCategory.DISTRESSED: [
        {
            "recommendation_type": RecommendationType.PROFESSIONAL_SUPPORT,
            "title": "Reach out for support",
            "body": "Consider speaking with a trusted person or your university counselling service soon. You do not have to handle this alone.",
            "priority": 1,
        },
        {
            "recommendation_type": RecommendationType.BREATHING,
            "title": "Use a short grounding reset",
            "body": "Try breathing in for four counts, holding for four, and breathing out for six. Repeat three times before your next task.",
            "priority": 2,
        },
    ],
    WellnessCategory.AT_RISK: [
        {
            "recommendation_type": RecommendationType.STUDY_BALANCE,
            "title": "Protect one lighter study block",
            "body": "Pick one demanding task for today and make the next block smaller than usual. Recovery time is part of the plan.",
            "priority": 2,
        },
        {
            "recommendation_type": RecommendationType.SLEEP,
            "title": "Watch sleep and energy",
            "body": "Low energy often makes stress feel louder. Keep one consistent bedtime target for the next few nights.",
            "priority": 3,
        },
    ],
    WellnessCategory.HEALTHY: [
        {
            "recommendation_type": RecommendationType.GENERAL_WELLNESS,
            "title": "Keep the check-in habit",
            "body": "Your current pattern looks steady. Keep logging mood, energy, and stress so changes are easier to notice early.",
            "priority": 3,
        },
        {
            "recommendation_type": RecommendationType.BREATHING,
            "title": "Use a small reset before study",
            "body": "A four-minute breathing pause before focused work can help keep stress from building quietly.",
            "priority": 4,
        },
    ],
}

TREND_RECOMMENDATION_RULES = {
    TrendSignal.WORSENING: [
        {
            "recommendation_type": RecommendationType.SOCIAL_SUPPORT,
            "title": "Tell someone how the week is going",
            "body": "Your recent check-ins are dipping. A short conversation with someone you trust can help you get grounded.",
            "priority": 2,
        }
    ],
}


def get_recommendation_templates(category: str, trend_signal: str) -> list[dict]:
    templates = list(RECOMMENDATION_RULES.get(category, RECOMMENDATION_RULES[WellnessCategory.HEALTHY]))
    return [*TREND_RECOMMENDATION_RULES.get(trend_signal, []), *templates]
