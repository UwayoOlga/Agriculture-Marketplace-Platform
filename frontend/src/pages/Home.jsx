import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, CardMedia, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { sampleProducts } from './data/sampleProducts';

// Import images from assets
import coffeeImage from '../assets/Coffee.jpg';
import teaImage from '../assets/tea';
import grainsImage from '../assets/grains.webp';
import legumesImage from '../assets/legumes.jpg';
import rootCropsImage from '../assets/rootcrops.jpg';
import spicesImage from '../assets/spices.jpg';

const categories = [
  { id: 1, name: 'Coffee', image: coffeeImage, count: 12 },
  { id: 2, name: 'Tea', image: teaImage, count: 8 },
  { id: 3, name: 'Grains', image: grainsImage, count: 15 },
  { id: 4, name: 'Legumes', image: legumesImage, count: 10 },
  { id: 5, name: 'Root Crops', image: rootCropsImage, count: 7 },
  { id: 6, name: 'Spices', image: spicesImage, count: 5 },
];

const Home = () => {
  // Get first 5 products for the carousel
  const featuredProducts = sampleProducts.slice(0, 5);

  // Map product images to local assets
  const productImages = [
    coffeeImage,
    teaImage,
    legumesImage,
    rootCropsImage,
    grainsImage
  ];

  return (
    <Box>
      {/* Hero Section with Carousel */}
      <Box sx={{ 
        backgroundColor: 'background.paper',
        py: 8,
        mb: 4
      }}>
        <Carousel 
          showThumbs={false} 
          autoPlay 
          infiniteLoop 
          interval={5000}
          showStatus={false}
          showArrows={true}
        >
          {featuredProducts.map((product, index) => (
            <Box key={product.id} sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              height: '500px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%)'
            }}>
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'flex-start',
                p: 4
              }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    color: 'primary.main'
                  }}
                >
                  {product.name}
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  paragraph
                  sx={{ mb: 4, maxWidth: '600px' }}
                >
                  {product.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    component={Link} 
                    to={`/products/${product.id}`}
                    variant="contained" 
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    View Details
                  </Button>
                  <Button 
                    component={Link} 
                    to="/products"
                    variant="outlined" 
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Browse All Products
                  </Button>
                </Box>
              </Box>
              <Box sx={{ 
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4
              }}>
                <Box 
                  component="img"
                  src={productImages[index % productImages.length]}
                  alt={product.name}
                  sx={{ 
                    maxHeight: '400px',
                    maxWidth: '100%',
                    borderRadius: 2,
                    boxShadow: 3,
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Box>
          ))}
        </Carousel>
      </Box>

      {/* Featured Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Shop by Category
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 6, maxWidth: '700px', mx: 'auto' }}>
          Discover our wide range of fresh, high-quality agricultural products from Rwanda
        </Typography>
        
        <Grid container spacing={4}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6, transition: 'all 0.3s ease-in-out' } }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={category.image}
                  alt={category.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {category.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {category.count} products available
                  </Typography>
                  <Button 
                    component={Link} 
                    to={`/products?category=${category.name.toLowerCase()}`}
                    variant="outlined" 
                    size="small"
                    sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                  >
                    Shop Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
