from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_season import (
    AgriculturalSeasonViewSet, 
    CropCalendarViewSet,
    FarmerSeasonPlanViewSet,
    SeasonStatsView
)

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'seasons', AgriculturalSeasonViewSet, basename='season')
router.register(r'crop-calendars', CropCalendarViewSet, basename='crop-calendar')
router.register(r'farm-plans', FarmerSeasonPlanViewSet, basename='farm-plan')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
    path('season-stats/', SeasonStatsView.as_view(), name='season-stats'),
    path('season-stats/<int:season_id>/', SeasonStatsView.as_view(), name='season-stats-detail'),
]
