import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Chip,
  Grid
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const formatRwf = (value) =>
  new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(value) || 0);

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [showProductForm, setShowProductForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const fallbackCategories = [
    'Fresh Vegetables', 'Leafy Greens', 'Root Crops', 'Legumes',
    'Tubers', 'Organic Fruits', 'Herbs & Spices', 'Cereals & Grains',
    'Coffee', 'Tea', 'Honey', 'Dairy & Eggs'
  ];
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: '',
    is_organic: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          return;
        }
      } catch (e) {
        // Endpoint requires auth; fallback to empty list without breaking the form
        console.warn('Could not load categories, falling back to manual entry.');
      }
      setCategories(fallbackCategories.map((name, idx) => ({ id: `fallback-${idx}`, name })));
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!user) return;
      setLoadingProducts(true);
      try {
        const response = await api.get('/products/', {
          params: { farmer: 'me' }
        });
        const results = response.data?.results || response.data || [];
        setProducts(Array.isArray(results) ? results : []);
      } catch (e) {
        console.error('Failed to load products', e);
        enqueueSnackbar('Failed to load your products', { variant: 'error' });
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [user, enqueueSnackbar]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
      setProductData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (user?.user_type !== 'FARMER') {
      enqueueSnackbar('Only farmers can create products.', { variant: 'warning' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      const category =
        typeof productData.category === 'string' && productData.category.startsWith('fallback-')
          ? null
          : productData.category || null;

      const payload = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        stock: Number(productData.stock),
        unit: productData.unit,
        category,
        is_organic: productData.is_organic,
      };

      await api.post('/products/create/', payload);
      
      // Reset form
      setProductData({
        name: '',
        description: '',
        price: '',
        stock: '',
        unit: 'kg',
        category: '',
        is_organic: false
      });
      
      setShowProductForm(false);
      enqueueSnackbar('Product added successfully!', { variant: 'success' });
      // Refresh list
      try {
        const response = await api.get('/products/', { params: { farmer: 'me' } });
        const results = response.data?.results || response.data || [];
        setProducts(Array.isArray(results) ? results : []);
      } catch (loadErr) {
        console.error('Failed to refresh products', loadErr);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      enqueueSnackbar('Failed to add product. Please try again.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/products/${productId}/delete/`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      enqueueSnackbar('Product deleted', { variant: 'success' });
    } catch (error) {
      console.error('Delete failed', error);
      enqueueSnackbar('Failed to delete product', { variant: 'error' });
    }
  };

  const handleUpdate = async (productId, updates) => {
    try {
      await api.put(`/products/${productId}/update/`, updates);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
      enqueueSnackbar('Product updated', { variant: 'success' });
    } catch (error) {
      console.error('Update failed', error);
      enqueueSnackbar('Failed to update product', { variant: 'error' });
    }
  };

  const ProductCard = ({ product }) => {
    const [localStock, setLocalStock] = useState(product.stock || 0);
    const [localPrice, setLocalPrice] = useState(product.price || 0);
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      await handleUpdate(product.id, { stock: Number(localStock), price: Number(localPrice) });
      setSaving(false);
    };

    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} mb={1}>
            <Typography variant="h6">{product.name}</Typography>
            {product.is_organic && <Chip size="small" color="success" label="Organic" />}
          </Stack>
          <Typography variant="subtitle2" fontWeight={700} mb={0.5}>{formatRwf(product.price)}</Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>{product.description || 'No description'}</Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Category: {product.category || product.category_id || '—'}
          </Typography>
          <TextField
            label="Price (RWF)"
            type="number"
            size="small"
            fullWidth
            margin="dense"
            value={localPrice}
            onChange={(e) => setLocalPrice(e.target.value)}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />
          <TextField
            label="Stock"
            type="number"
            size="small"
            fullWidth
            margin="dense"
            value={localStock}
            onChange={(e) => setLocalStock(e.target.value)}
            InputProps={{ inputProps: { min: 0, step: 1 } }}
          />
          <Stack direction="row" spacing={1} mt={2}>
            <Button size="small" variant="contained" onClick={save} disabled={saving}>Save</Button>
            <Button size="small" color="error" onClick={() => handleDelete(product.id)}>Delete</Button>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.username || 'Farmer'}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Products
              </Typography>
              <Typography variant="h5">0</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Orders This Month
              </Typography>
              <Typography variant="h5">0</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h5">RWF 0</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Add Product Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="h6">Your Products</Typography>
              <Box display="flex" gap={1}>
                <Button 
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/farmer-orders')}
                >
                  View Orders
                </Button>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => setShowProductForm(!showProductForm)}
                  disabled={user?.user_type !== 'FARMER'}
              >
                {showProductForm ? 'Cancel' : 'Add New Product'}
              </Button>
            </Box>
            </Box>

            {user?.user_type !== 'FARMER' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                You need a farmer account to create products. Please log in as a farmer.
              </Alert>
            )}

            {showProductForm && (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Product Name"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      name="price"
                      type="number"
                      value={productData.price}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Stock"
                      name="stock"
                      type="number"
                      value={productData.stock}
                      onChange={handleInputChange}
                      required
                      margin="normal"
                      inputProps={{ min: 0 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Unit</InputLabel>
                      <Select
                        name="unit"
                        value={productData.unit}
                        onChange={handleInputChange}
                        required
                      >
                        <MenuItem value="kg">Kilogram (kg)</MenuItem>
                        <MenuItem value="g">Gram (g)</MenuItem>
                        <MenuItem value="lb">Pound (lb)</MenuItem>
                        <MenuItem value="oz">Ounce (oz)</MenuItem>
                        <MenuItem value="piece">Piece</MenuItem>
                        <MenuItem value="bunch">Bunch</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Category</InputLabel>
                      <Select
                        name="category"
                        value={productData.category}
                        onChange={handleInputChange}
                        displayEmpty
                      >
                        <MenuItem value="">
                          <em>Select category</em>
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      value={productData.description}
                      onChange={handleInputChange}
                      multiline
                      rows={3}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={productData.is_organic}
                          onChange={handleInputChange}
                          name="is_organic"
                          color="primary"
                        />
                      }
                      label="Organic Product"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      sx={{ mt: 2 }}
                    >
{isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Add Product'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Product List will go here */}
            <Box sx={{ mt: 3 }}>
              {loadingProducts ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : products.length === 0 ? (
                <Alert severity="info">No products yet. Add your first product.</Alert>
              ) : (
                <Grid container spacing={2}>
                  {products.map((p) => (
                    <Grid item xs={12} sm={6} md={4} key={p.id}>
                      <ProductCard product={p} />
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FarmerDashboard;

