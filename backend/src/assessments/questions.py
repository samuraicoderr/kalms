PHQ9_QUESTIONS = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself, or that you are a failure",
    "Trouble concentrating on things",
    "Moving or speaking slowly, or being unusually restless",
    "Thoughts that you would be better off dead or of hurting yourself",
]

GAD7_QUESTIONS = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen",
]

PSS10_QUESTIONS = [
    "Upset because of something that happened unexpectedly",
    "Unable to control important things in your life",
    "Felt nervous and stressed",
    "Felt confident about your ability to handle personal problems",
    "Felt that things were going your way",
    "Could not cope with all the things you had to do",
    "Able to control irritations in your life",
    "Felt that you were on top of things",
    "Angered because of things outside your control",
    "Felt difficulties were piling up so high you could not overcome them",
]

PSS10_REVERSE_SCORED_ITEMS = {4, 5, 7, 8}

QUESTIONNAIRE_VERSION = "mvp-v1"

ANSWER_SCALE_0_3 = [
    {"value": 0, "label": "Not at all"},
    {"value": 1, "label": "Several days"},
    {"value": 2, "label": "More than half the days"},
    {"value": 3, "label": "Nearly every day"},
]

ANSWER_SCALE_0_4 = [
    {"value": 0, "label": "Never"},
    {"value": 1, "label": "Almost never"},
    {"value": 2, "label": "Sometimes"},
    {"value": 3, "label": "Fairly often"},
    {"value": 4, "label": "Very often"},
]


def build_questionnaire_definition(
    *,
    assessment_type: str,
    title: str,
    description: str,
    questions: list[str],
    answer_scale: list[dict],
    max_score: int,
    reverse_scored_items: set[int] | None = None,
) -> dict:
    reverse_scored_items = reverse_scored_items or set()
    return {
        "assessment_type": assessment_type,
        "version": QUESTIONNAIRE_VERSION,
        "title": title,
        "description": description,
        "max_score": max_score,
        "answer_scale": answer_scale,
        "questions": [
            {
                "number": index,
                "key": str(index),
                "prompt": prompt,
                "is_reverse_scored": index in reverse_scored_items,
            }
            for index, prompt in enumerate(questions, start=1)
        ],
    }


def get_questionnaire_definitions() -> list[dict]:
    return [
        build_questionnaire_definition(
            assessment_type="phq9",
            title="PHQ-9 Assessment",
            description="Nine prompts about mood, sleep, energy, and interest over the last two weeks.",
            questions=PHQ9_QUESTIONS,
            answer_scale=ANSWER_SCALE_0_3,
            max_score=27,
        ),
        build_questionnaire_definition(
            assessment_type="gad7",
            title="GAD-7 Assessment",
            description="Seven prompts about anxiety, worry, restlessness, and tension over the last two weeks.",
            questions=GAD7_QUESTIONS,
            answer_scale=ANSWER_SCALE_0_3,
            max_score=21,
        ),
        build_questionnaire_definition(
            assessment_type="pss10",
            title="PSS-10 Assessment",
            description="Ten prompts about perceived stress, control, overload, and coping over the last month.",
            questions=PSS10_QUESTIONS,
            answer_scale=ANSWER_SCALE_0_4,
            max_score=40,
            reverse_scored_items=PSS10_REVERSE_SCORED_ITEMS,
        ),
    ]
