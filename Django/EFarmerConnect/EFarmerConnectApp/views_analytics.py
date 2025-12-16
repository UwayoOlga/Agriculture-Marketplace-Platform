from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count, F, Avg
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from django.utils import timezone
from datetime import timedelta, datetime
from .models import Order, User, Product, OrderItem

class SalesAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'ADMIN' and not request.user.is_superuser:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Period: '7d', '30d', '12m', 'all'
        period = request.query_params.get('period', '30d')
        now = timezone.now()
        
        start_date = now - timedelta(days=30)
        trunc_func = TruncDay('order_date')

        if period == '7d':
             start_date = now - timedelta(days=7)
        elif period == '12m':
             start_date = now - timedelta(days=365)
             trunc_func = TruncMonth('order_date')
        elif period == 'all':
             start_date = now - timedelta(days=365*5) # Cap at 5 years for safety
             trunc_func = TruncMonth('order_date')

        # Sales Over Time
        sales_data = Order.objects.filter(
            status__in=['PAID', 'COMPLETED'],
            order_date__gte=start_date
        ).annotate(
            date=trunc_func
        ).values('date').annotate(
            revenue=Sum('total_amount'),
            orders=Count('id')
        ).order_by('date')

        # Key Metrics
        total_revenue = Order.objects.filter(status__in=['PAID', 'COMPLETED']).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_orders = Order.objects.filter(status__in=['PAID', 'COMPLETED']).count()
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

        # Format for frontend
        chart_data = []
        for entry in sales_data:
            chart_data.append({
                'date': entry['date'].strftime('%Y-%m-%d'),
                'revenue': entry['revenue'],
                'orders': entry['orders']
            })

        return Response({
            'chart_data': chart_data,
            'summary': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'avg_order_value': avg_order_value
            }
        })

class UserAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'ADMIN':
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        now = timezone.now()
        start_date = now - timedelta(days=30)
        
        # User Growth (last 6 months by month)
        growth_start = now - timedelta(days=180)
        user_growth = User.objects.filter(date_joined__gte=growth_start).annotate(
            month=TruncMonth('date_joined')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')

        growth_chart = [{'date': entry['month'].strftime('%Y-%m'), 'users': entry['count']} for entry in user_growth]

        # Activity Stats (Active vs Inactive)
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        farmers = User.objects.filter(user_type='FARMER').count()
        buyers = User.objects.filter(user_type='BUYER').count()

        return Response({
            'growth_chart': growth_chart,
            'stats': {
                'total': total_users,
                'active': active_users,
                'farmers': farmers,
                'buyers': buyers
            }
        })

class ProductAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'user_type', None) != 'ADMIN':
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # Top Performing Products (by Revenue)
        top_products = OrderItem.objects.filter(
            order__status__in=['PAID', 'COMPLETED']
        ).values(
            'product__name', 'product__farmer__username'
        ).annotate(
            revenue=Sum(F('quantity') * F('price_at_time')),
            quantity_sold=Sum('quantity')
        ).order_by('-revenue')[:10]

        formatted_top = [
            {
                'name': item['product__name'],
                'farmer': item['product__farmer__username'],
                'revenue': item['revenue'],
                'sold': item['quantity_sold']
            } 
            for item in top_products
        ]

        # Low Stock Alert
        low_stock = Product.objects.filter(stock__lt=50).values('id', 'name', 'stock', 'farmer__username')[:10]

        return Response({
            'top_products': formatted_top,
            'low_stock': list(low_stock)
        })

class CustomReportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, 'user_type', None) != 'ADMIN' and not request.user.is_superuser:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        metrics = data.get('metrics', []) # ['revenue', 'users', 'products']

        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d') if start_date_str else timezone.now() - timedelta(days=30)
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d') if end_date_str else timezone.now()
        except ValueError:
             return Response({'error': 'Invalid date format'}, status=400)

        report = {}

        if 'revenue' in metrics:
            sales = Order.objects.filter(
                status__in=['PAID', 'COMPLETED'],
                order_date__range=[start_date, end_date]
            ).aggregate(
                total=Sum('total_amount'),
                count=Count('id')
            )
            report['sales'] = sales

        if 'users' in metrics:
            new_users = User.objects.filter(
                date_joined__range=[start_date, end_date]
            ).count()
            report['new_users'] = new_users

        if 'products' in metrics:
            new_products = Product.objects.filter(
                created_at__range=[start_date, end_date]
            ).count()
            report['new_products'] = new_products

        return Response(report)
