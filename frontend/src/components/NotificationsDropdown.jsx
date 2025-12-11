import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Button,
  Chip,
  Stack,
  Paper,
  Tooltip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationsDropdown = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      order: '#4CAF50',
      payment: '#2196F3',
      login: '#FF9800',
      system: '#9C27B0',
      default: '#757575'
    };
    return colorMap[type] || colorMap.default;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          color="inherit"
          onClick={handleOpen}
          sx={{
            position: 'relative',
            mr: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? <NotificationsIcon /> : <NotificationsNoneIcon />}
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: '400px',
            maxHeight: '500px',
            overflow: 'auto',
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', position: 'sticky', top: 0, zIndex: 10 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications ({unreadCount} unread)
            </Typography>
            {unreadCount > 0 && (
              <Chip
                size="small"
                label="Mark all read"
                onClick={markAllAsRead}
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Divider />

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Box sx={{ textAlign: 'center', py: 2, width: '100%' }}>
              <Typography color="textSecondary" variant="body2">
                No notifications yet
              </Typography>
            </Box>
          </MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              sx={{
                backgroundColor: notification.read
                  ? 'transparent'
                  : 'rgba(63, 81, 181, 0.05)',
                borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                py: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: notification.read
                    ? 'rgba(0, 0, 0, 0.03)'
                    : 'rgba(63, 81, 181, 0.08)',
                },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ width: '100%', mb: 1 }}
                alignItems="flex-start"
              >
                <Typography variant="h6" sx={{ fontSize: '20px', mt: 0.5 }}>
                  {notification.icon || '📢'}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: notification.read ? 400 : 600,
                      mb: 0.5,
                    }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {getTimeAgo(notification.timestamp)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  sx={{ mt: -0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              {!notification.read && (
                <Chip
                  label="Unread"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              )}
            </MenuItem>
          ))
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                fullWidth
                size="small"
                startIcon={<ClearAllIcon />}
                onClick={clearAll}
                sx={{ color: 'error.main' }}
              >
                Clear All
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationsDropdown;
