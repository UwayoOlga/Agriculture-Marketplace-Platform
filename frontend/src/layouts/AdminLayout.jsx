import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    CssBaseline
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Agriculture as AgricultureIcon,
    Inventory as ProductIcon,
    ShoppingCart as OrderIcon,
    AttachMoney as PaymentIcon,
    Assessment as ReportIcon,
    Settings as SettingsIcon,
    Menu as MenuIcon,
    Logout as LogoutIcon,
    Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Farmers', icon: <AgricultureIcon />, path: '/admin/farmers' },
    { text: 'Products', icon: <ProductIcon />, path: '/admin/products' },
    { text: 'Orders', icon: <OrderIcon />, path: '/admin/orders' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/admin/payments' },
    { text: 'Reports', icon: <ReportIcon />, path: '/admin/reports' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate('/login');
    };

    const drawer = (
        <Box sx={{ bgcolor: '#1a1f2c', height: '100%', color: 'white' }}>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', color: '#4caf50', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AgricultureIcon /> E-FARMER
                </Typography>
            </Toolbar>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <List sx={{ px: 2, pt: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                component={Link}
                                to={item.path}
                                selected={isActive}
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: isActive ? 'rgba(76, 175, 80, 0.15)' : 'transparent',
                                    color: isActive ? '#4caf50' : '#b0b8c4',
                                    '&:hover': {
                                        bgcolor: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                    },
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(76, 175, 80, 0.15)',
                                        color: '#4caf50',
                                        '&:hover': {
                                            bgcolor: 'rgba(76, 175, 80, 0.25)',
                                        }
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: isActive ? 600 : 400 }} />
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
            <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        color: '#ef5350',
                        '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.1)' }
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: '0px 1px 10px rgba(0,0,0,0.05)'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ flexGrow: 1 }} />

                    <IconButton size="large" color="inherit" sx={{ mr: 2 }}>
                        <NotificationsIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ mr: 2, fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                            {user?.first_name || 'Admin'}
                        </Typography>
                        <IconButton
                            onClick={handleMenuClick}
                            size="small"
                            sx={{ ml: 2 }}
                            aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>A</Avatar>
                        </IconButton>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        onClick={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={() => navigate('/profile')}>
                            <Avatar /> Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    minHeight: '100vh',
                    bgcolor: '#f5f7fa',
                    mt: 8
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
