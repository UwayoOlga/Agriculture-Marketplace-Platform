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
        const response = await apiClient.get('/api/categories/');
        console.log('Categories API Response:', response);
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          console.log('Using sample categories');
          setCategories(sampleCategories);
        }
      } catch (error) {
        console.log('Error fetching categories, using sample data:', error);
        setCategories(sampleCategories);
      }
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
          // Build query string from filters
          const queryParams = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value) {
              queryParams.append(key, value);
            }
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
        
        // If API call fails or returns no data, use sample data
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
    // Reset to first page when filters change
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const renderProductCards = () => {
    if (loading && page === 1) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} lg={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {product.images?.[0]?.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={product.images[0].image}
                  alt={product.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {product.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description?.substring(0, 100)}...
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom>
                  ${product.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.stock} in stock • {product.location}
                </Typography>
                {product.is_organic && (
                  <Typography variant="caption" color="success.main" display="block">
                    Certified Organic
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  size="small" 
                  onClick={() => handleViewDetails(product.id)}
                >
                  View Details
                </Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  sx={{ ml: 'auto' }}
                  onClick={() => {}}
                >
                  Add to Cart
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
                          height="200"
                          image={product.images[0].image}
                          alt={product.name}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="h2">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {product.description?.substring(0, 100)}...
                        </Typography>
                        <Typography variant="h6" color="primary" gutterBottom>
                          ${product.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.stock} in stock • {product.location}
                        </Typography>
                        {product.is_organic && (
                          <Typography variant="caption" color="success.main" display="block">
                            Certified Organic
                          </Typography>
                        )}
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleViewDetails(product.id)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          sx={{ ml: 'auto' }}
                          onClick={() => {}}
                        >
                          Add to Cart
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4} mb={2}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary"
                    showFirstButton 
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Products;
