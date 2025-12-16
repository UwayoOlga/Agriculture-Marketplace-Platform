// frontend/src/services/api.js
import axios from 'axios';
import { message } from 'antd';

const API_URL = 'http://127.0.0.1:8000/api';
const TOKEN_REFRESH_MARGIN = 300; // 5 minutes in seconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Get CSRF token from cookies
const getCSRFToken = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
};

// Secure storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  LAST_ACTIVITY: 'last_activity'
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CSRFToken': getCSRFToken(),
  },
  withCredentials: true, // Required for cookies
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Request queue for handling token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Secure storage helpers
const storage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

// Helper to set Authorization header for the axios instance
const setAuthHeader = (token) => {
  try {
    if (token) {
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      delete api.defaults.headers.common['Authorization'];
    }
  } catch (e) {
    console.error('Failed to set auth header:', e);
  }
};

// Update last activity timestamp
const updateLastActivity = () => {
  storage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now());
};

// Check if token is expired or about to expire
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + TOKEN_REFRESH_MARGIN * 1000;
  } catch (e) {
    return true;
  }
};

// Clear auth data and redirect to login
const clearAuthAndRedirect = (errorMessage = 'Your session has expired. Please log in again.') => {
  Object.values(STORAGE_KEYS).forEach(key => storage.removeItem(key));

  if (errorMessage && !window.location.pathname.includes('/login')) {
    message.error(errorMessage);
  }

  // Only redirect if not already on login page to prevent infinite redirects
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    // Skip auth for these endpoints
    const skipAuth = [
      '/token/',
      '/register/',
      '/password-reset/request/',
      '/password-reset/confirm/',
      '/categories/',
      '/products/'
    ].some(path => config.url.includes(path));

    if (skipAuth) return config;

    const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

    // If no tokens and endpoint requires auth, redirect to login
    if (!accessToken || !refreshToken) {
      clearAuthAndRedirect('Please log in to continue');
      return Promise.reject(new Error('No authentication tokens found'));
    }

    // Check if token needs refresh
    if (isTokenExpired(accessToken)) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          })
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        if (!access) {
          throw new Error('No access token received');
        }

        // Update tokens
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        config.headers.Authorization = `Bearer ${access}`;

        // Process queued requests
        processQueue(null, access);

        return config;
      } catch (error) {
        processQueue(error, null);
        clearAuthAndRedirect('Session expired. Please log in again.');
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Add auth header if we have a token
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Update last activity on each request
    updateLastActivity();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Update last activity on successful response
    updateLastActivity();
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      message.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized
    if (status === 401) {
      // If already retried or refresh token is missing
      if (originalRequest._retry || !storage.getItem(STORAGE_KEYS.REFRESH_TOKEN)) {
        clearAuthAndRedirect('Your session has expired. Please log in again.');
        return Promise.reject(error);
      }

      // Mark request as retried
      originalRequest._retry = true;

      try {
        const refreshToken = storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        if (!access) {
          throw new Error('No access token received');
        }

        // Update tokens
        storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearAuthAndRedirect('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle other error statuses
    if (status >= 500) {
      message.error('Server error. Please try again later.');
    } else if (status === 403) {
      message.error('You do not have permission to perform this action.');
    } else if (status === 404) {
      message.error('The requested resource was not found.');
    } else if (status === 400) {
      // Handle validation errors
      const errorMessages = Object.values(data).flat().join('\n');
      message.error(errorMessages || 'Invalid data provided');
    }

    return Promise.reject(error);
  }
);

// Inactivity timer
const startInactivityTimer = () => {
  window.onload = updateLastActivity;
  ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, updateLastActivity, false);
  });

  setInterval(() => {
    const lastActivity = storage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    const currentTime = Date.now();

    if (lastActivity && currentTime - lastActivity > INACTIVITY_TIMEOUT) {
      clearAuthAndRedirect('You have been logged out due to inactivity.');
    }
  }, 60000); // Check every minute
};

// Start inactivity timer when the app loads
if (typeof window !== 'undefined') {
  startInactivityTimer();
}

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/token/', credentials);
      const { access, refresh } = response.data;

      if (!access || !refresh) {
        throw new Error('Invalid response from server');
      }

      // Store tokens securely
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access);
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh);
      updateLastActivity();
      // Ensure axios instance uses the new access token immediately
      setAuthHeader(access);

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  },

  logout: () => {
    // Clear all auth data
    Object.values(STORAGE_KEYS).forEach(key => storage.removeItem(key));
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register/', userData);
      message.success('Registration successful! Please log in.');
      return response.data;
    } catch (error) {
      // Prefer field-level validation messages if provided by DRF
      const data = error.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = Object.values(data).flat().join(' ');
        throw new Error(fieldErrors || data.detail || 'Registration failed. Please try again.');
      }
      throw new Error(error.response?.data?.detail || 'Registration failed. Please try again.');
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/password-reset/request/', { email });
      message.success('Password reset link has been sent to your email.');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to send password reset email.';
      throw new Error(errorMessage);
    }
  },

  confirmPasswordReset: async (token, newPassword) => {
    try {
      const response = await api.post('/password-reset/confirm/', {
        token,
        new_password: newPassword,
      });
      message.success('Password has been reset successfully.');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to reset password.';
      throw new Error(errorMessage);
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/profile/');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to load profile.';
      throw new Error(errorMessage);
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile/', profileData);
      message.success('Profile updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update profile.';
      throw new Error(errorMessage);
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/change-password/', {
        old_password: currentPassword,
        new_password: newPassword,
      });
      message.success('Password changed successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to change password.';
      throw new Error(errorMessage);
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!accessToken && !isTokenExpired(accessToken);
  },

  // Get auth headers
  getAuthHeader: () => {
    const accessToken = storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
  }
};

// Expose helper for external modules to set/clear auth header
authAPI.setAuthHeader = setAuthHeader;

// Notification API
export const notificationAPI = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/`, {
        is_read: true
      });
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      // If backend supports bulk update, use that endpoint
      // Otherwise, we'll handle this in the context by calling markAsRead for each
      const response = await api.post('/notifications/mark-all-read/');
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, this will fail gracefully
      console.warn('Bulk mark as read not supported:', error);
      throw error;
    }
  }
};

export default api;