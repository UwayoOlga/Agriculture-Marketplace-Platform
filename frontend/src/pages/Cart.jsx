import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Paper,
    IconButton,
    TextField,
    Divider,
    Checkbox,
    CircularProgress,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCart } from '../context/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, itemCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initialize all items as selected
    useEffect(() => {
        setSelectedItems(cart.map(item => item.id));
    }, [cart]);

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cart.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cart.map(item => item.id));
        }
    };

    const handleCheckout = async () => {
        if (selectedItems.length === 0) {
            enqueueSnackbar('Please select at least one item to checkout', { variant: 'warning' });
            return;
        }

        try {
            setLoading(true);

            // Get selected cart items
            const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));

            // Create order with selected items
            const response = await api.post('/orders/', {
                items: selectedCartItems.map(item => ({
                    product_id: item.product_id || item.id,
                    quantity: item.quantity
                })),
                shipping_address: user?.address || '',
                delivery_notes: ''
            });

            enqueueSnackbar('Order request sent to farmer! Awaiting approval.', { variant: 'success' });

            // Clear selected items from cart
            selectedCartItems.forEach(item => removeFromCart(item.id));

            // Navigate to orders page
            navigate('/orders');

        } catch (error) {
            console.error('Checkout error:', error);
            enqueueSnackbar(error.response?.data?.error || 'Failed to create order', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals for selected items only
    const selectedTotal = cart
        .filter(item => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    if (itemCount === 0) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom color="text.secondary">
                    Your cart is empty
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    Looks like you haven't added any products to your cart yet.
                </Typography>
                <Button
                    variant="contained"
                    onClick={() => navigate('/products')}
                    sx={{ mt: 2 }}
                >
                    Start Shopping
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Shopping Cart ({itemCount} items)
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                        {/* Select All Header */}
                        <Box p={2} bgcolor="#f5f5f5" display="flex" alignItems="center" gap={1}>
                            <Checkbox
                                checked={selectedItems.length === cart.length && cart.length > 0}
                                indeterminate={selectedItems.length > 0 && selectedItems.length < cart.length}
                                onChange={handleSelectAll}
                            />
                            <Typography variant="body2" fontWeight={600}>
                                Select All ({selectedItems.length} of {cart.length} selected)
                            </Typography>
                        </Box>
                        <Divider />
                        {cart.map((item) => (
                            <Box key={item.id}>
                                <Box p={2} display="flex" alignItems="center" gap={2}>
                                    {/* Checkbox */}
                                    <Checkbox
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                    />

                                    {/* Image */}
                                    <Box
                                        component="img"
                                        src={item.image || item.images?.[0]?.image || '/src/assets/images/placeholder.svg'}
                                        alt={item.name}
                                        sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                                        onError={(e) => { e.target.src = '/src/assets/images/placeholder.svg'; }}
                                    />

                                    {/* Details */}
                                    <Box flexGrow={1}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {item.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Unit Price: {formatPrice(item.price)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Sold by: {item.farmer_name || 'Farmer'}
                                        </Typography>
                                    </Box>

                                    {/* Quantity Controls */}
                                    <Box display="flex" alignItems="center" border="1px solid #ddd" borderRadius={1} height={32}>
                                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>
                                        <Typography variant="body2" sx={{ px: 1, minWidth: 24, textAlign: 'center' }}>
                                            {item.quantity}
                                        </Typography>
                                        <IconButton size="small" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Box>

                                    {/* Subtotal */}
                                    <Box minWidth={100} textAlign="right">
                                        <Typography variant="subtitle2" fontWeight={600}>
                                            {formatPrice(item.price * item.quantity)}
                                        </Typography>
                                    </Box>

                                    {/* Remove */}
                                    <IconButton color="error" onClick={() => removeFromCart(item.id)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </Box>
                                <Divider />
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: '#f9f9f9' }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            Order Summary
                        </Typography>

                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography color="text.secondary">Selected Items</Typography>
                            <Typography fontWeight={600}>{selectedItems.length} of {cart.length}</Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography color="text.secondary">Subtotal</Typography>
                            <Typography fontWeight={600}>{formatPrice(selectedTotal)}</Typography>
                        </Box>

                        <Box display="flex" justifyContent="space-between" mb={3}>
                            <Typography color="text.secondary">Delivery Fee</Typography>
                            <Typography fontWeight={600} color="success.main">Free</Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box display="flex" justifyContent="space-between" mb={3}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6" color="primary">{formatPrice(selectedTotal)}</Typography>
                        </Box>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={handleCheckout}
                            disabled={selectedItems.length === 0 || loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                            sx={{ py: 1.5, fontWeight: 700 }}
                        >
                            {loading ? 'Creating Order...' : `Checkout Selected Items (${selectedItems.length})`}
                        </Button>

                        <Button
                            fullWidth
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/products')}
                            sx={{ mt: 2 }}
                        >
                            Continue Shopping
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Cart;
