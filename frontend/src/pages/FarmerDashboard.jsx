import React, { useState, useRef } from 'react';
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
  Avatar,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';

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
    is_organic: false,
    image: null,
    imagePreview: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProductData(prev => ({
            ...prev,
            image: file,
            imagePreview: reader.result
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setProductData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleRemoveImage = () => {
    setProductData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('price', productData.price);
      formData.append('stock', productData.stock);
      formData.append('unit', productData.unit);
      formData.append('category', productData.category);
      formData.append('is_organic', productData.is_organic);
      
      if (productData.image) {
        formData.append('image', productData.image);
      }
      
      // TODO: Replace with your actual API endpoint
      // const response = await api.post('/api/products/', formData, {
      //   headers: {
      //     'Content-Type': 'multipart/form-data',
      //   },
      // });
      
      console.log('Product data:', formData);
      
      // Reset form
      setProductData({
        name: '',
        description: '',
        price: '',
        stock: '',
        unit: 'kg',
        category: '',
        is_organic: false,
        image: null,
        imagePreview: ''
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setShowProductForm(false);
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
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
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 1 }}>
                      Product Image
                    </Typography>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
                      name="image"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      id="product-image-upload"
                    />
                    <label htmlFor="product-image-upload">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        {productData.image ? 'Change Image' : 'Upload Image'}
                      </Button>
                    </label>
                    
                    {productData.imagePreview && (
                      <Box sx={{ mt: 2, position: 'relative', display: 'inline-block' }}>
                        <img 
                          src={productData.imagePreview} 
                          alt="Preview" 
                          style={{ 
                            maxWidth: '200px', 
                            maxHeight: '200px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                          }} 
                        />
                        <IconButton
                          size="small"
                          onClick={handleRemoveImage}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            },
                          }}
                        >
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Recommended size: 800x600px. Max file size: 5MB
                    </Typography>
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
