import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate fetching notifications (in production, this would be from API)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Initialize with some default notifications based on user type
    const defaultNotifications = [];

    if (user.user_type === 'FARMER') {
      defaultNotifications.push({
        id: 1,
        type: 'login',
        title: 'Welcome Back!',
        message: `Welcome to eFarmerConnect, ${user.username}!`,
        timestamp: new Date(),
        read: false,
        icon: '👋'
      });
    }

    setNotifications(defaultNotifications);
    setUnreadCount(defaultNotifications.filter(n => !n.read).length);

    // Simulate receiving notifications (replace with actual API polling/WebSocket in production)
    const timer = setInterval(() => {
      // This would be replaced with actual API calls
    }, 10000);

    return () => clearInterval(timer);
  }, [isAuthenticated, user]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Simulate order notifications (in production, fetch from API)
  const simulateOrderNotification = (orderData) => {
    addNotification({
      type: 'order',
      title: '📦 New Order Received',
      message: `You have a new order from ${orderData.customer_name || 'a customer'}`,
      icon: '📦'
    });
  };

  // Simulate payment notifications
  const simulatePaymentNotification = (paymentData) => {
    addNotification({
      type: 'payment',
      title: '💰 Payment Received',
      message: `Payment of RWF ${paymentData.amount} received for order #${paymentData.order_id}`,
      icon: '💰'
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        simulateOrderNotification,
        simulatePaymentNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
