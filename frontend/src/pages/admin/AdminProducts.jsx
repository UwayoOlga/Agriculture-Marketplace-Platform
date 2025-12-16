import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Avatar, Chip, IconButton, Button,
    TextField, InputAdornment, CircularProgress, Alert
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import apiClient from '../../api/apiClient';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/admin/products/');
                const data = response.data.results ? response.data.results : response.data;
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.farmer_name && p.farmer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Product Management</Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    placeholder="Search products..."
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }}
                />
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Farmer</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Stock</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredProducts.map((product) => (
                            <TableRow key={product.id} hover>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar src={product.images?.[0]?.image} variant="rounded">{product.name[0]}</Avatar>
                                        <Box>
                                            <Typography variant="subtitle2">{product.name}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell>{product.farmer_name}</TableCell>
                                <TableCell><Chip label={product.category_name} size="small" /></TableCell>
                                <TableCell>{formatCurrency(product.price)}</TableCell>
                                <TableCell>{product.stock} {product.unit}</TableCell>
                                <TableCell align="right"><IconButton size="small"><MoreVertIcon /></IconButton></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdminProducts;
