import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useSnackbar } from 'notistack';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [showProductForm, setShowProductForm] = useState(false);
  const [categories, setCategories] = useState([]);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories/');
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
          return;
        }
      } catch (e) {
        // Endpoint requires auth; fallback to empty list without breaking the form
        console.warn('Could not load categories, falling back to manual entry.');
      }
      setCategories([]);
    };
    fetchCategories();
  }, []);

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
      const payload = {
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        stock: Number(productData.stock),
        unit: productData.unit,
        category: productData.category || null,
        is_organic: productData.is_organic,
      };

      await api.post('/api/products/create/', payload);
      
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
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setShowProductForm(false);
      enqueueSnackbar('Product added successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error adding product:', error);
      enqueueSnackbar('Failed to add product. Please try again.', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
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
              <Typography variant="h5">$0.00</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Add Product Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Your Products</Typography>
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
              <Typography>Your products will appear here</Typography>
              {/* TODO: Add product list component */}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FarmerDashboard;
