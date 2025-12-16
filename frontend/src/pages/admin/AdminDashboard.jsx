import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Button,
    CircularProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    ShoppingBag as OrderIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    MoreVert as MoreVertIcon
} from '@mui/icons-material';
import apiClient from '../../api/apiClient';
import { useNavigate } from 'react-router-dom';

// Metric Card Component
const MetricCard = ({ title, value, icon, color, trend }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography color="textSecondary" gutterBottom variant="overline" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1f2c' }}>
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        bgcolor: `${color}15`,
                        p: 1.5,
                        borderRadius: 2,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </Box>
            </Box>
            {trend && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
                    <Typography variant="body2" color="success.main" fontWeight={500}>
                        {trend}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                        vs last month
                    </Typography>
                </Box>
            )}
        </CardContent>
    </Card>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: 0,
        orders: 0,
        revenue: 0,
        pending: 0,
        recent_orders: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await apiClient.get('/admin/dashboard-stats/');
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch admin stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={700} color="#1a1f2c">
                    Dashboard Overview
                </Typography>
                <Button variant="contained" color="primary">Generare Report</Button>
            </Box>

            {/* Metrics Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
                        <MetricCard
                            title="Total Users"
                            value={stats.users}
                            icon={<PeopleIcon />}
                            color="#2196f3"
                            trend={stats.users_trend}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                        <MetricCard
                            title="Total Orders"
                            value={stats.orders}
                            icon={<OrderIcon />}
                            color="#ff9800"
                            trend={stats.orders_trend}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    {/* Linking revenue to orders for now as analytics page doesn't exist separately */}
                    <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                        <MetricCard
                            title="Total Revenue"
                            value={stats.revenue !== undefined ? formatCurrency(stats.revenue) : 'RWF 0'}
                            icon={<MoneyIcon />}
                            color="#4caf50"
                            trend={stats.revenue_trend}
                        />
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                        <MetricCard
                            title="Pending Requests"
                            value={stats.pending}
                            icon={<TrendingUpIcon />}
                            color="#f44336"
                            trend={stats.pending_trend}
                        />
                    </Box>
                </Grid>
            </Grid>

            {/* Recent Activity Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Paper sx={{ p: 3, borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight={600}>Recent Orders</Typography>
                            <Button size="small">View All</Button>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stats.recent_orders && stats.recent_orders.length > 0 ? (
                                        stats.recent_orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell>#ORD-{order.id}</TableCell>
                                                <TableCell>{order.customer_name}</TableCell>
                                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{formatCurrency(order.amount)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={order.status}
                                                        color={
                                                            order.status === 'COMPLETED' || order.status === 'PAID' ? 'success' :
                                                                order.status === 'PENDING_APPROVAL' ? 'warning' : 'default'
                                                        }
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton size="small"><MoreVertIcon /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">No recent orders found</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Quick Actions</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Button variant="outlined" fullWidth color="primary" sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                                Add New User
                            </Button>
                            <Button variant="outlined" fullWidth color="success" sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                                Approve Farmer
                            </Button>
                            <Button variant="outlined" fullWidth color="warning" sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                                Review Products
                            </Button>
                            <Button variant="outlined" fullWidth color="info" sx={{ justifyContent: 'flex-start', py: 1.5 }}>
                                System Settings
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
