import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, IconButton, Badge } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AddShoppingCart, Remove, Add } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import placeholder from '../assets/images/placeholder.svg';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [cartItemId, setCartItemId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user || user.user_type !== 'BUYER') {
      enqueueSnackbar('Only buyers can add items to cart. Please log in as a buyer.', { variant: 'warning' });
      return;
    }

    try {
      const resp = await api.post('/cart/items/', { product: product.id, quantity: 1 });
      if (resp.data && resp.data.id) setCartItemId(resp.data.id);
      setQuantity(prev => prev + 1);
      enqueueSnackbar('Added to cart', { variant: 'success' });
    } catch (err) {
      console.error('Add to cart failed', err);
      enqueueSnackbar('Failed to add to cart', { variant: 'error' });
    }
  };

  const handleRemoveFromCart = async () => {
    if (quantity <= 0) return;

    if (cartItemId) {
      try {
        await api.delete(`/cart/items/${cartItemId}/`);
        setCartItemId(null);
        setQuantity(prev => Math.max(0, prev - 1));
        enqueueSnackbar('Removed from cart', { variant: 'success' });
        return;
      } catch (err) {
        console.error('Remove failed', err);
        enqueueSnackbar('Failed to remove item from cart', { variant: 'error' });
      }
    }

    // Fallback: decrement locally
    setQuantity(prev => Math.max(0, prev - 1));
  };

  const handleImageError = (e) => {
    setImageError(true);
    if (e?.target) e.target.src = placeholder;
  };

  return (
    <Card
      component={motion.div}
      whileHover={{ y: -5, boxShadow: 3 }}
      transition={{ duration: 0.3 }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        '&:hover .product-actions': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      }}
    >
      <Box sx={{ position: 'relative', pt: '100%', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          image={!imageError ? (product.images?.[0]?.image || product.image || placeholder) : placeholder}
          alt={product.name}
          onError={handleImageError}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        />
        {product.is_organic && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'success.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              zIndex: 1,
            }}
          >
            Organic
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
            {product.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              mb: 2,
              minHeight: '4.5em',
            }}
          >
            {product.description}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography variant="h6" color="primary" fontWeight={700}>
            ${product.price.toFixed(2)}
          </Typography>
          
          {quantity > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={handleRemoveFromCart}
                sx={{
                  bgcolor: 'grey.200',
                  '&:hover': { bgcolor: 'grey.300' },
                }}
              >
                <Remove fontSize="small" />
              </IconButton>
              <Typography variant="body1">{quantity}</Typography>
              <IconButton
                size="small"
                onClick={handleAddToCart}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<AddShoppingCart />}
              onClick={handleAddToCart}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1,
                whiteSpace: 'nowrap',
              }}
            >
              Add to Cart
            </Button>
          )}
        </Box>
      </CardContent>

      <Box
        className="product-actions"
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          justifyContent: 'center',
          gap: 2,
          opacity: 0,
          transform: 'translateY(10px)',
          transition: 'all 0.3s ease',
        }}
      >
        <Button
          component={Link}
          to={`/products/${product.id}`}
          variant="outlined"
          size="small"
          sx={{ textTransform: 'none' }}
        >
          View Details
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddShoppingCart />}
          onClick={handleAddToCart}
          sx={{ textTransform: 'none' }}
        >
          Quick Add
        </Button>
      </Box>
    </Card>
  );
};

export default ProductCard;
