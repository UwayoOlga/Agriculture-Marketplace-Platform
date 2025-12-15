import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Chip,
    CircularProgress,
    Button,
    Divider,
    Card,
    CardContent,
    CardHeader,
    Collapse,
    IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import apiClient from '../api/apiClient';

const OrderRow = ({ order }) => {
    const [open, setOpen] = useState(false);

    // Status Color Logic
    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID':
            case 'COMPLETED':
                return 'success';
            case 'PENDING':
            case 'PENDING_CONFIRMATION':
                return 'warning';
            case 'CANCELLED':
            case 'REJECTED':
            case 'FAILED':
                return 'error';
            case 'DELIVERED':
                return 'info';
            default:
                return 'default';
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-RW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card variant="outlined" sx={{ mb: 2 }}>
            <CardHeader
                avatar={
                    <Box bgcolor={getStatusColor(order.status) + '.light'} p={1} borderRadius="50%" display="flex">
                        <ShoppingBagIcon color={getStatusColor(order.status)} />
                    </Box>
                }
                action={
                    <IconButton
                        onClick={() => setOpen(!open)}
                        aria-label="expand"
                        size="small"
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                }
                title={
                    <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            Order #{order.id}
                        </Typography>
                        <Chip
                            label={order.status.replace('_', ' ')}
                            color={getStatusColor(order.status)}
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                }
                subheader={
                    <Typography variant="body2" color="text.secondary">
                        {formatDate(order.order_date || order.created_at)} • {formatPrice(order.total_amount)}
                    </Typography>
                }
            />
            <Collapse in={open} timeout="auto" unmountOnExit>
                <CardContent>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Items:</Typography>
                        {order.items && order.items.map((item, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" mb={1} alignItems="center">
                                <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                        {item.product_name || item.product?.name || `Product #${item.product}`}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Quantity: {item.quantity}
                                    </Typography>
                                </Box>
                                <Typography variant="body2">
                                    {formatPrice(item.price_at_time || item.price)}
                                </Typography>
                            </Box>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                            <Typography fontWeight={600}>Total</Typography>
                            <Typography fontWeight={600}>{formatPrice(order.total_amount)}</Typography>
                        </Box>
                    </Box>

                    {order.shipping_address && (
                        <Box mt={2}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Shipping Address:
                            </Typography>
                            <Typography variant="body2">
                                {order.shipping_address}
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Collapse>
        </Card>
    );
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/orders/');
                // Sort orders by date descending (newest first)
                const sortedOrders = Array.isArray(response.data)
                    ? response.data.sort((a, b) => new Date(b.order_date || b.created_at) - new Date(a.order_date || a.created_at))
                    : [];
                setOrders(sortedOrders);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load your order history.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box display="flex" alignItems="center" mb={4}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mr: 2 }}>
                    Home
                </Button>
                <Typography variant="h4" fontWeight={700}>
                    My Orders
                </Typography>
            </Box>

            {error && (
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: '#ffebee', color: '#c62828' }}>
                        {error}
                    </Paper>
                </Grid>
            )}

            {!loading && !error && orders.length === 0 && (
                <Box textAlign="center" py={8}>
                    <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        You haven't placed any orders yet.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/products')}>
                        Start Shopping
                    </Button>
                </Box>
            )}

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    {orders.map((order) => (
                        <OrderRow key={order.id} order={order} />
                    ))}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Orders;
