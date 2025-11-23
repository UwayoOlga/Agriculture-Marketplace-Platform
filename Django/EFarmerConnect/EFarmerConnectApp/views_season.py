from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count, Q
from .models_season import AgriculturalSeason, CropCalendar, FarmerSeasonPlan
from .serializers_season import (
    AgriculturalSeasonSerializer, CropCalendarSerializer, 
    FarmerSeasonPlanSerializer, SeasonStatsSerializer
)

class CropCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        calendars = CropCalendar.objects.filter(farmer=request.user)
        serializer = CropCalendarSerializer(calendars, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CropCalendarSerializer(data={**request.data, 'farmer': request.user.id})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_staff or request.user.user_type == 'ADMIN'

class AgriculturalSeasonViewSet(viewsets.ModelViewSet):
    queryset = AgriculturalSeason.objects.all()
    serializer_class = AgriculturalSeasonSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        year = self.request.query_params.get('year')
        
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        if year:
            queryset = queryset.filter(
                Q(start_date__year=year) | Q(end_date__year=year)
            )
        return queryset.order_by('-start_date')
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        season = self.get_object()
        season.is_active = True
        season.save()
        return Response({'status': 'season activated'})
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        current_date = timezone.now().date()
        try:
            season = AgriculturalSeason.objects.get(
                start_date__lte=current_date,
                end_date__gte=current_date,
                is_active=True
            )
            serializer = self.get_serializer(season)
            return Response(serializer.data)
        except AgriculturalSeason.DoesNotExist:
            return Response(
                {'detail': 'No active season found for current date.'},
                status=status.HTTP_404_NOT_FOUND
            )

class CropCalendarViewSet(viewsets.ModelViewSet):
    queryset = CropCalendar.objects.all()
    serializer_class = CropCalendarSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        season = self.request.query_params.get('season')
        crop = self.request.query_params.get('crop')
        
        if season:
            queryset = queryset.filter(season_id=season)
        if crop:
            queryset = queryset.filter(crop=crop)
            
        return queryset.select_related('season')

class FarmerSeasonPlanViewSet(viewsets.ModelViewSet):
    serializer_class = FarmerSeasonPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = FarmerSeasonPlan.objects.all()
        
        # Farmers can only see their own plans
        if user.user_type == 'FARMER':
            queryset = queryset.filter(farmer=user)
        # Admins can see all plans
        elif user.is_staff or user.user_type == 'ADMIN':
            pass
        # Other users can only see public data
        else:
            return FarmerSeasonPlan.objects.none()
            
        # Apply filters
        season = self.request.query_params.get('season')
        crop = self.request.query_params.get('crop')
        farmer = self.request.query_params.get('farmer')
        
        if season:
            queryset = queryset.filter(season_id=season)
        if crop:
            queryset = queryset.filter(crop=crop)
        if farmer and (user.is_staff or user.user_type == 'ADMIN'):
            queryset = queryset.filter(farmer_id=farmer)
            
        return queryset.select_related('season', 'farmer')
    
    def perform_create(self, serializer):
        serializer.save(farmer=self.request.user)

class SeasonStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, season_id=None):
        if not season_id:
            # If no season_id provided, get the current active season
            try:
                current_season = AgriculturalSeason.objects.get(is_active=True)
                season_id = current_season.id
            except AgriculturalSeason.DoesNotExist:
                return Response(
                    {'error': 'No active season found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Get all plans for the season
        plans = FarmerSeasonPlan.objects.filter(season_id=season_id)
        
        # Calculate statistics
        total_farmers = plans.values('farmer').distinct().count()
        total_crops = plans.values('crop').distinct().count()
        total_area = plans.aggregate(total=Sum('plot_size'))['total'] or 0
        
        # Calculate expected and actual yields by crop
        expected_yield = {}
        actual_yield = {}
        
        for crop in FarmerSeasonPlan.PRIORITY_CROPS:
            crop_plans = plans.filter(crop=crop[0])
            if crop_plans.exists():
                expected_yield[crop[1]] = crop_plans.aggregate(
                    total=Sum('expected_yield')
                )['total'] or 0
                actual_yield[crop[1]] = crop_plans.aggregate(
                    total=Sum('actual_yield')
                )['total']
        
        data = {
            'season': AgriculturalSeason.objects.get(id=season_id).__str__(),
            'total_farmers': total_farmers,
            'total_crops': total_crops,
            'total_area': total_area,
            'expected_yield': expected_yield,
            'actual_yield': actual_yield,
        }
        
        serializer = SeasonStatsSerializer(data)
        return Response(serializer.data)
