import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authAPI } from '../services/api';
import { message } from 'antd';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  register: () => {},
  requestPasswordReset: () => {},
  confirmPasswordReset: () => {},
  updateProfile: () => {},
  changePassword: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on initial load
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Profile fetch failed:', error);
          // If profile fetch fails but we have a token, still consider user authenticated
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      authAPI.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password) => {
    try {
      const credentials = { username, password };
      const data = await authAPI.login(credentials);
      
      if (data && data.access && data.refresh) {
        // Tokens are stored by authAPI.login; ensure axios header is set
        if (authAPI.setAuthHeader) {
          authAPI.setAuthHeader(data.access);
        } else {
          // Fallback: store tokens under legacy keys to assist other modules
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
        }
        
        // Fetch user profile
        try {
          const userData = await authAPI.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
          message.success('Login successful!');
          return { success: true, user: userData };
        } catch (profileError) {
          console.error('Profile fetch failed, but login was successful:', profileError);
          // Still consider the user authenticated even if profile fetch fails
          setIsAuthenticated(true);
          return { success: true, user: null };
        }
      }
      
      return { 
        success: false, 
        error: data?.error || 'Invalid response from server' 
      };
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message || 
                         error.message || 
                         'Login failed. Please check your credentials.';
      
      // Clear any invalid tokens
      if (error.response?.status === 401 || error.response?.status === 403) {
        authAPI.logout();
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { 
        success: false, 
        error: error.message || error.response?.data || { message: 'Registration failed' } 
      };
    }
  };

  const logout = () => {
    // Delegate logout to authAPI which clears stored tokens and redirects
    try {
      authAPI.logout();
    } catch (e) {
      // Fallback: clear local storage and reset state
      ['access_token', 'refresh_token', 'user'].forEach(key => localStorage.removeItem(key));
    }

    setUser(null);
    setIsAuthenticated(false);
    message.info('You have been logged out.');
  };

  const requestPasswordReset = async (email) => {
    try {
      await authAPI.requestPasswordReset(email);
      return { success: true };
    } catch (error) {
      console.error('Password reset request failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to request password reset' 
      };
    }
  };

  const confirmPasswordReset = async (token, newPassword) => {
    try {
      await authAPI.confirmPasswordReset(token, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to reset password' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authAPI.updateProfile(profileData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { 
        success: false, 
        error: error.response?.data || { message: 'Failed to update profile' } 
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      return { success: true };
    } catch (error) {
      console.error('Password change failed:', error);
      return { 
        success: false, 
        error: error.response?.data || { message: 'Failed to change password' } 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        updateProfile,
        changePassword,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
