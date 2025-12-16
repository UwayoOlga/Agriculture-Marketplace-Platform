import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Divider,
    Alert,
    CircularProgress,
    Stack
} from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../context/CartContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';
import { useSnackbar } from 'notistack';

const Checkout = () => {
    const { cart, total, clearCart, removeFromCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();

    // Get selected items from navigation state, or use all cart items as fallback
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [checkoutTotal, setCheckoutTotal] = useState(0);

    useEffect(() => {
        const selectedItems = location.state?.selectedItems || cart;
        setCheckoutItems(selectedItems);
        const total = selectedItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        setCheckoutTotal(total);
    }, [location.state, cart]);

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
    const [orderData, setOrderData] = useState(null);

    const [shippingInfo, setShippingInfo] = useState({
        address: user?.address || '',
        phone: user?.phone_number || '',
        notes: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('MTN_MOMO');
    const [paymentDetails, setPaymentDetails] = useState({
        phone: user?.phone_number || '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });



    // Modified to finish after order creation - only remove checked out items
    const finishCheckout = () => {
        // Remove only the items that were checked out
        checkoutItems.forEach(item => {
            removeFromCart(item.id);
        });
        setStep(2); // Success step
    };

    const handleShippingSubmit = async (e) => {
        e.preventDefault();
        if (!shippingInfo.address || !shippingInfo.phone) {
            enqueueSnackbar('Please fill in address and phone number', { variant: 'error' });
            return;
        }

        // Create Order Request
        try {
            setLoading(true);
            const payload = {
                shipping_address: shippingInfo.address,
                delivery_notes: shippingInfo.notes,
                items: checkoutItems.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await apiClient.post('/orders/', payload);
            setOrderData(response.data);
            finishCheckout();
            enqueueSnackbar('Order request sent to farmer!', { variant: 'success' });
        } catch (error) {
            console.error('Order creation failed:', error);
            enqueueSnackbar(error.response?.data?.error || 'Failed to create order', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Payment is now handled in Orders page after approval
    // const handlePaymentSubmit = ... (Removed)

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    if (checkoutItems.length === 0) {
        navigate('/products');
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom align="center">
                Checkout
            </Typography>

            {/* Progress Indicators */}
            <Box display="flex" justifyContent="center" mb={4}>
                <Stack direction="row" spacing={2}>
                    <Typography color={step >= 1 ? 'primary.main' : 'text.disabled'} fontWeight={step === 1 ? 700 : 400}>1. Shipping & Request</Typography>
                    <Typography color="text.disabled">{'>'}</Typography>
                    <Typography color={step >= 2 ? 'primary.main' : 'text.disabled'} fontWeight={step === 2 ? 700 : 400}>2. Confirmation</Typography>
                </Stack>
            </Box>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: '1px solid #e0e0e0' }}>

                {step === 1 && (
                    <form onSubmit={handleShippingSubmit}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <LocalShippingIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Shipping Details</Typography>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Delivery Address"
                                    value={shippingInfo.address}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Phone Number"
                                    value={shippingInfo.phone}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Delivery Notes (Optional)"
                                    value={shippingInfo.notes}
                                    onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                                Total: {formatPrice(checkoutTotal)}
                            </Typography>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Request Order'}
                            </Button>
                        </Box>
                    </form>
                )}

                {step === 2 && (
                    <Box textAlign="center" py={4}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                            Order Request Sent!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Your order #{orderData?.id} has been sent to the farmer for approval.
                            <br />
                            Please check "My Orders" to track the status. You can make payment once the farmer accepts.
                        </Typography>
                        <Box mt={3} display="flex" justifyContent="center" gap={2}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/products')}
                            >
                                Continue Shopping
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/orders')}
                            >
                                Go to My Orders
                            </Button>
                        </Box>
                    </Box>
                )}

            </Paper>
        </Container>
    );
};

export default Checkout;
