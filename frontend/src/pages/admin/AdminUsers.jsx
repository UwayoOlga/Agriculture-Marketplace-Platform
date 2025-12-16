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
    Alert,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    ListItemIcon
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as CheckCircleIcon,
    Block as BlockIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Lock as LockIcon,
    LockOpen as LockOpenIcon,
    Key as KeyIcon
} from '@mui/icons-material';
import apiClient from '../../api/apiClient';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editFormData, setEditFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        user_type: 'BUYER'
    });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/users/');
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

    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUser(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUser(null);
    };

    const handleEditClick = () => {
        setEditFormData({
            first_name: selectedUser.first_name || '',
            last_name: selectedUser.last_name || '',
            email: selectedUser.email || '',
            user_type: selectedUser.user_type
        });
        setOpenEditDialog(true);
        setAnchorEl(null); // Keep user selected
    };

    const handleEditClose = () => {
        setOpenEditDialog(false);
        setEditFormData({ first_name: '', last_name: '', email: '', user_type: 'BUYER' });
        handleMenuClose();
    };

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [addFormData, setAddFormData] = useState({
        username: '',
        password: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        address: '',
        user_type: 'FARMER'
    });

    const handleAddClick = () => {
        setOpenAddDialog(true);
    };

    const handleAddClose = () => {
        setOpenAddDialog(false);
        setAddFormData({
            username: '',
            password: '',
            email: '',
            first_name: '',
            last_name: '',
            phone_number: '',
            address: '',
            user_type: 'FARMER'
        });
    };

    const handleAddSave = async () => {
        try {
            setActionLoading(true);
            await apiClient.post('/admin/users/', addFormData);
            fetchUsers();
            handleAddClose();
            alert('User created successfully');
        } catch (err) {
            console.error('Error creating user:', err);
            alert('Failed to create user: ' + (err.response?.data?.username || err.response?.data?.email || 'Unknown error'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditSave = async () => {
        try {
            setActionLoading(true);
            await apiClient.patch(`/admin/users/${selectedUser.id}/`, editFormData);
            fetchUsers();
            handleEditClose();
            alert('User updated successfully');
        } catch (err) {
            console.error('Error updating user:', err);
            alert('Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAction = async (action, additionalData = {}) => {
        if (!window.confirm(`Are you sure you want to ${action.replace('_', ' ')} this user?`)) return;

        try {
            setActionLoading(true);
            if (action === 'delete') {
                await apiClient.delete(`/admin/users/${selectedUser.id}/`);
            } else {
                const response = await apiClient.post(`/admin/users/${selectedUser.id}/action/`, { action, ...additionalData });
                if (action === 'reset_password') {
                    alert(`Password reset successfully. New password: ${response.data.new_password}`);
                    handleMenuClose();
                    return; // Don't refresh list for password reset
                }
            }
            fetchUsers();
            handleMenuClose();
            if (action !== 'delete') alert(`User ${action}d successfully`);
        } catch (err) {
            console.error(`Error performing ${action}:`, err);
            alert(`Failed to ${action} user`);
        } finally {
            setActionLoading(false);
        }
    };

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
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                >
                    Add New User
                </Button>
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
                                        {user.user_type === 'FARMER' && (
                                            <Chip
                                                label={user.is_verified ? 'Verified' : 'Pending'}
                                                color={user.is_verified ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>{user.address || 'N/A'}</TableCell>
                                    <TableCell>{user.phone_number || 'N/A'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, user)}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
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

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    Edit Details
                </MenuItem>
                <MenuItem onClick={() => handleAction(selectedUser?.is_active ? 'suspend' : 'activate')}>
                    <ListItemIcon>
                        {selectedUser?.is_active ? <LockIcon fontSize="small" color="error" /> : <LockOpenIcon fontSize="small" color="success" />}
                    </ListItemIcon>
                    {selectedUser?.is_active ? 'Deactivate User' : 'Activate User'}
                </MenuItem>
                <MenuItem onClick={() => handleAction('reset_password')}>
                    <ListItemIcon><KeyIcon fontSize="small" /></ListItemIcon>
                    Reset Password
                </MenuItem>
                <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
                    <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
                    Delete Account
                </MenuItem>
            </Menu>

            {/* Edit User Dialog */}
            <Dialog open={openEditDialog} onClose={handleEditClose} maxWidth="sm" fullWidth>
                <DialogTitle>Edit User Details</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="First Name"
                            value={editFormData.first_name}
                            onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={editFormData.last_name}
                            onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={editFormData.email}
                            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={editFormData.user_type}
                                label="Role"
                                onChange={(e) => setEditFormData({ ...editFormData, user_type: e.target.value })}
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="FARMER">Farmer</MenuItem>
                                <MenuItem value="BUYER">Customer</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button
                        onClick={handleEditSave}
                        variant="contained"
                        color="primary"
                        disabled={actionLoading}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Add User Dialog */}
            <Dialog open={openAddDialog} onClose={handleAddClose} maxWidth="sm" fullWidth>
                <DialogTitle>Add New User</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Username"
                            value={addFormData.username}
                            onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={addFormData.password}
                            onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            value={addFormData.email}
                            onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Phone Number"
                            value={addFormData.phone_number}
                            onChange={(e) => setAddFormData({ ...addFormData, phone_number: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Address"
                            value={addFormData.address}
                            onChange={(e) => setAddFormData({ ...addFormData, address: e.target.value })}
                            fullWidth
                            required
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="First Name"
                            value={addFormData.first_name}
                            onChange={(e) => setAddFormData({ ...addFormData, first_name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Last Name"
                            value={addFormData.last_name}
                            onChange={(e) => setAddFormData({ ...addFormData, last_name: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={addFormData.user_type}
                                label="Role"
                                onChange={(e) => setAddFormData({ ...addFormData, user_type: e.target.value })}
                            >
                                <MenuItem value="ADMIN">Admin</MenuItem>
                                <MenuItem value="FARMER">Farmer</MenuItem>
                                <MenuItem value="BUYER">Customer</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose}>Cancel</Button>
                    <Button
                        onClick={handleAddSave}
                        variant="contained"
                        color="primary"
                        disabled={actionLoading}
                    >
                        Create User
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default AdminUsers;
