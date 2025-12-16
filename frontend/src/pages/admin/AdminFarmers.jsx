import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon
} from '@mui/icons-material';
import apiClient from '../../api/apiClient';

const AdminFarmers = () => {
    const [farmers, setFarmers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchFarmers = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/admin/farmers/');
                const data = response.data.results ? response.data.results : response.data;
                setFarmers(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching farmers:', err);
                setError('Failed to load farmers. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFarmers();
    }, []);

    const filteredFarmers = farmers.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Farmer Management</Typography>
                <Button variant="contained" color="success" startIcon={<AddIcon />}>Add New Farmer</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Search farmers..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Farmer</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Joined Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFarmers.length > 0 ? (
                            filteredFarmers.map((farmer) => (
                                <TableRow key={farmer.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'success.main' }}>
                                                {farmer.first_name ? farmer.first_name[0] : farmer.username[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {farmer.first_name && farmer.last_name ? `${farmer.first_name} ${farmer.last_name}` : farmer.username}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">{farmer.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{farmer.address || 'N/A'}</TableCell>
                                    <TableCell>{farmer.phone_number || 'N/A'}</TableCell>
                                    <TableCell>{new Date(farmer.date_joined).toLocaleDateString()}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small"><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No farmers found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdminFarmers;
