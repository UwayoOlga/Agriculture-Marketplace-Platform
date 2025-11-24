import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Rating,
  IconButton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';

// Sample images - replace with your actual imports
const img1 = 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400';
const img2 = 'https://images.unsplash.com/photo-1564594985645-4427056e22e2?w=400';
const img3 = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
const img4 = 'https://images.unsplash.com/photo-1471943311424-646960669fbc?w=400';
const img5 = 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400';
const img6 = 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400';
const img7 = 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400';

const productImages = [img1, img2, img3, img4, img5, img6, img7];

const fallbackImages = {
  coffee: img1,
  tea: img2,
  grains: img3,
  legumes: img4,
  rootCrops: img5,
  spices: img6,
  avocadoes: img7,
};

// Sample products with ratings and badges
const sampleProducts = [
  { id: 1, name: 'Rwandan Arabica Coffee', price: 9000, rating: 4.5, reviews: 128, badge: 'Best Seller' },
  { id: 2, name: 'Rwandan Tea Leaves', price: 6000, rating: 4.8, reviews: 95, badge: 'Top Rated' },
  { id: 3, name: 'East African Highland Bananas', price: 3000, rating: 4.3, reviews: 67 },
  { id: 4, name: 'Rwandan Red Beans', price: 3000, rating: 4.6, reviews: 89 },
  { id: 5, name: 'Rwandan Passion Fruits', price: 5000, rating: 4.7, reviews: 112, badge: 'Hot Sale' },
  { id: 6, name: 'Rwandan Avocados', price: 7000, rating: 4.4, reviews: 76 },
  { id: 7, name: 'Organic Spices Mix', price: 4500, rating: 4.9, reviews: 143, badge: 'Top Rated' },
  { id: 8, name: 'Fresh Root Vegetables', price: 2500, rating: 4.2, reviews: 54 },
];

const getProductImage = (index) => {
  return productImages[index % productImages.length];
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 }
};

const fadeInDown = {
  hidden: { opacity: 0, y: -60 },
  visible: { opacity: 1, y: 0 }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const Home = () => {
  return (
    <Box sx={{ overflowX: 'hidden', bgcolor: '#f8f9fa' }}>
      {/* Hero Section */}
      <Box 
        component="section" 
        sx={{ 
          position: 'relative',
          height: { xs: '500px', md: '600px' },
          mb: 6,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url(${fallbackImages.grains})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
            zIndex: 0
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInDown}
            transition={{ duration: 0.8 }}
          >
            <Typography 
              variant="overline" 
              sx={{ 
                color: '#ffd700', 
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                letterSpacing: '3px',
                fontWeight: 600,
                mb: 2,
                display: 'block'
              }}
            >
              100% ORGANIC GUARANTEE
            </Typography>
          </motion.div>
          
          <motion.div
            initial="hidden"
            animate="visible"
            variants={scaleIn}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                color: '#fff', 
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              Fresh Agricultural Products
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                mb: 4,
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.5rem' }
              }}
            >
              From Rwanda's finest farms to your table
            </Typography>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Button 
              component={Link} 
              to="/products" 
              variant="contained" 
              size="large"
              sx={{
                backgroundColor: '#6ba41b',
                color: '#fff',
                px: 5,
                py: 1.8,
                fontSize: '1.1rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                borderRadius: '50px',
                boxShadow: '0 8px 20px rgba(107, 164, 27, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#ffd700',
                  color: '#000',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 28px rgba(255, 215, 0, 0.5)'
                }
              }}
            >
              Shop Now
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Top Products Section - Amazon-style Grid */}
      <Box component="section" sx={{ py: 6, backgroundColor: '#fff' }}>
        <Container maxWidth="xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInDown}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography 
                variant="h3" 
                component="h2" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  color: '#232f3e'
                }}
              >
                Top Products
              </Typography>
              <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                Best sellers across all categories
              </Typography>
              <Box sx={{ width: 80, height: 4, bgcolor: '#6ba41b', mx: 'auto', borderRadius: 2 }} />
            </Box>
          </motion.div>

          <Grid container spacing={3}>
            {sampleProducts.map((product, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={index % 4 === 0 ? fadeInLeft : index % 4 === 1 ? fadeInUp : index % 4 === 2 ? fadeInDown : fadeInRight}
                  transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
                >
                  <Card
                    sx={{ 
                      height: '100%',
                      display: 'flex', 
                      flexDirection: 'column',
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'visible',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
                        '& .product-actions': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      }
                    }}
                  >
                    {product.badge && (
                      <Chip 
                        label={product.badge}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2,
                          bgcolor: product.badge === 'Best Seller' ? '#ff6b35' : product.badge === 'Hot Sale' ? '#ff4757' : '#6ba41b',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }}
                      />
                    )}

                    <Box 
                      className="product-actions"
                      sx={{ 
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        opacity: 0,
                        transform: 'translateY(-10px)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <IconButton 
                        sx={{ 
                          bgcolor: 'white', 
                          boxShadow: 2,
                          '&:hover': { bgcolor: '#ff4757', color: 'white' }
                        }}
                        size="small"
                      >
                        <Heart size={18} />
                      </IconButton>
                      <IconButton 
                        sx={{ 
                          bgcolor: 'white', 
                          boxShadow: 2,
                          '&:hover': { bgcolor: '#6ba41b', color: 'white' }
                        }}
                        size="small"
                      >
                        <ShoppingCart size={18} />
                      </IconButton>
                    </Box>

                    <Box sx={{ 
                      width: '100%',
                      height: 250,
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5',
                      position: 'relative'
                    }}>
                      <Box 
                        component="img" 
                        src={getProductImage(index)} 
                        alt={product.name}
                        sx={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.6s ease',
                          '&:hover': {
                            transform: 'scale(1.15)'
                          }
                        }} 
                      />
                    </Box>

                    <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          color: '#232f3e',
                          minHeight: '2.5em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.3
                        }}
                      >
                        {product.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                        <Rating value={product.rating} precision={0.1} size="small" readOnly />
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          ({product.reviews})
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: '#B12704',
                            fontWeight: 700,
                            fontSize: '1.4rem'
                          }}
                        >
                          {product.price.toLocaleString()}
                          <Typography component="span" variant="body2" sx={{ fontSize: '0.9rem', ml: 0.5 }}>
                            RWF
                          </Typography>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#007600', fontWeight: 600 }}>
                          In Stock
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: 2,
                          bgcolor: '#ffd814',
                          color: '#000',
                          fontWeight: 600,
                          borderRadius: '20px',
                          py: 1,
                          '&:hover': {
                            bgcolor: '#f7ca00'
                          }
                        }}
                      >
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Banner Section */}
      <Box component="section" sx={{ py: 6, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInLeft}
                transition={{ duration: 0.7 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 300,
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${fallbackImages.rootCrops})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      filter: 'brightness(0.5)',
                      transition: 'filter 0.3s ease'
                    },
                    '&:hover::before': {
                      filter: 'brightness(0.6)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, p: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#ffd700', mb: 1, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>
                      Premium Quality
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#fff', fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '3rem' } }}>
                      100% Organic<br/>Vegetables
                    </Typography>
                    <Button
                      component={Link}
                      to="/products"
                      variant="contained"
                      sx={{
                        alignSelf: 'flex-start',
                        bgcolor: '#fff',
                        color: '#000',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: '30px',
                        '&:hover': {
                          bgcolor: '#ffd700'
                        }
                      }}
                    >
                      Discover Now →
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInRight}
                transition={{ duration: 0.7 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 300,
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, p: 5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#000', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>
                      Limited Time
                    </Typography>
                    <Typography variant="h2" sx={{ color: '#000', fontWeight: 800, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                      Great<br/>Deal's
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#B12704', fontWeight: 700, mb: 2 }}>
                      Up to 50% OFF
                    </Typography>
                    <Button
                      component={Link}
                      to="/products"
                      variant="contained"
                      sx={{
                        alignSelf: 'flex-start',
                        bgcolor: '#000',
                        color: '#fff',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: '30px',
                        '&:hover': {
                          bgcolor: '#333'
                        }
                      }}
                    >
                      Shop Sale →
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;