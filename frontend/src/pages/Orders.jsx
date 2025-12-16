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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Stack
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // For Banks
import CreditCardIcon from '@mui/icons-material/CreditCard';
import apiClient from '../api/apiClient';
import { useSnackbar } from 'notistack';

const PaymentModal = ({ open, onClose, order, onPaymentSuccess }) => {
    const [method, setMethod] = useState('MTN_MOMO');
    const [details, setDetails] = useState({ phone: '', accountNumber: '' });
    const [loading, setLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                payment_method: method,
                amount: order.total_amount,
                phone_number: (method.includes('MOMO') || method.includes('AIRTEL')) ? details.phone : undefined
            };

            await apiClient.post(`/orders/${order.id}/payment/`, payload);
            enqueueSnackbar('Payment successful!', { variant: 'success' });
            onPaymentSuccess();
            onClose();
        } catch (error) {
            console.error('Payment error:', error);
            enqueueSnackbar(error.response?.data?.error || 'Payment failed.', { variant: 'error' });
        } finally {
            setLoading(false);
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

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Pay for Order #{order?.id}</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom variant="h6" color="primary" align="center">
                    Total: {formatPrice(order?.total_amount)}
                </Typography>

                <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
                    <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)}>
                        {/* Mobile Money */}
                        <Paper variant="outlined" sx={{ mb: 1, p: 1, bgcolor: method === 'MTN_MOMO' ? '#f0f9ff' : 'white' }}>
                            <FormControlLabel value="MTN_MOMO" control={<Radio />} label={
                                <Box display="flex" alignItems="center"><PhoneAndroidIcon sx={{ color: '#ffcc00', mr: 1 }} /> MTN Mobile Money</Box>
                            } />
                        </Paper>
                        <Paper variant="outlined" sx={{ mb: 1, p: 1, bgcolor: method === 'AIRTEL_MONEY' ? '#fff0f0' : 'white' }}>
                            <FormControlLabel value="AIRTEL_MONEY" control={<Radio />} label={
                                <Box display="flex" alignItems="center"><PhoneAndroidIcon sx={{ color: 'red', mr: 1 }} /> Airtel Money</Box>
                            } />
                        </Paper>

                        {/* Banks */}
                        <Paper variant="outlined" sx={{ mb: 1, p: 1, bgcolor: method === 'BANK_BK' ? '#e3f2fd' : 'white' }}>
                            <FormControlLabel value="BANK_BK" control={<Radio />} label={
                                <Box display="flex" alignItems="center"><AccountBalanceIcon sx={{ color: '#1565c0', mr: 1 }} /> Bank of Kigali (BK)</Box>
                            } />
                        </Paper>
                        <Paper variant="outlined" sx={{ mb: 1, p: 1, bgcolor: method === 'BANK_EQUITY' ? '#fbe9e7' : 'white' }}>
                            <FormControlLabel value="BANK_EQUITY" control={<Radio />} label={
                                <Box display="flex" alignItems="center"><AccountBalanceIcon sx={{ color: '#a1887f', mr: 1 }} /> Equity Bank</Box>
                            } />
                        </Paper>
                    </RadioGroup>
                </FormControl>

                <Box mt={3}>
                    {(method === 'MTN_MOMO' || method === 'AIRTEL_MONEY') && (
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={details.phone}
                            onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                            placeholder="07..."
                        />
                    )}
                    {(method === 'BANK_BK' || method === 'BANK_EQUITY') && (
                        <TextField
                            label="Bank Account Number"
                            fullWidth
                            value={details.accountNumber}
                            onChange={(e) => setDetails({ ...details, accountNumber: e.target.value })}
                            placeholder="Account Number"
                        />
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || ((method.includes('MOMO') || method.includes('AIRTEL')) && !details.phone)}
                >
                    {loading ? <CircularProgress size={24} /> : 'Pay Now'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const OrderRow = ({ order, onPay }) => {
    const [open, setOpen] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID':
            case 'COMPLETED': return 'success';
            case 'PENDING_PAYMENT': return 'info'; // Actionable
            case 'PENDING_CONFIRMATION': return 'warning';
            case 'REJECTED': case 'CANCELLED': case 'FAILED': return 'error';
            default: return 'default';
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

    // Check if order needs user action (Pay)
    const canPay = order.status === 'PENDING_PAYMENT';
    // User request (pending confirmation)
    const isPending = order.status === 'PENDING_CONFIRMATION';
    // Order is paid - can download receipt
    const isPaid = order.status === 'PAID';

    const handleDownloadReceipt = async (e) => {
        e.stopPropagation();
        try {
            const response = await apiClient.get(`/orders/${order.id}/receipt/`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt_order_${order.id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download receipt:', error);
        }
    };

    return (
        <Card variant="outlined" sx={{ mb: 2, borderColor: canPay ? 'primary.main' : undefined, borderWidth: canPay ? 2 : 1 }}>
            <CardHeader
                avatar={
                    <Box bgcolor={getStatusColor(order.status) + '.light'} p={1} borderRadius="50%" display="flex">
                        <ShoppingBagIcon color={getStatusColor(order.status)} />
                    </Box>
                }
                action={
                    <Box display="flex" alignItems="center">
                        {canPay && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); onPay(order); }}
                                sx={{ mr: 1 }}
                            >
                                Pay Now
                            </Button>
                        )}
                        {isPaid && (
                            <Button
                                variant="outlined"
                                color="success"
                                size="small"
                                onClick={handleDownloadReceipt}
                                sx={{ mr: 1 }}
                            >
                                Download Receipt
                            </Button>
                        )}
                        <IconButton onClick={() => setOpen(!open)} size="small">
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </Box>
                }
                title={
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" fontWeight={600}>Order #{order.id}</Typography>
                        <Chip
                            label={order.status.replace('_', ' ')}
                            color={getStatusColor(order.status)}
                            size="small"
                        />
                    </Box>
                }
                subheader={
                    <Typography variant="body2" color="text.secondary">
                        {new Date(order.order_date).toLocaleDateString()} • {formatPrice(order.total_amount)}
                        {isPending && <Typography component="span" color="warning.main" ml={1}>(Waiting for approval)</Typography>}
                    </Typography>
                }
            />
            <Collapse in={open} timeout="auto" unmountOnExit>
                <CardContent>
                    <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1 }}>
                        {order.items && order.items.map((item, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">{item.quantity} x {item.product?.name || item.product_name}</Typography>
                                <Typography variant="body2">{formatPrice(item.price_at_time || item.price)}</Typography>
                            </Box>
                        ))}
                    </Box>
                    {order.rejection_reason && (
                        <Box mt={2} p={2} bgcolor="#ffebee" borderRadius={1}>
                            <Typography color="error" variant="body2"><strong>Rejection Reason:</strong> {order.rejection_reason}</Typography>
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
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/orders/');
            // Sort: Pending Payment first, then Date
            const sorted = (response.data || []).sort((a, b) => {
                if (a.status === 'PENDING_PAYMENT' && b.status !== 'PENDING_PAYMENT') return -1;
                if (b.status === 'PENDING_PAYMENT' && a.status !== 'PENDING_PAYMENT') return 1;
                return new Date(b.order_date) - new Date(a.order_date);
            });
            setOrders(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ mb: 2 }}>Home</Button>
            <Typography variant="h4" fontWeight={700} mb={3}>My Orders</Typography>

            {loading ? <CircularProgress /> : orders.length === 0 ? (
                <Typography align="center" color="text.secondary">No orders found.</Typography>
            ) : (
                orders.map(order => (
                    <OrderRow key={order.id} order={order} onPay={(o) => setSelectedOrder(o)} />
                ))
            )}

            <PaymentModal
                open={!!selectedOrder}
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onPaymentSuccess={fetchOrders}
            />
        </Container>
    );
};

export default Orders;
