import { useState, useEffect, useMemo } from 'react';
import { 
  Container, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  CardActions, 
  Pagination,
  Checkbox,
  FormControlLabel,
  Paper,
  CircularProgress,
  Chip,
  Rating,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
  CardActionArea,
  Divider,
  Stack,
  Tooltip,
  Fade
} from '@mui/material';
import Grid from '@mui/material/Grid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { sampleProducts, sampleCategories } from '../data/sampleProducts';

// Import placeholder image
import placeholderImage from '../assets/images/placeholder.svg';

// List of available product images (relative paths)
const productImagePaths = [
  '1.jpg',
  '2.jpg',
  '3.jpg',
  '4.jpg',
  '5.jpg',
  '6.jpg',
  '7.jpg',
  'Coffee.jpg',
  'RWANDAN_Fresh_Passionfruit.jpg',
  'avocadoes.jpg',
  'legumes.jpg',
  'legumes2.jpg',
  'rootcrops.jpg',
  'spices.jpg'
];

// Function to get a random image path for a product
const getRandomProductImage = (id) => {
  const index = id ? (id % productImagePaths.length) : Math.floor(Math.random() * productImagePaths.length);
  return `/src/assets/images/${productImagePaths[index]}`;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    is_organic: false,
    location: ''
  });
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/api/categories/');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          return;
        }
      } catch (error) {
        console.log('Using sample categories');
      }
      
      setCategories(sampleCategories);
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        try {
          const queryParams = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
          });
          queryParams.append('page', page);

          const response = await apiClient.get(`/api/products/?${queryParams}`);
          if (response.data && response.data.results) {
            setProducts(response.data.results);
            setTotalPages(response.data.total_pages || 1);
            return;
          }
        } catch (error) {
          console.log('Using sample products data');
        }
        
        let filteredProducts = [...sampleProducts];
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchLower) || 
            p.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters.category) {
          filteredProducts = filteredProducts.filter(
            p => p.category.id.toString() === filters.category.toString()
          );
        }
        
        if (filters.min_price) {
          filteredProducts = filteredProducts.filter(
            p => p.price >= parseFloat(filters.min_price)
          );
        }
        
        if (filters.max_price) {
          filteredProducts = filteredProducts.filter(
            p => p.price <= parseFloat(filters.max_price)
          );
        }
        
        if (filters.is_organic) {
          filteredProducts = filteredProducts.filter(p => p.is_organic);
        }
        
        if (filters.location) {
          filteredProducts = filteredProducts.filter(
            p => p.location.toLowerCase().includes(filters.location.toLowerCase())
          );
        }
        
        setProducts(filteredProducts);
        setTotalPages(1); 
      } catch (error) {
        console.error('Error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, page]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      is_organic: false,
      location: ''
    });
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const renderProductCards = () => {
    if (loading && products.length === 0) {
      return (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
          flexDirection="column"
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
            Loading fresh products...
          </Typography>
        </Box>
      );
    }

    if (products.length === 0) {
      return (
        <Box 
          textAlign="center" 
          my={8} 
          p={4}
          bgcolor="background.paper"
          borderRadius={2}
          boxShadow={1}
        >
          <Box 
            component="img"
            src={placeholderImage}
            alt="No products"
            sx={{ 
              width: 200, 
              height: 200, 
              opacity: 0.7,
              mb: 2 
            }}
          />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            We couldn't find any products matching your filters.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={resetFilters}
            startIcon={<ClearIcon />}
          >
            Clear Filters
          </Button>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {products.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 50}ms` }}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    '& .product-image': {
                      transform: 'scale(1.05)'
                    }
                  }
                }}
              >
                <CardActionArea 
                  onClick={() => handleViewDetails(product.id)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <Box 
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: 200,
                      overflow: 'hidden',
                      bgcolor: 'background.paper'
                    }}
                  >
                    <Box
                      component="img"
                      src={product.image || getRandomProductImage(product.id || index)}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = placeholderImage;
                      }}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease-in-out'
                      }}
                    />
                    {product.is_organic && (
                      <Chip 
                        label="ORGANIC" 
                        size="small" 
                        color="success" 
                        sx={{ 
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          fontWeight: 700,
                          letterSpacing: 0.5,
                          fontSize: '0.65rem',
                          height: 24,
                          '& .MuiChip-label': {
                            px: 1.5
                          }
                        }}
                      />
                    )}
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3, pb: 1 }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.8em',
                        mb: 1.5,
                        color: 'text.primary',
                        fontSize: '1.1rem'
                      }}
                    >
                      {product.name}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={1.5}>
                      <Rating 
                        value={product.rating || 0} 
                        precision={0.5} 
                        readOnly 
                        size="small"
                        sx={{ 
                          mr: 1, 
                          color: theme.palette.secondary.main,
                          '& .MuiRating-iconFilled': {
                            color: theme.palette.secondary.main
                          }
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        ({product.review_count || 0} reviews)
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <StoreIcon color="action" fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.farmer?.username || 'Local Farmer'}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={2.5}>
                      <LocationOnIcon color="action" fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.location || 'Rwanda'}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto">
                      <Box>
                        <Typography variant="h6" color="primary" fontWeight={700}>
                          {formatPrice(product.price)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          per {product.unit || 'kg'}
                        </Typography>
                      </Box>
                      <Button
                        size="medium"
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(product.id);
                        }}
                        endIcon={<VisibilityIcon />}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.5,
                          py: 0.8,
                          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)'
                          }
                        }}
                      >
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>Filters</Typography>
            
            <TextField
              fullWidth
              label="Search products"
              variant="outlined"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleFilterChange('search', '')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Min Price"
                type="number"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
              <TextField
                fullWidth
                label="Max Price"
                type="number"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.is_organic}
                  onChange={(e) => handleFilterChange('is_organic', e.target.checked)}
                />
              }
              label="Organic Only"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Location"
              variant="outlined"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="outlined"
              onClick={resetFilters}
              color="error"
              startIcon={<ClearIcon />}
            >
              Clear Filters
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : products.length > 0 ? (
            <>
              {renderProductCards()}
              
              {totalPages > 1 && (
                <Box mt={4} display="flex" justifyContent="center">
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    showFirstButton
                    showLastButton
                    sx={{ '& .MuiPaginationItem-root': { borderRadius: 1 } }}
                  />
                </Box>
              )}
            </>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary">
                No products found matching your criteria
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={resetFilters}
                sx={{ mt: 2 }}
              >
                Clear Filters
              </Button>
            </Paper>
          )}
          
          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Note: This is a demo with sample data. To connect to a real backend, ensure your API is running and properly configured.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Products;