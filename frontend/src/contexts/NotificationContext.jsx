import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { notificationAPI } from '../services/api';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

// Helper to get icon based on notification type
const getNotificationIcon = (type) => {
  const iconMap = {
    'ORDER': '📦',
    'PAYMENT': '💰',
    'WEATHER': '🌦️',
    'PRICE': '💵',
    'ADVICE': '🌾'
  };
  return iconMap[type] || '🔔';
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications();

      // Transform backend notifications to match frontend format
      const transformedNotifications = data.map(notif => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        timestamp: new Date(notif.created_at),
        read: notif.is_read,
        icon: getNotificationIcon(notif.type)
      }));

      setNotifications(transformedNotifications);
      setUnreadCount(transformedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Don't clear notifications on error, keep existing ones
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial fetch and polling
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Fetch immediately on mount
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [isAuthenticated, user, fetchNotifications]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Optimistically update UI
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Update on backend
      await notificationAPI.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Optimistically update UI
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);

      // Try bulk update on backend
      try {
        await notificationAPI.markAllAsRead();
      } catch (bulkError) {
        // If bulk endpoint doesn't exist, mark individually
        const unreadNotifs = notifications.filter(n => !n.read);
        await Promise.all(
          unreadNotifs.map(notif => notificationAPI.markAsRead(notif.id))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update on error
      fetchNotifications();
    }
  };

  // Delete notification (local only for now, can add API call if needed)
  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    setUnreadCount(prev => {
      const deletedNotif = notifications.find(n => n.id === notificationId);
      return deletedNotif && !deletedNotif.read ? Math.max(0, prev - 1) : prev;
    });
  };

  // Clear all notifications (local only)
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Add a new notification locally (for real-time updates if needed)
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      icon: getNotificationIcon(notification.type || 'ORDER'),
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // Refresh notifications manually
  const refreshNotifications = () => {
    fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
