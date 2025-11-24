import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Grid, 
  useMediaQuery, 
  useTheme,
  CardActionArea,
  CardActions,
  Chip,
  Rating,
  Skeleton
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import sampleProducts from "../data/sampleProducts";
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useSnackbar } from 'notistack';

// Fallback image URLs (in case local assets are missing)
const fallbackImages = {
  tea: 'https://images.unsplash.com/photo-1558168807-915c0e76a6e3?w=500&auto=format&fit=crop&q=80',
  coffee: 'https://images.unsplash.com/photo-1447933601403-0fb668e364db?w=500&auto=format&fit=crop&q=80',
  grains: 'https://images.unsplash.com/photo-1592921870789-04563d55042c?w=500&auto=format&fit=crop&q=80',
  legumes: 'https://images.unsplash.com/photo-1586201375761-83865001c8c4?w=500&auto=format&fit=crop&q=80',
  rootCrops: 'https://images.unsplash.com/photo-1518977676601-b53fcc967d48?w=500&auto=format&fit=crop&q=80',
  spices: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=500&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&auto=format&fit=crop&q=80'
};

// Function to safely get an image URL
const getImageUrl = (imageName) => {
  try {
    // First try to require the image
    const image = require(`../assets/images/${imageName}`);
    return image || fallbackImages.default;
  } catch (err) {
    // If that fails, try to match with fallback images
    const key = imageName?.toLowerCase().split('.')[0];
    return fallbackImages[key] || fallbackImages.default;
  }
};

// Use fallback images directly
const categoryImages = {
  coffee: fallbackImages.coffee,
  tea: fallbackImages.tea,
  grains: fallbackImages.grains,
  legumes: fallbackImages.legumes,
  rootCrops: fallbackImages.rootCrops,
  spices: fallbackImages.spices
};

// Function to handle image loading errors
const handleImageError = (e) => {
  const img = e.target;
  const category = img.alt.toLowerCase();
  if (fallbackImages[category]) {
    img.src = fallbackImages[category];
  }
};

// Enhanced categories with better descriptions
const categories = [
  { 
    id: 1, 
    name: 'Coffee', 
    image: categoryImages.coffee, 
    count: 12, 
    description: 'Premium Rwandan coffee beans, freshly harvested and roasted to perfection.' 
  },
  { 
    id: 2, 
    name: 'Tea', 
    image: categoryImages.tea, 
    count: 8, 
    description: 'Finest tea leaves from the highlands, rich in flavor and aroma.' 
  },
  { 
    id: 3, 
    name: 'Grains', 
    image: categoryImages.grains, 
    count: 15, 
    description: 'Nutritious grains including rice, maize, and sorghum for your daily needs.' 
  },
  { 
    id: 4, 
    name: 'Legumes', 
    image: categoryImages.legumes, 
    count: 10, 
    description: 'Protein-rich legumes including beans, peas, and lentils.' 
  },
  { 
    id: 5, 
    name: 'Root Crops', 
    image: categoryImages.rootCrops, 
    count: 7, 
    description: 'Fresh and organic root vegetables grown in fertile soils.' 
  },
  { 
    id: 6, 
    name: 'Spices', 
    image: categoryImages.spices, 
    count: 5, 
    description: 'Aromatic spices to enhance your culinary experience.' 
  },
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const Home = () => {
  // Get first 5 products for the carousel
  const featuredProducts = sampleProducts.slice(0, 5);

  // Product images with fallback
  const productImages = [
    { image: fallbackImages.coffee, fallback: fallbackImages.coffee },
    { image: fallbackImages.tea, fallback: fallbackImages.tea },
    { image: fallbackImages.grains, fallback: fallbackImages.grains },
    { image: fallbackImages.legumes, fallback: fallbackImages.legumes },
    { image: fallbackImages.rootCrops, fallback: fallbackImages.rootCrops }
  ];
  
  // Get product image with fallback
  const getProductImage = (index) => {
    const img = productImages[index % productImages.length];
    return {
      src: img.image || img.fallback,
      onError: (e) => {
        if (e.target.src !== img.fallback) {
          e.target.src = img.fallback;
        }
      }
    };
  };

  // Add animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      {/* Hero Section with Enhanced Carousel */}
      <Box 
        component="section"
        sx={{ 
          position: 'relative',
          overflow: 'hidden',
          height: { xs: 'auto', md: '85vh' },
          minHeight: { xs: '500px', md: '700px' },
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #e6e9f0 100%)',
          mb: 6,
          '& .carousel .slide': {
            background: 'transparent',
          },
          '& .control-arrow': {
            padding: '0 30px',
            '&:hover': {
              background: 'transparent',
            },
          },
        }}
      >
        <Carousel 
          showThumbs={false} 
          autoPlay 
          infiniteLoop 
          interval={6000}
          showStatus={false}
          showArrows={true}
          stopOnHover={false}
          swipeable={true}
          emulateTouch={true}
          dynamicHeight={false}
          className="carousel"
          renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                style={{
                  position: 'absolute',
                  zIndex: 2,
                  left: 15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: { xs: '40px', md: '50px' },
                  height: { xs: '40px', md: '50px' },
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                ←
              </button>
            )
          }
          renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <button
                type="button"
                onClick={onClickHandler}
                title={label}
                style={{
                  position: 'absolute',
                  zIndex: 2,
                  right: 15,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: { xs: '40px', md: '50px' },
                  height: { xs: '40px', md: '50px' },
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                →
              </button>
            )
          }
        >
          {featuredProducts.map((product, index) => (
            <Box 
              key={product.id} 
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                p: { xs: 2, md: 6 },
                height: { xs: 'auto', md: '90vh' },
                minHeight: '600px',
                background: 'transparent',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                  zIndex: 1,
                  '@media (max-width: 900px)': {
                    background: 'rgba(255,255,255,0.9)',
                  },
                },
              }}
            >
              <Box 
                sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: { xs: 'center', md: 'flex-start' },
                  justifyContent: 'center',
                  p: { xs: 2, md: 6 },
                  position: 'relative',
                  zIndex: 2,
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: { xs: '100%', md: '50%' },
                }}
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 800,
                      mb: 3,
                      color: 'primary.main',
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    component="p"
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      mb: 4, 
                      maxWidth: '600px',
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                      lineHeight: 1.6,
                    }}
                  >
                    {product.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 3,
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    width: '100%',
                    '& .MuiButton-root': {
                      borderRadius: '50px',
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '1rem',
                      px: 4,
                      py: 1.5,
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                      },
                    },
                  }}>
                    <Button 
                      component={Link} 
                      to={`/products/${product.id}`}
                      variant="contained" 
                      size="large"
                      color="primary"
                      sx={{
                        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      component={Link} 
                      to="/products"
                      variant="outlined" 
                      size="large"
                      sx={{
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          background: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      Browse All Products
                    </Button>
                  </Box>
                </motion.div>
              </Box>
              <Box 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: { xs: 2, md: 4 },
                  position: 'relative',
                  zIndex: 2,
                  height: { xs: '300px', md: '100%' },
                  width: '100%',
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, type: 'spring' }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box 
                    component="img"
                    {...getProductImage(index)}
                    alt={product.name}
                    sx={{ 
                      height: { xs: '100%', md: '80%' },
                      width: 'auto',
                      maxWidth: '100%',
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.02)',
                      },
                    }}
                  />
                </motion.div>
              </Box>
              
              {/* Decorative elements */}
              <Box 
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '40%',
                  height: '100%',
                  background: 'linear-gradient(45deg, #e3f2fd 0%, #bbdefb 100%)',
                  zIndex: 1,
                  clipPath: 'polygon(25% 0%, 100% 0%, 100% 100%, 0% 100%)',
                  '@media (max-width: 900px)': {
                    display: 'none',
                  },
                }}
              />
            </Box>
          ))}
        </Carousel>
      </Box>

      {/* Featured Categories Section */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                position: 'relative',
                display: 'inline-block',
                width: '100%',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #1976d2 0%, #4dabf5 100%)',
                  borderRadius: '2px',
                },
              }}
            >
              Shop by Category
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              align="center" 
              sx={{ 
                mb: 8, 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.7,
              }}
            >
              Discover our wide range of fresh, high-quality agricultural products from Rwanda's finest farmers.
              Each product is carefully selected to ensure the best quality for our customers.
            </Typography>
          </motion.div>
          
          <Grid container spacing={4}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={category.id}>
                <Card 
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{ 
                    position: 'relative',
                    height: '100%',
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: 3,
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                      '& .category-image': {
                        transform: 'scale(1.05)',
                      },
                      '& .category-overlay': {
                        opacity: 0.9,
                      },
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', overflow: 'hidden', height: '200px' }}>
                    <CardMedia
                      component="img"
                      height="100%"
                      image={typeof category.image === 'string' ? category.image : (category.image?.default || fallbackImages[category.name.toLowerCase()])}
                      alt={category.name}
                      onError={(e) => {
                        const img = e.target;
                        img.src = fallbackImages[category.name.toLowerCase()] || fallbackImages.coffee;
                      }}
                      sx={{
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease-in-out',
                        width: '100%',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    <Box 
                      className="category-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0) 100%)',
                        opacity: 0.7,
                        transition: 'opacity 0.3s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        p: 2,
                        color: 'white',
                      }}
                    >
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                        {category.count} items available
                      </Typography>
                    </Box>
                  </Box>
                  <CardContent 
                    className="category-content"
                    sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      p: 3,
                      backgroundColor: '#fefefe',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 3,
                        flexGrow: 1,
                        fontSize: '0.95rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {category.description}
                    </Typography>
                    <Button 
                      component={Link} 
                      to={`/products?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      variant="outlined" 
                      size="medium"
                      color="primary"
                      sx={{ 
                        mt: 'auto',
                        alignSelf: 'flex-start',
                        borderRadius: '50px',
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          backgroundColor: 'rgba(25, 118, 210, 0.04)',
                        },
                      }}
                    >
                      Explore {category.name}
                      <Box 
                        component="span" 
                        sx={{ 
                          ml: 1,
                          display: 'inline-flex',
                          transition: 'transform 0.3s ease',
                          'button:hover &': {
                            transform: 'translateX(3px)',
                          },
                        }}
                      >
                        →
                      </Box>
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              to="/products"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                px: 6,
                py: 1.5,
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              View All Categories
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Featured Products Section */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
                fontSize: { xs: '2rem', md: '2.5rem' },
                position: 'relative',
                display: 'inline-block',
                width: '100%',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '80px',
                  height: '4px',
                  background: 'linear-gradient(90deg, #1976d2 0%, #4dabf5 100%)',
                  borderRadius: '2px',
                },
              }}
            >
              Featured Products
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              align="center" 
              sx={{ 
                mb: 8, 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.7,
              }}
            >
              Explore our selection of premium agricultural products, carefully selected for their quality and freshness.
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {sampleProducts.slice(0, 6).map((product, index) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card 
                  component={motion.div}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.5, 
                    delay: (index % 3) * 0.1,
                    type: 'spring',
                    stiffness: 100,
                  }}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                      '& .product-image': {
                        transform: 'scale(1.05)',
                      },
                      '& .product-actions': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image || fallbackImages.coffee}
                    alt={product.name}
                    onError={(e) => {
                      e.target.src = fallbackImages.coffee;
                    }}
                    className="product-image"
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease-in-out',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="h6" color="primary">
                        ${product.price}
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        size="small"
                        component={Link}
                        to={`/products/${product.id}`}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
