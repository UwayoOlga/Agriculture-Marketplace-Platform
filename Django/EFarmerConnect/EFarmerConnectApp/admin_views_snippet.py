
# Admin Views
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Verify user is admin
        if request.user.user_type != 'ADMIN':
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)

        # 1. Total Users
        total_users = User.objects.count()

        # 2. Total Orders
        total_orders = Order.objects.count()

        # 3. Total Revenue (Sum of paid/completed orders)
        revenue = Order.objects.filter(
            status__in=['PAID', 'COMPLETED']
        ).aggregate(total=Sum('total_amount'))['total'] or 0

        # 4. Pending Requests (Orders waiting for farmer approval)
        pending_requests = Order.objects.filter(status='PENDING_APPROVAL').count()

        # 5. Recent Orders
        recent_orders_qs = Order.objects.all().order_by('-order_date')[:5]
        recent_orders_data = []
        for order in recent_orders_qs:
            recent_orders_data.append({
                'id': order.id,
                'customer_name': order.buyer.get_full_name() or order.buyer.username,
                'date': order.order_date,
                'amount': order.total_amount,
                'status': order.status
            })

        return Response({
            'users': total_users,
            'orders': total_orders,
            'revenue': revenue,
            'pending': pending_requests,
            'recent_orders': recent_orders_data
        })
