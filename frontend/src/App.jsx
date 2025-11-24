import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Home from './pages/Home';
import Profile from './pages/Profile';
import FarmerDashboard from './pages/FarmerDashboard';
import Forum from './pages/Forum';
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
        <Route path="products" element={<Products />} />
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

        {/* Additional routes can go here (cart, orders, etc.) */}
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
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
