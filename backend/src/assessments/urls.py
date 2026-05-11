from rest_framework.routers import SimpleRouter

from src.assessments.views import AssessmentViewSet, DashboardViewSet, RecommendationViewSet


assessments_router = SimpleRouter()
assessments_router.register(r"assessments", AssessmentViewSet, basename="assessments")
assessments_router.register(r"recommendations", RecommendationViewSet, basename="recommendations")
assessments_router.register(r"dashboard", DashboardViewSet, basename="dashboard")

