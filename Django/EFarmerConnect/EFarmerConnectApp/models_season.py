from django.db import models
from django.utils.translation import gettext_lazy as _

class AgriculturalSeason(models.Model):
    SEASON_CHOICES = [
        ('A', 'Season A (September-February)'),
        ('B', 'Season B (March-June)'),
        ('C', 'Season C (July-September)'),
    ]
    
    name = models.CharField(max_length=1, choices=SEASON_CHOICES, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Agricultural Season")
        verbose_name_plural = _("Agricultural Seasons")
        ordering = ['start_date']
    
    def __str__(self):
        return f"{self.get_name_display()} ({self.start_date.year})"
    
    def save(self, *args, **kwargs):
        # Ensure only one season is active at a time
        if self.is_active:
            AgriculturalSeason.objects.filter(is_active=True).update(is_active=False)
        super().save(*args, **kwargs)

class CropCalendar(models.Model):
    PRIORITY_CROPS = [
        ('MAIZE', 'Maize'),
        ('BEANS', 'Beans'),
        ('POTATO', 'Irish Potatoes'),
        ('SWEET_POTATO', 'Sweet Potatoes'),
        ('CASSAVA', 'Cassava'),
        ('RICE', 'Rice'),
        ('BANANAS', 'Bananas'),
    ]
    
    crop = models.CharField(max_length=20, choices=PRIORITY_CROPS)
    season = models.ForeignKey(AgriculturalSeason, on_delete=models.CASCADE, related_name='crop_calendars')
    planting_start = models.DateField()
    planting_end = models.DateField()
    harvest_start = models.DateField()
    harvest_end = models.DateField()
    growing_period_days = models.PositiveIntegerField(help_text="Average growing period in days", default=90)
    notes = models.TextField(blank=True)
    
    class Meta:
        verbose_name = _("Crop Calendar")
        verbose_name_plural = _("Crop Calendars")
        ordering = ['crop', 'season']
        unique_together = [['crop', 'season']]
    
    def __str__(self):
        return f"{self.get_crop_display()} - {self.season}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        if self.planting_start > self.planting_end:
            raise ValidationError("Planting start date must be before planting end date.")
        if self.harvest_start > self.harvest_end:
            raise ValidationError("Harvest start date must be before harvest end date.")
        if self.planting_end > self.harvest_start:
            raise ValidationError("Planting period must end before harvest period starts.")

class FarmerSeasonPlan(models.Model):
    farmer = models.ForeignKey('User', on_delete=models.CASCADE, limit_choices_to={'user_type': 'FARMER'})
    season = models.ForeignKey(AgriculturalSeason, on_delete=models.CASCADE)
    crop = models.CharField(max_length=20, choices=CropCalendar.PRIORITY_CROPS)
    planned_planting_date = models.DateField()
    actual_planting_date = models.DateField(null=True, blank=True)
    planned_harvest_date = models.DateField()
    actual_harvest_date = models.DateField(null=True, blank=True)
    plot_size = models.DecimalField(max_digits=10, decimal_places=2, help_text="Plot size in hectares")
    expected_yield = models.DecimalField(max_digits=10, decimal_places=2, help_text="Expected yield in kg")
    actual_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Actual yield in kg")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = _("Farmer's Season Plan")
        verbose_name_plural = _("Farmers' Season Plans")
        ordering = ['farmer', 'season', 'crop']
        unique_together = [['farmer', 'season', 'crop']]
    
    def __str__(self):
        return f"{self.farmer}'s {self.get_crop_display()} plan for {self.season}"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        from django.utils import timezone
        
        # Check if the crop is suitable for the selected season
        if not CropCalendar.objects.filter(crop=self.crop, season=self.season).exists():
            raise ValidationError(f"{self.get_crop_display()} is not typically planted in {self.season}")
        
        # Validate dates against season
        if self.planned_planting_date < self.season.start_date or self.planned_planting_date > self.season.end_date:
            raise ValidationError("Planned planting date must be within the season dates.")
            
        if self.planned_harvest_date < self.planned_planting_date:
            raise ValidationError("Planned harvest date must be after planned planting date.")
            
        if self.actual_planting_date and self.actual_planting_date > timezone.now().date():
            raise ValidationError("Actual planting date cannot be in the future.")
            
        if self.actual_harvest_date and self.actual_harvest_date > timezone.now().date():
            raise ValidationError("Actual harvest date cannot be in the future.")
