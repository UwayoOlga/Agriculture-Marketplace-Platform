import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

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

    const handleShippingSubmit = async (e) => {
        e.preventDefault();
        if (!shippingInfo.address || !shippingInfo.phone) {
            enqueueSnackbar('Please fill in address and phone number', { variant: 'error' });
            return;
        }

        // Create Order
        try {
            setLoading(true);
            const payload = {
                shipping_address: shippingInfo.address,
                delivery_notes: shippingInfo.notes,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            };

            const response = await apiClient.post('/orders/', payload);
            setOrderData(response.data);
            setStep(2);
            enqueueSnackbar('Order created successfully!', { variant: 'success' });
        } catch (error) {
            console.error('Order creation failed:', error);
            enqueueSnackbar(error.response?.data?.error || 'Failed to create order', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!orderData) return;

        try {
            setLoading(true);
            const payload = {
                payment_method: paymentMethod,
                phone_number: paymentMethod.includes('MOMO') || paymentMethod.includes('AIRTEL') ? paymentDetails.phone : undefined,
                amount: total
            };

            await apiClient.post(`/orders/${orderData.id}/payment/`, payload);

            // Success
            clearCart();
            setStep(3);
            enqueueSnackbar('Payment successful!', { variant: 'success' });
        } catch (error) {
            console.error('Payment failed:', error);
            enqueueSnackbar(error.response?.data?.error || 'Payment failed. Please try again.', { variant: 'error' });
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

    if (cart.length === 0 && step === 1) {
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
                    <Typography color={step >= 1 ? 'primary.main' : 'text.disabled'} fontWeight={step === 1 ? 700 : 400}>1. Shipping</Typography>
                    <Typography color="text.disabled">{'>'}</Typography>
                    <Typography color={step >= 2 ? 'primary.main' : 'text.disabled'} fontWeight={step === 2 ? 700 : 400}>2. Payment</Typography>
                    <Typography color="text.disabled">{'>'}</Typography>
                    <Typography color={step >= 3 ? 'primary.main' : 'text.disabled'} fontWeight={step === 3 ? 700 : 400}>3. Done</Typography>
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
                                Total: {formatPrice(total)}
                            </Typography>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Continue to Payment'}
                            </Button>
                        </Box>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handlePaymentSubmit}>
                        <Box display="flex" alignItems="center" mb={3}>
                            <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h6">Payment Method</Typography>
                        </Box>

                        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <Paper variant="outlined" sx={{ mb: 2, p: 2, bgcolor: paymentMethod === 'MTN_MOMO' ? '#f0f9ff' : 'white' }}>
                                    <FormControlLabel
                                        value="MTN_MOMO"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <PhoneAndroidIcon sx={{ mr: 1, color: '#ffcc00' }} />
                                                <Box>
                                                    <Typography fontWeight={600}>MTN Mobile Money</Typography>
                                                    <Typography variant="caption" color="text.secondary">Pay using your MTN phone number</Typography>
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </Paper>

                                <Paper variant="outlined" sx={{ mb: 2, p: 2, bgcolor: paymentMethod === 'AIRTEL_MONEY' ? '#fff0f0' : 'white' }}>
                                    <FormControlLabel
                                        value="AIRTEL_MONEY"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <PhoneAndroidIcon sx={{ mr: 1, color: '#ff0000' }} />
                                                <Box>
                                                    <Typography fontWeight={600}>Airtel Money</Typography>
                                                    <Typography variant="caption" color="text.secondary">Pay using your Airtel phone number</Typography>
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </Paper>

                                <Paper variant="outlined" sx={{ mb: 2, p: 2, bgcolor: paymentMethod === 'CARD' ? '#f0fff4' : 'white' }}>
                                    <FormControlLabel
                                        value="CARD"
                                        control={<Radio />}
                                        label={
                                            <Box display="flex" alignItems="center">
                                                <CreditCardIcon sx={{ mr: 1, color: '#2e7d32' }} />
                                                <Box>
                                                    <Typography fontWeight={600}>Credit / Debit Card</Typography>
                                                    <Typography variant="caption" color="text.secondary">Visa, Mastercard, etc.</Typography>
                                                </Box>
                                            </Box>
                                        }
                                    />
                                </Paper>
                            </RadioGroup>
                        </FormControl>

                        <Divider sx={{ my: 3 }} />

                        {(paymentMethod === 'MTN_MOMO' || paymentMethod === 'AIRTEL_MONEY') && (
                            <Box mb={3}>
                                <Typography gutterBottom>Enter Phone Number used for payment:</Typography>
                                <TextField
                                    fullWidth
                                    required
                                    label="Phone Number"
                                    value={paymentDetails.phone}
                                    onChange={(e) => setPaymentDetails({ ...paymentDetails, phone: e.target.value })}
                                    placeholder="07..."
                                />
                            </Box>
                        )}

                        {paymentMethod === 'CARD' && (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField fullWidth label="Card Number" placeholder="0000 0000 0000 0000" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="Expiry Date" placeholder="MM/YY" />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField fullWidth label="CVV" placeholder="123" />
                                </Grid>
                            </Grid>
                        )}

                        <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
                            <Button onClick={() => setStep(1)} disabled={loading}>
                                Back
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                color="primary"
                                sx={{ px: 4 }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : `Pay ${formatPrice(total)}`}
                            </Button>
                        </Box>
                    </form>
                )}

                {step === 3 && (
                    <Box textAlign="center" py={4}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                            Payment Successful!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Your order #{orderData?.id} has been placed successfully.
                            You will receive a notification shortly.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/products')}
                            sx={{ mt: 2 }}
                        >
                            Continue Shopping
                        </Button>
                    </Box>
                )}

            </Paper>
        </Container>
    );
};

export default Checkout;
