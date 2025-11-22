from rest_framework import serializers
from .models_season import AgriculturalSeason, CropCalendar, FarmerSeasonPlan

class AgriculturalSeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgriculturalSeason
        fields = '__all__'
        read_only_fields = ('is_active',)

class CropCalendarSerializer(serializers.ModelSerializer):
    season_name = serializers.CharField(source='season.__str__', read_only=True)
    crop_display = serializers.CharField(source='get_crop_display', read_only=True)

    class Meta:
        model = CropCalendar
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class FarmerSeasonPlanSerializer(serializers.ModelSerializer):
    farmer_username = serializers.CharField(source='farmer.username', read_only=True)
    season_name = serializers.CharField(source='season.__str__', read_only=True)
    crop_display = serializers.CharField(source='get_crop_display', read_only=True)
    
    class Meta:
        model = FarmerSeasonPlan
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def validate(self, data):
        # Get the crop calendar for validation
        try:
            crop_calendar = CropCalendar.objects.get(
                crop=data.get('crop'), 
                season=data.get('season')
            )
            
            # Validate planting date against season
            if 'planned_planting_date' in data:
                if not (crop_calendar.planting_start <= data['planned_planting_date'] <= crop_calendar.planting_end):
                    raise serializers.ValidationError({
                        'planned_planting_date': f'Planting date should be between {crop_calendar.planting_start} and {crop_calendar.planting_end} for this crop and season.'
                    })
            
            # Validate harvest date against planting date
            if 'planned_harvest_date' in data and 'planned_planting_date' in data:
                if data['planned_harvest_date'] <= data['planned_planting_date']:
                    raise serializers.ValidationError({
                        'planned_harvest_date': 'Harvest date must be after planting date.'
                    })
                
                # Check if harvest date is within a reasonable range
                max_days = crop_calendar.growing_period_days + 30  # Allow 30 days buffer
                if (data['planned_harvest_date'] - data['planned_planting_date']).days > max_days:
                    raise serializers.ValidationError({
                        'planned_harvest_date': f'Harvest date is too far from planting date. Maximum growing period for {data.get("crop")} is {crop_calendar.growing_period_days} days.'
                    })
            
            return data
            
        except CropCalendar.DoesNotExist:
            raise serializers.ValidationError({
                'crop': 'This crop is not suitable for the selected season.'
            })

class SeasonStatsSerializer(serializers.Serializer):
    season = serializers.CharField()
    total_farmers = serializers.IntegerField()
    total_crops = serializers.IntegerField()
    total_area = serializers.DecimalField(max_digits=12, decimal_places=2)
    expected_yield = serializers.DictField(child=serializers.DecimalField(max_digits=12, decimal_places=2))
    actual_yield = serializers.DictField(child=serializers.DecimalField(max_digits=12, decimal_places=2, allow_null=True))
