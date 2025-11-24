import React, { useState } from 'react';
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
  Paper
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [showProductForm, setShowProductForm] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    unit: 'kg',
    category: '',
    is_organic: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Add API call to create product
      console.log('Product data:', productData);
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
      // Show success message
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
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
              >
                {showProductForm ? 'Cancel' : 'Add New Product'}
              </Button>
            </Box>

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
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Add Product
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
