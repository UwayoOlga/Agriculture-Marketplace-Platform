import React, { useState, useEffect } from 'react';
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
    CircularProgress, Alert
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import apiClient from '../../api/apiClient';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/admin/orders/');
                const data = response.data.results ? response.data.results : response.data;
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(amount);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>Order Management</Typography>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
                <TextField
                    placeholder="Search by Order ID..."
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
                            <TableCell>Order ID</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Total Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.filter(o => o.id.toString().includes(searchTerm)).map((order) => (
                            <TableRow key={order.id} hover>
                                <TableCell>#ORD-{order.id}</TableCell>
                                <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                                <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={order.status}
                                        color={order.status === 'PAID' ? 'success' : order.status === 'PENDING_APPROVAL' ? 'warning' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right"><IconButton size="small"><MoreVertIcon /></IconButton></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdminOrders;
