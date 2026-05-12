from datetime import timedelta

from django.db.models import Avg, Count
from django.utils import timezone

from src.moods.models import MoodLog


def mood_label_for_score(score: int | None) -> str:
    if score is None:
        return ""
    if score >= 8:
        return "clear"
    if score >= 6:
        return "steady"
    if score >= 4:
        return "tender"
    return "heavy"


def build_mood_points(*, user, start_date, end_date) -> list[dict]:
    logs = {
        log.log_date: log
        for log in MoodLog.objects.filter(user=user, log_date__gte=start_date, log_date__lte=end_date)
    }
    total_days = (end_date - start_date).days + 1
    points = []
    for offset in range(total_days):
        day = start_date + timedelta(days=offset)
        log = logs.get(day)
        mood_score = log.mood_score if log else None
        points.append(
            {
                "date": day.isoformat(),
                "day_label": day.strftime("%a"),
                "mood_score": mood_score,
                "energy_score": log.energy_score if log else None,
                "stress_score": log.stress_score if log else None,
                "wellness_score": log.wellness_score if log else None,
                "mood_label": (log.mood_label if log and log.mood_label else mood_label_for_score(mood_score)),
                "has_log": log is not None,
            }
        )
    return points


def build_mood_summary(*, user, days: int = 7) -> dict:
    days = max(1, min(days, 90))
    end_date = timezone.localdate()
    start_date = end_date - timedelta(days=days - 1)
    qs = MoodLog.objects.filter(user=user, log_date__gte=start_date, log_date__lte=end_date)
    aggregates = qs.aggregate(
        count=Count("id"),
        mood_average=Avg("mood_score"),
        energy_average=Avg("energy_score"),
        stress_average=Avg("stress_score"),
    )
    return {
        "date_from": start_date.isoformat(),
        "date_to": end_date.isoformat(),
        "days": days,
        "count": aggregates["count"] or 0,
        "averages": {
            "mood": round(float(aggregates["mood_average"] or 0), 1),
            "energy": round(float(aggregates["energy_average"] or 0), 1),
            "stress": round(float(aggregates["stress_average"] or 0), 1),
        },
        "points": build_mood_points(user=user, start_date=start_date, end_date=end_date),
    }
