import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications from localStorage on mount
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    try {
      const saved = localStorage.getItem('loopmart_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      read: false
    };

    const updated = [newNotification, ...notifications].slice(0, 100);
    setNotifications(updated);
    setUnreadCount(prev => prev + 1);
    localStorage.setItem('loopmart_notifications', JSON.stringify(updated));
  };

  const markAsRead = (notificationId) => {
    const updated = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('loopmart_notifications', JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('loopmart_notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('loopmart_notifications');
  };

  // Listen for add-notification events
  useEffect(() => {
    const handleAddNotification = (event) => {
      addNotification(event.detail);
    };

    window.addEventListener('add-notification', handleAddNotification);
    
    return () => {
      window.removeEventListener('add-notification', handleAddNotification);
    };
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};