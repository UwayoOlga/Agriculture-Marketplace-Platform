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
    Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack';
import apiClient from '../api/apiClient';

const FarmerProducts = () => {
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
            // Fetch ONLY this farmer's products
            const response = await apiClient.get('/products/?farmer=me');
            // Handle pagination results if present
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
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
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
                data.append('images', image); // Backend expects 'images' list but handles one too
            }

            if (editMode && selectedProduct) {
                await apiClient.put(`/products/${selectedProduct.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                enqueueSnackbar('Product updated!', { variant: 'success' });
            } else {
                await apiClient.post('/products/create/', data, { // Assuming create endpoint exists/mapped
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

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight={700}>My Products</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Add Product
                </Button>
            </Box>

            {loading ? <CircularProgress /> : (
                <TableContainer component={Paper}>
                    <Table>
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
                            {products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">No products found.</TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{formatPrice(product.price)}</TableCell>
                                        <TableCell>{product.stock} {product.unit}</TableCell>
                                        <TableCell>{product.category_name || product.category}</TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleOpen(product)} color="primary"><EditIcon /></IconButton>
                                            <IconButton onClick={() => handleDelete(product.id)} color="error"><DeleteIcon /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Modal */}
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
                            <Grid size={6}>
                                <TextField
                                    label="Price (RWF)"
                                    type="number"
                                    fullWidth
                                    margin="normal"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </Grid>
                            <Grid size={6}>
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
                            <Grid size={6}>
                                <TextField
                                    select
                                    label="Category"
                                    fullWidth
                                    margin="normal"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={6}>
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
    );
};

export default FarmerProducts;
