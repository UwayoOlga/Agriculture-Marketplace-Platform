import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    Alert,
    AlertTitle
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../contexts/AuthContext';

const FarmerProducts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const { enqueueSnackbar } = useSnackbar();

    // Modal State
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        unit: 'kg',
        farm_location: '',
        is_organic: false
    });
    const [image, setImage] = useState(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/products/?farmer=me');
            const data = response.data.results ? response.data.results : response.data;
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            enqueueSnackbar('Failed to load products', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/categories/');
            if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else if (response.data.results) {
                setCategories(response.data.results);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleOpen = (product = null) => {
        if (product) {
            setEditMode(true);
            setSelectedProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category,
                unit: product.unit,
                farm_location: product.farm_location,
                is_organic: product.is_organic
            });
        } else {
            setEditMode(false);
            setSelectedProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                unit: 'kg',
                farm_location: '',
                is_organic: false
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setImage(null);
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (image) {
                data.append('images', image);
            }

            if (editMode && selectedProduct) {
                await apiClient.put(`/products/${selectedProduct.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                enqueueSnackbar('Product updated!', { variant: 'success' });
            } else {
                await apiClient.post('/products/create/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                enqueueSnackbar('Product created!', { variant: 'success' });
            }
            handleClose();
            fetchProducts();
        } catch (error) {
            console.error('Save error:', error);
            enqueueSnackbar('Failed to save product', { variant: 'error' });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await apiClient.delete(`/products/${id}/delete/`);
                enqueueSnackbar('Product deleted', { variant: 'success' });
                fetchProducts();
            } catch (error) {
                enqueueSnackbar('Failed to delete product', { variant: 'error' });
            }
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(price);
    };

    // Dark Theme Styles
    const darkBg = '#121212'; // Main background
    const cardBg = '#1e1e1e'; // Card background
    const textPrimary = '#ffffff';
    const textSecondary = '#b0b0b0';
    const accentGreen = '#2e7d32';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: darkBg, color: textPrimary, py: 4 }}>
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: textPrimary }}>
                    Welcome, {user?.username || 'Farmer'}!
                </Typography>

                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 3, bgcolor: cardBg, color: textPrimary, borderRadius: 2 }}>
                            <Typography variant="body2" color={textSecondary}>Total Products</Typography>
                            <Typography variant="h4" fontWeight="bold">{products.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 3, bgcolor: cardBg, color: textPrimary, borderRadius: 2 }}>
                            <Typography variant="body2" color={textSecondary}>Orders This Month</Typography>
                            <Typography variant="h4" fontWeight="bold">0</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 3, bgcolor: cardBg, color: textPrimary, borderRadius: 2 }}>
                            <Typography variant="body2" color={textSecondary}>Total Revenue</Typography>
                            <Typography variant="h4" fontWeight="bold">RWF 0</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Products Section */}
                <Paper sx={{ bgcolor: cardBg, borderRadius: 2, overflow: 'hidden' }}>
                    {/* Header Toolbar */}
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
                        <Typography variant="h6" fontWeight="bold">Your Products</Typography>
                        <Box>
                            <Button
                                variant="outlined"
                                color="success"
                                sx={{ mr: 2, borderColor: '#4caf50', color: '#4caf50' }}
                                onClick={() => navigate('/farmer/cart-requests')}
                            >
                                View Orders
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ bgcolor: accentGreen, '&:hover': { bgcolor: '#1b5e20' } }}
                                startIcon={<AddIcon />}
                                onClick={() => handleOpen()}
                            >
                                Add New Product
                            </Button>
                        </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 3 }}>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={4}>
                                <CircularProgress />
                            </Box>
                        ) : products.length === 0 ? (
                            <Alert severity="info" variant="outlined" icon={<InfoIcon />} sx={{ bgcolor: 'rgba(2, 136, 209, 0.08)', color: '#29b6f6', borderColor: '#0288d1' }}>
                                <AlertTitle>No products yet</AlertTitle>
                                Add your first product using the button above.
                            </Alert>
                        ) : (
                            <TableContainer>
                                <Table sx={{ '& th': { color: textSecondary, borderBottom: '1px solid #333' }, '& td': { color: textPrimary, borderBottom: '1px solid #333' } }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Price</TableCell>
                                            <TableCell>Stock</TableCell>
                                            <TableCell>Category</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product.id}>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell>{formatPrice(product.price)}</TableCell>
                                                <TableCell>{product.stock} {product.unit}</TableCell>
                                                <TableCell>{product.category_name || product.category}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton onClick={() => handleOpen(product)} sx={{ color: '#29b6f6' }}><EditIcon /></IconButton>
                                                    <IconButton onClick={() => handleDelete(product.id)} sx={{ color: '#ef5350' }}><DeleteIcon /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Box>
                </Paper>

                {/* Add/Edit Modal (Kept Light for usability or match dark?) - Keeping default dialog for now, maybe dark content? */}
                <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                    <DialogTitle>{editMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogContent>
                        <Box component="form" sx={{ mt: 1 }}>
                            <TextField
                                label="Product Name"
                                fullWidth
                                margin="normal"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                margin="normal"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Price (RWF)"
                                        type="number"
                                        fullWidth
                                        margin="normal"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Stock Quantity"
                                        type="number"
                                        fullWidth
                                        margin="normal"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        label="Category"
                                        fullWidth
                                        margin="normal"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {(categories || []).map((cat) => (
                                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Unit (e.g., kg)"
                                        fullWidth
                                        margin="normal"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                    />
                                </Grid>
                            </Grid>
                            <TextField
                                label="Farm Location"
                                fullWidth
                                margin="normal"
                                value={formData.farm_location}
                                onChange={(e) => setFormData({ ...formData, farm_location: e.target.value })}
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mt: 2 }}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => setImage(e.target.files[0])}
                                />
                            </Button>
                            {image && <Typography variant="caption" display="block" mt={1}>Selected: {image.name}</Typography>}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained">Save</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
};

export default FarmerProducts;
