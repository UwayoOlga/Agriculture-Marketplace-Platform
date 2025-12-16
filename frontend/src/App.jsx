import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            isAuthenticated && user?.user_type === 'FARMER' ?
              <Navigate to="/farmer-dashboard" /> :
              <Home />
          }
        />
        <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="products" element={
          isAuthenticated && user?.user_type === 'FARMER' ? <Navigate to="/farmer-dashboard" /> : <Products />
        } />
        <Route path="products/:id" element={
          isAuthenticated && user?.user_type === 'FARMER' ? <Navigate to="/farmer-dashboard" /> : <ProductDetails />
        } />
        <Route path="cart" element={
          isAuthenticated && user?.user_type === 'FARMER' ? <Navigate to="/farmer-dashboard" /> : <Cart />
        } />
        <Route path="checkout" element={
          isAuthenticated && user?.user_type === 'FARMER' ? <Navigate to="/farmer-dashboard" /> : <Checkout />
        } />
        <Route path="forum" element={<Forum />} />

        {/* Protected Routes */}
        <Route
          path="profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Farmer Dashboard */}
        <Route
          path="farmer-dashboard"
          element={
            <PrivateRoute>
              <FarmerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="farmer/orders"
          element={
            <PrivateRoute>
              <FarmerOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="sales-report"
          element={
            <PrivateRoute>
              <SalesReport />
            </PrivateRoute>
          }
        />
        <Route
          path="farmer/products"
          element={
            <PrivateRoute>
              <FarmerProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="farmer/advice"
          element={
            <PrivateRoute>
              <Advice />
            </PrivateRoute>
          }
        />
        <Route
          path="market-prices"
          element={
            <PrivateRoute>
              <MarketPrices />
            </PrivateRoute>
          }
        />
        <Route
          path="farmer/cart-requests"
          element={
            <PrivateRoute>
              <FarmerCartRequests />
            </PrivateRoute>
          }
        />

        {/* Additional routes can go here (cart, orders, etc.) */}
        <Route path="orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      </Route>

      {/* Fallback for unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <AuthProvider>
          <NotificationProvider>
            <CartProvider>
              <Router>
                <AppContent />
              </Router>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
