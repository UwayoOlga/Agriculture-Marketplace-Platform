from django.contrib import admin
from django.utils.html import format_html
from .models_season import AgriculturalSeason, CropCalendar, FarmerSeasonPlan
from .models import User, Product, Category

class AgriculturalSeasonAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'is_active', 'duration_days', 'status')
    list_filter = ('is_active', 'name')
    search_fields = ('name', 'description')
    date_hierarchy = 'start_date'
    ordering = ('-start_date',)
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Season Information', {
            'fields': ('name', 'start_date', 'end_date', 'is_active', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def duration_days(self, obj):
        return (obj.end_date - obj.start_date).days
    duration_days.short_description = 'Duration (days)'
    
    def status(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        if obj.start_date > today:
            return format_html('<span style="color: orange;">Upcoming</span>')
        elif obj.end_date < today:
            return format_html('<span style="color: gray;">Completed</span>')
        else:
            return format_html('<span style="color: green; font-weight: bold;">Active</span>')
    status.short_description = 'Status'

class CropCalendarAdmin(admin.ModelAdmin):
    list_display = ('crop_display', 'season_name', 'planting_period', 'harvest_period', 'growing_period')
    list_filter = ('season__name', 'crop')
    search_fields = ('crop', 'season__name', 'notes')
    date_hierarchy = 'planting_start'
    ordering = ('season__start_date', 'crop')
    
    def crop_display(self, obj):
        return obj.get_crop_display()
    crop_display.short_description = 'Crop'
    
    def season_name(self, obj):
        return str(obj.season)
    season_name.short_description = 'Season'
    
    def planting_period(self, obj):
        return f"{obj.planting_start.strftime('%b %d')} - {obj.planting_end.strftime('%b %d, %Y')}"
    planting_period.short_description = 'Planting Period'
    
    def harvest_period(self, obj):
        return f"{obj.harvest_start.strftime('%b %d')} - {obj.harvest_end.strftime('%b %d, %Y')}"
    harvest_period.short_description = 'Harvest Period'
    
    def growing_period(self, obj):
        return f"{obj.growing_period_days} days"
    growing_period.short_description = 'Growing Period'

class FarmerSeasonPlanAdmin(admin.ModelAdmin):
    list_display = ('farmer_name', 'crop_display', 'season_name', 'planting_status', 'harvest_status', 'plot_size_ha')
    list_filter = ('season__name', 'crop', 'season__is_active')
    search_fields = ('farmer__username', 'crop', 'notes')
    date_hierarchy = 'planned_planting_date'
    ordering = ('-season__start_date', 'farmer__username', 'crop')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('farmer',)
    
    fieldsets = (
        ('Plan Information', {
            'fields': ('farmer', 'season', 'crop', 'plot_size', 'expected_yield')
        }),
        ('Planting Details', {
            'fields': ('planned_planting_date', 'actual_planting_date')
        }),
        ('Harvest Details', {
            'fields': ('planned_harvest_date', 'actual_harvest_date', 'actual_yield')
        }),
        ('Additional Information', {
            'fields': ('notes', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def farmer_name(self, obj):
        return obj.farmer.username
    farmer_name.short_description = 'Farmer'
    farmer_name.admin_order_field = 'farmer__username'
    
    def crop_display(self, obj):
        return obj.get_crop_display()
    crop_display.short_description = 'Crop'
    
    def season_name(self, obj):
        return str(obj.season)
    season_name.short_description = 'Season'
    
    def planting_status(self, obj):
        if obj.actual_planting_date:
            return format_html('<span style="color: green;">✓ Planted on {}</span>', 
                             obj.actual_planting_date.strftime('%b %d, %Y'))
        elif obj.planned_planting_date:
            return format_html('<span style="color: orange;">Planned: {}</span>',
                             obj.planned_planting_date.strftime('%b %d, %Y'))
        return 'Not planned'
    planting_status.short_description = 'Planting Status'
    
    def harvest_status(self, obj):
        if obj.actual_harvest_date:
            return format_html('<span style="color: green;">✓ Harvested on {}</span>', 
                             obj.actual_harvest_date.strftime('%b %d, %Y'))
        elif obj.planned_harvest_date:
            return format_html('<span style="color: orange;">Expected: {}</span>',
                             obj.planned_harvest_date.strftime('%b %d, %Y'))
        return 'Not specified'
    harvest_status.short_description = 'Harvest Status'
    
    def plot_size_ha(self, obj):
        return f"{obj.plot_size} ha"
    plot_size_ha.short_description = 'Plot Size'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(farmer=request.user)
        return qs.select_related('farmer', 'season')

# Register models
admin.site.register(AgriculturalSeason, AgriculturalSeasonAdmin)
admin.site.register(CropCalendar, CropCalendarAdmin)
admin.site.register(FarmerSeasonPlan, FarmerSeasonPlanAdmin)

# Register other models if not already registered
if not admin.site.is_registered(User):
    admin.site.register(User)
if not admin.site.is_registered(Product):
    admin.site.register(Product)
if not admin.site.is_registered(Category):
    admin.site.register(Category)
