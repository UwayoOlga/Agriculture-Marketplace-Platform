import { useState } from 'react';
import { Link as RouterLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Container,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  Badge
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../contexts/CartContext';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../contexts/AuthContext';
import NotificationsDropdown from './NotificationsDropdown';

const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    logout();
  };

  const handleProfile = () => {
    handleCloseUserMenu();
    navigate('/profile');
  };

  const allNavItems = [
    { title: 'Products', path: '/products' },
    { title: 'Market Prices', path: '/market-prices', roles: ['FARMER', 'ADMIN'] },
    { title: 'Forum', path: '/forum', roles: ['FARMER', 'ADMIN'] },
  ];

  const navItems = allNavItems.filter(item => {
    // If no roles defined, show to everyone (including guests and Buyers)
    if (!item.roles) return true;

    // If roles defined, user must be logged in and have matching role
    if (!user) return false;
    return item.roles.includes(user.user_type);
  });

  const userMenuItems = [
    { title: 'Profile', action: handleProfile },
    { title: 'My Orders', action: () => navigate('/orders') },
  ];

  if (user?.user_type === 'FARMER') {
    userMenuItems.push({ title: 'Sales Report', action: () => navigate('/sales-report') });
    userMenuItems.push({ title: 'My Products', action: () => navigate('/farmer/products') });
    userMenuItems.push({ title: 'Farmer Dashboard', action: () => navigate('/farmer-dashboard') });
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo - Desktop */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              eFarmerConnect
            </Typography>

            {/* Mobile menu */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {navItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    onClick={() => {
                      handleCloseNavMenu();
                      navigate(item.path);
                    }}
                  >
                    <Typography textAlign="center">{item.title}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Logo - Mobile */}
            <Typography
              variant="h5"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              eFarmerConnect
            </Typography>

            {/* Desktop Navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {item.title}
                </Button>
              ))}
            </Box>

            {/* Right side icons */}
            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              {isAuthenticated ? (
                <>
                  {/* Notifications - show for farmers */}
                  {user?.user_type === 'FARMER' && <NotificationsDropdown />}

                  <IconButton
                    color="inherit"
                    aria-label="cart"
                    component={RouterLink}
                    to="/cart"
                    sx={{ mr: 1 }}
                  >
                    <Badge badgeContent={itemCount} color="secondary">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>

                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
                      <Avatar
                        alt={user?.username || 'User'}
                        src={user?.profile_picture}
                        sx={{ bgcolor: 'secondary.main' }}
                      >
                        {user?.username?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {user?.username || 'User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user?.email || ''}
                      </Typography>
                    </Box>
                    <Divider />

                    {userMenuItems.map((item) => (
                      <MenuItem key={item.title} onClick={item.action}>
                        <Typography textAlign="center">{item.title}</Typography>
                      </MenuItem>
                    ))}

                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center" color="error">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                  >
                    Login
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    component={RouterLink}
                    to="/register"
                    sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'rgba(255, 255, 255, 0.8)' } }}
                  >
                    Sign Up
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 3, backgroundColor: (theme) => theme.palette.grey[200] }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} eFarmerConnect. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
