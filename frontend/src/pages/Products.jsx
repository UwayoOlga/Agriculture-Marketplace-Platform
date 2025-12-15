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
  Fade,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  Avatar,
  alpha,
  InputBase,
  styled,
  ButtonBase,
  Grid
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StoreIcon from '@mui/icons-material/Store';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CategoryIcon from '@mui/icons-material/Category';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../api/apiClient';
import { sampleProducts, sampleCategories } from '../data/sampleProducts';

// Import placeholder image
import placeholderImage from '../assets/images/placeholder.svg';

// Styled components for better organization
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  overflow: 'hidden',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 10px 25px 0 rgba(0,0,0,0.1)',
    '& .product-image': {
      transform: 'scale(1.05)'
    }
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 20px',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
}));

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

// Normalize product image (prefer backend `images` field, then `image`, then fallback)
const getProductImageUrl = (product, index) => {
  const raw = product?.images?.[0]?.image || product?.image;
  if (!raw) return getRandomProductImage(product?.id || index);
  if (raw.startsWith('http')) return raw;
  if (raw.startsWith('/')) {
    // If the backend returns a path like /media/..., make it absolute using the API base
    const base = (apiClient.defaults?.baseURL || '').replace(/\/?$/, '').replace(/\/api\/?$/, '') || '';
    return base + raw;
  }
  return raw;
};

// Backend pagination size; align with DRF PAGE_SIZE (settings.py)
const PAGE_SIZE = 12;

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
    location: '',
    ordering: 'name'
  });
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [backendHealthy, setBackendHealthy] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(true);
  const [expandedPrice, setExpandedPrice] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ p: 2, pt: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700}>
          <FilterAltIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Filters
        </Typography>
        <Button
          onClick={resetFilters}
          size="small"
          startIcon={<ClearIcon />}
          sx={{ textTransform: 'none' }}
        >
          Clear All
        </Button>
      </Box>



      <Box mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => setExpandedCategory(!expandedCategory)}
          sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            <CategoryIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
            Category
          </Typography>
          {expandedCategory ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={expandedCategory} timeout="auto" unmountOnExit>
          <Box mt={1} pl={3}>
            <FormControl fullWidth size="small">
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                displayEmpty
                fullWidth
                sx={{ mt: 1 }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </Box>

      <Box mb={3}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          onClick={() => setExpandedPrice(!expandedPrice)}
          sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            <PriceChangeIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
            Price Range
          </Typography>
          {expandedPrice ? <ExpandLess /> : <ExpandMore />}
        </Box>
        <Collapse in={expandedPrice} timeout="auto" unmountOnExit>
          <Box mt={1} pl={3}>
            <Box display="flex" gap={1} mb={2}>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="Min"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">RWF</InputAdornment>,
                }}
              />
              <Box alignSelf="center">-</Box>
              <TextField
                fullWidth
                size="small"
                type="number"
                placeholder="Max"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">RWF</InputAdornment>,
                }}
              />
            </Box>
          </Box>
        </Collapse>
      </Box>

      <Box mb={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.is_organic}
              onChange={(e) => handleFilterChange('is_organic', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box display="flex" alignItems="center">
              <LocalOfferIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
              <Typography>Organic Only</Typography>
            </Box>
          }
        />
      </Box>

      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
          Location
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter by location"
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </Box>
    </Box>
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories/');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          setBackendHealthy(true);
          return;
        }
      } catch (error) {
        // Category endpoint requires auth; fallback gracefully
        setBackendHealthy(false);
      }

      setCategories(sampleCategories);
      setUsingSampleData(true);
    };

    fetchCategories();
  }, []);

  const [refreshToggle, setRefreshToggle] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      const endpoint = filters.search ? '/products/search/' : '/products/';

      if (filters.search) queryParams.append('query', filters.search);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.min_price) queryParams.append('min_price', filters.min_price);
      if (filters.max_price) queryParams.append('max_price', filters.max_price);
      if (filters.is_organic) queryParams.append('is_organic', 'true');
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.ordering) queryParams.append('ordering', filters.ordering);
      queryParams.append('page', page);
      queryParams.append('page_size', PAGE_SIZE);

      const response = await apiClient.get(`${endpoint}?${queryParams.toString()}`);
      const data = response.data;

      if (data && Array.isArray(data.results)) {
        setProducts(data.results);
        const totalCount = data.count ?? data.results.length;
        const pages = data.count ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : (data.total_pages || 1);
        setTotalPages(pages || 1);
        setBackendHealthy(true);
        setUsingSampleData(false);
        return;
      }

      // Fallback to sample data (offline/dev)
      setBackendHealthy(false);
      setUsingSampleData(true);

      let filteredProducts = [...sampleProducts];

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          (p.name || '').toLowerCase().includes(searchLower) ||
          (p.description || '').toLowerCase().includes(searchLower)
        );
      }

      if (filters.category) {
        filteredProducts = filteredProducts.filter(
          (p.category?.id ?? p.category)?.toString() === filters.category.toString()
        );
      }

      if (filters.min_price) {
        filteredProducts = filteredProducts.filter(
          Number(p.price) >= Number(filters.min_price)
        );
      }

      if (filters.max_price) {
        filteredProducts = filteredProducts.filter(
          Number(p.price) <= Number(filters.max_price)
        );
      }

      if (filters.is_organic) {
        filteredProducts = filteredProducts.filter(p => p.is_organic);
      }

      if (filters.location) {
        const locLower = filters.location.toLowerCase();
        filteredProducts = filteredProducts.filter(
          ((p.location || p.farm_location || '')).toLowerCase().includes(locLower)
        );
      }

      if (filters.ordering) {
        const key = filters.ordering.startsWith('-') ? filters.ordering.slice(1) : filters.ordering;
        const dir = filters.ordering.startsWith('-') ? -1 : 1;
        filteredProducts = filteredProducts.sort((a, b) => {
          const av = a[key] ?? 0;
          const bv = b[key] ?? 0;
          if (typeof av === 'string') return av.localeCompare(bv) * dir;
          return (av - bv) * dir;
        });
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

  useEffect(() => {
    fetchProducts();
  }, [filters, page, refreshToggle]);

  useEffect(() => {
    const handler = () => setRefreshToggle(prev => !prev);
    window.addEventListener('product:created', handler);
    return () => window.removeEventListener('product:created', handler);
  }, []);

  function handleFilterChange(name, value) {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1);
  }

  function resetFilters() {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      is_organic: false,
      location: '',
      ordering: 'name'
    });
    setPage(1);
  }

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
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
            <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 50}ms` }}>
              <StyledCard
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
                      src={getProductImageUrl(product, index)}
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
                        {product.farmer_full_name || product.farmer?.username || 'Local Farmer'}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2.5}>
                      <LocationOnIcon color="action" fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary">
                        {product.location || 'Rwanda'}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />
                  </CardContent>
                </CardActionArea>

                <Box display="flex" justifyContent="space-between" alignItems="center" p={3} pt={0} mt="auto">
                  <Box>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                      {formatPrice(product.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      per {product.unit || 'kg'}
                    </Typography>
                  </Box>
                  <StyledButton
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
                  </StyledButton>
                </Box>
              </StyledCard>
            </Fade>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Page header removed — use main app navbar (eFarmerConnect) instead */}
      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ mb: 2 }}>
            <Search sx={{ flex: 1 }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </Search>
            <Box sx={{ ml: 2 }}>
              <Button onClick={resetFilters} startIcon={<ClearIcon />}>Clear Filters</Button>
            </Box>
          </Toolbar>
        </Container>
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Desktop Sidebar */}
        <Box
          component="nav"
          sx={{
            width: { md: 280 },
            flexShrink: { md: 0 },
            display: { xs: 'none', md: 'block' },
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
            overflowY: 'auto',
          }}
        >
          {drawer}
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
              p: 2,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            background: 'linear-gradient(180deg, #f9f9f9 0%, #ffffff 100%)',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          <Container maxWidth="xl" sx={{ py: 2 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
              flexWrap="wrap"
              gap={2}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton
                  onClick={handleDrawerToggle}
                  sx={{ display: { md: 'none' } }}
                  color="primary"
                >
                  <FilterAltIcon />
                </IconButton>
                <Typography variant="h5" fontWeight={700}>
                  {filters.search ? `Results for "${filters.search}"` : 'All Products'}
                </Typography>
                <Chip
                  label={`${products.length} items`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Box>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.ordering || 'name'}
                    onChange={(e) => handleFilterChange('ordering', e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="name">Name (A-Z)</MenuItem>
                    <MenuItem value="-name">Name (Z-A)</MenuItem>
                    <MenuItem value="price">Price (Low to High)</MenuItem>
                    <MenuItem value="-price">Price (High to Low)</MenuItem>
                    <MenuItem value="-rating">Highest Rated</MenuItem>
                    <MenuItem value="-created_at">Newest</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {renderProductCards()}

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={6} mb={4}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Products;