import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Home from './pages/Home';
import Profile from './pages/Profile';
import FarmerDashboard from './pages/FarmerDashboard';
import FarmerOrders from './pages/FarmerOrders';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Forum from './pages/Forum';
import SalesReport from './pages/SalesReport';
import FarmerProducts from './pages/FarmerProducts';
import Advice from './pages/Advice';
import MarketPrices from './pages/MarketPrices';
import FarmerCartRequests from './pages/FarmerCartRequests';
import { SnackbarProvider } from 'notistack';
import { CartProvider } from './contexts/CartContext';

// Admin Components
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFarmers from './pages/admin/AdminFarmers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminReports from './pages/admin/AdminReports';
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green
    },
    secondary: {
      main: '#ff8f00', // Orange
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none', // Prevents uppercase buttons
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// A wrapper for protected routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Router>
                <Routes>
                  {/* Public Routes - Wrapped in Main Layout */}
                  <Route element={<Layout><Box className="main-content-wrapper" /></Layout>}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/pending-approval" element={
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h5">Account Pending Approval</Typography>
                        <Typography>Your farmer account is currently under review by our administrators.</Typography>
                      </Box>
                    } />
                  </Route>

                  {/* Admin Routes - Uses AdminLayout (No Main Layout) */}
                  <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="farmers" element={<AdminFarmers />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<AdminOrders />} />
                      <Route path="payments" element={<AdminPlaceholderPage title="Payment Management" />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="settings" element={<AdminPlaceholderPage title="System Settings" />} />
                    </Route>
                  </Route>

                  {/* Protected Routes (Buyer/Farmer) - Wrapped in Main Layout */}
                  <Route element={<Layout><Box /></Layout>}>
                    <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
                    <Route path="/products/:id" element={<PrivateRoute><ProductDetails /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
                    <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                    <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
                    <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
                    <Route path="/advice" element={<PrivateRoute><Advice /></PrivateRoute>} />
                    <Route path="/market-prices" element={<PrivateRoute><MarketPrices /></PrivateRoute>} />

                    {/* Farmer Pages */}
                    <Route path="/farmer-dashboard" element={<PrivateRoute><FarmerDashboard /></PrivateRoute>} />
                    <Route path="/farmer/products" element={<PrivateRoute><FarmerProducts /></PrivateRoute>} />
                    <Route path="/farmer/orders" element={<PrivateRoute><FarmerOrders /></PrivateRoute>} />
                    <Route path="/sales-report" element={<PrivateRoute><SalesReport /></PrivateRoute>} />
                    <Route path="/farmer/cart-requests" element={
                      <Box sx={{ p: 3 }}>
                        <Typography variant="h5" color="text.secondary">
                          Feature Deprecated. Please use the "Orders" page to manage requests.
                        </Typography>
                      </Box>
                    } />
                  </Route>

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Router>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
