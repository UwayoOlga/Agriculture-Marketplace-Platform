import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Chip,
    Rating,
    Divider,
    IconButton,
    Paper,
    CircularProgress,
    Alert,
    TextField,
    Card,
    CardMedia
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import apiClient from '../api/apiClient';
import { useCart } from '../context/CartContext';
import { useSnackbar } from 'notistack';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { enqueueSnackbar } = useSnackbar();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/products/${id}/`);
                setProduct(response.data);
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && (!product.stock || newQuantity <= product.stock)) {
            setQuantity(newQuantity);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            // Feedback handled by CartContext but we can also do custom logic if needed
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/products')}
                    sx={{ mb: 2 }}
                >
                    Back to Products
                </Button>
                <Alert severity="error">{error || 'Product not found'}</Alert>
            </Container>
        );
    }

    // Handle images: prefer backend images list, fallback to single image, or placeholder
    const images = product.images && product.images.length > 0
        ? product.images.map(img => img.image)
        : [product.image || '/src/assets/images/placeholder.svg'];

    const mainImage = images[selectedImage] || images[0];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/products')}
                sx={{ mb: 3 }}
            >
                Back to Products
            </Button>

            <Paper elevation={0} sx={{ p: 0, bgcolor: 'background.default' }}>
                <Grid container spacing={4}>
                    {/* Left Column: Images */}
                    <Grid item xs={12} md={6}>
                        <Card sx={{ borderRadius: 4, overflow: 'hidden', mb: 2, boxShadow: 2 }}>
                            <Box
                                sx={{
                                    position: 'relative',
                                    width: '100%',
                                    paddingTop: '75%', // 4:3 Aspect Ratio
                                    bgcolor: '#fff'
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={mainImage}
                                    alt={product.name}
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        p: 2
                                    }}
                                    onError={(e) => {
                                        e.target.src = '/src/assets/images/placeholder.svg';
                                    }}
                                />
                            </Box>
                        </Card>

                        {images.length > 1 && (
                            <Box display="flex" gap={2} overflow="auto" pb={1}>
                                {images.map((img, index) => (
                                    <Card
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            cursor: 'pointer',
                                            border: selectedImage === index ? '2px solid #2e7d32' : '1px solid #ddd',
                                            flexShrink: 0
                                        }}
                                    >
                                        <CardMedia
                                            component="img"
                                            image={img}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Grid>

                    {/* Right Column: Details */}
                    <Grid item xs={12} md={6}>
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Typography variant="h4" fontWeight={700} gutterBottom component="h1">
                                    {product.name}
                                </Typography>
                                {product.is_organic && (
                                    <Chip
                                        label="ORGANIC"
                                        color="success"
                                        size="small"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                )}
                            </Box>

                            <Box display="flex" alignItems="center" mb={2}>
                                <Rating value={product.rating || 0} precision={0.5} readOnly />
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                    ({product.review_count || 0} reviews)
                                </Typography>
                            </Box>

                            <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
                                {formatPrice(product.price)}
                                <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                                    / {product.unit || 'unit'}
                                </Typography>
                            </Typography>

                            <Typography variant="body1" paragraph color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                                {product.description || 'No description available.'}
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <StoreIcon color="action" sx={{ mr: 1 }} />
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Sold by
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {product.farmer_full_name || product.farmer_name || product.farmer?.username || 'Unknown Farmer'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <LocationOnIcon color="action" sx={{ mr: 1 }} />
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary">
                                                Location
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {product.farm_location || product.location || 'Rwanda'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                {product.harvest_date && (
                                    <Grid item xs={6}>
                                        <Box display="flex" alignItems="center">
                                            <CalendarMonthIcon color="action" sx={{ mr: 1 }} />
                                            <Box>
                                                <Typography variant="caption" display="block" color="text.secondary">
                                                    Harvest Date
                                                </Typography>
                                                <Typography variant="body2">
                                                    {product.harvest_date}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                                <Grid item xs={6}>
                                    <Box display="flex" alignItems="center">
                                        <Typography variant="caption" sx={{ mr: 1, color: 'text.secondary' }}>
                                            Stock:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} color={product.stock > 0 ? 'success.main' : 'error.main'}>
                                            {product.stock > 0 ? `${product.stock} ${product.unit} available` : 'Out of Stock'}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            <Box display="flex" alignItems="center" gap={3}>
                                <Box display="flex" alignItems="center" border="1px solid #ddd" borderRadius={1}>
                                    <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <Typography sx={{ px: 2, fontWeight: 600 }}>{quantity}</Typography>
                                    <IconButton onClick={() => handleQuantityChange(1)} disabled={product.stock && quantity >= product.stock}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>

                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<AddShoppingCartIcon />}
                                    onClick={handleAddToCart}
                                    disabled={!product.stock || product.stock < 1}
                                    sx={{
                                        flexGrow: 1,
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        borderRadius: 2
                                    }}
                                >
                                    Add to Cart
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default ProductDetails;
