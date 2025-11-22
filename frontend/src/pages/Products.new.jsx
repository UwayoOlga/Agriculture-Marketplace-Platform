import { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
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
  InputAdornment
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { sampleProducts, sampleCategories } from '../data/sampleProducts';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    min_price: '',
    max_price: '',
    is_organic: false,
    location: ''
  });
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try to fetch from API first
        const response = await apiClient.get('/api/categories/');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          return;
        }
      } catch (error) {
        console.log('Using sample categories');
      }
      
      // Fallback to sample categories if API fails
      setCategories(sampleCategories);
    };
    
    fetchCategories();
  }, []);

  // Fetch products when filters or page changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
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
        
        // If API call fails or returns no data, use sample data with filters
        let filteredProducts = [...sampleProducts];
        
        // Apply filters to sample data
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
        setTotalPages(1); // Simple pagination for sample data
      } catch (error) {
        console.error('Error:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, page]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Render product cards
  const renderProductCards = () => {
    if (loading && products.length === 0) {
      return (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (products.length === 0) {
      return (
        <Box textAlign="center" my={4}>
          <Typography variant="h6">No products found. Try adjusting your filters.</Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image || 'https://via.placeholder.com/300'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', ml: 2 }}>
                    {formatPrice(product.price)}
                  </Typography>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {product.description.length > 100 
                    ? `${product.description.substring(0, 100)}...` 
                    : product.description}
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Chip 
                    label={product.category?.name || 'Uncategorized'} 
                    size="small" 
                    sx={{ 
                      mr: 1, 
                      mb: 1,
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText'
                    }}
                  />
                  {product.is_organic && (
                    <Chip 
                      label="Organic" 
                      color="success" 
                      size="small" 
                      sx={{ 
                        mb: 1,
                        color: 'white'
                      }}
                    />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {product.location}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <StoreIcon color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    {product.vendor || 'Local Farmer'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating 
                      value={product.rating || 0} 
                      precision={0.5} 
                      readOnly 
                      size="small" 
                      sx={{ mr: 0.5 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ({product.rating?.toFixed(1) || 'N/A'})
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {product.quantity || 10} {product.unit || 'kg'} available
                  </Typography>
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  variant="contained" 
                  fullWidth
                  onClick={() => handleViewDetails(product.id)}
                  startIcon={<VisibilityIcon />}
                  sx={{ 
                    bgcolor: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Rwandan Agricultural Products
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover fresh, high-quality produce from the heart of Rwanda
        </Typography>
      </Box>

      {/* Filters */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Filter Products
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search products"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              placeholder="e.g., coffee, bananas..."
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
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
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              name="min_price"
              type="number"
              value={filters.min_price}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              placeholder="Min"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0 }
              }}
            />
          </Grid>
          
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              name="max_price"
              type="number"
              value={filters.max_price}
              onChange={handleFilterChange}
              variant="outlined"
              size="small"
              placeholder="Max"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.is_organic}
                  onChange={handleFilterChange}
                  name="is_organic"
                  color="success"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src="https://img.icons8.com/color/24/000000/organic-food.png" 
                    alt="organic" 
                    style={{ marginRight: 8, width: 20, height: 20 }} 
                  />
                  <span>Organic Only</span>
                </Box>
              }
              sx={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem'
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={1}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setFilters({
                  search: '',
                  category: '',
                  min_price: '',
                  max_price: '',
                  is_organic: false,
                  location: ''
                });
                setPage(1);
              }}
              fullWidth
              sx={{ height: '40px' }}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Grid */}
      {renderProductCards()}

      {/* Pagination */}
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
      
      {/* Demo Notice */}
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Note: This is a demo with sample data. To connect to a real backend, ensure your API is running and properly configured.
        </Typography>
      </Box>
    </Container>
  );
};

export default Products;
