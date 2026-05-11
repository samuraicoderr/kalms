from rest_framework.routers import SimpleRouter

from src.moods.views import MoodLogViewSet


moods_router = SimpleRouter()
moods_router.register(r"mood-logs", MoodLogViewSet, basename="mood-logs")

