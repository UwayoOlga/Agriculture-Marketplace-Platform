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
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon,
    Add as AddIcon
} from '@mui/icons-material';
import apiClient from '../../api/apiClient';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/admin/users/');
                // Check if response is paginated (has results array) or just array
                const data = response.data.results ? response.data.results : response.data;
                setUsers(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const getStatusColor = (is_verified) => {
        return is_verified ? 'success' : 'warning';
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN': return 'error';
            case 'FARMER': return 'success';
            case 'BUYER': return 'info';
            default: return 'default';
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>User Management</Typography>
                <Button variant="contained" color="primary" startIcon={<AddIcon />}>Add New User</Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        placeholder="Search users by name, email or username..."
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
                    <Button startIcon={<FilterListIcon />} variant="outlined">Filter</Button>
                </Box>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: getRoleColor(user.user_type) + '.main' }}>
                                                {user.first_name ? user.first_name[0] : user.username[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle2">
                                                    {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">{user.email}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.user_type}
                                            color={getRoleColor(user.user_type)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.is_verified ? 'Verified' : 'Pending'}
                                            color={getStatusColor(user.is_verified)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{user.address || 'N/A'}</TableCell>
                                    <TableCell>{user.phone_number || 'N/A'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small"><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No users found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default AdminUsers;
