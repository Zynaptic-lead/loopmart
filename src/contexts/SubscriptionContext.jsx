// contexts/SubscriptionContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const SubscriptionContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('loopmart_token');
  };

  // Get user data
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('loopmart_user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  };

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    const token = getAuthToken();
    
    if (!token) {
      setHasSubscription(false);
      setSubscriptionDetails(null);
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/v1/subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status === true) {
        // Check if subscription is active
        const isActive = data.data?.status === 'active' || data.data?.is_active === true;
        setHasSubscription(isActive);
        setSubscriptionDetails(data.data || null);
        return isActive;
      } else {
        setHasSubscription(false);
        setSubscriptionDetails(null);
        return false;
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err.message);
      setHasSubscription(false);
      setSubscriptionDetails(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize subscription
  const initializeSubscription = async (interval) => {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Please login to subscribe'
      };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/v1/subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ interval })
      });

      const data = await response.json();

      if (response.ok && data.status === true) {
        // After successful subscription, check status again
        await checkSubscription();
        
        return {
          success: true,
          data: data.data,
          message: data.message || 'Subscription initialized successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to initialize subscription'
        };
      }
    } catch (err) {
      console.error('Error initializing subscription:', err);
      return {
        success: false,
        message: err.message || 'Network error. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async () => {
    const token = getAuthToken();
    
    if (!token) {
      return {
        success: false,
        message: 'Please login to cancel subscription'
      };
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/v1/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.status === true) {
        setHasSubscription(false);
        setSubscriptionDetails(null);
        
        return {
          success: true,
          message: data.message || 'Subscription cancelled successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to cancel subscription'
        };
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      return {
        success: false,
        message: err.message || 'Network error. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    hasSubscription,
    subscriptionDetails,
    loading,
    error,
    checkSubscription,
    initializeSubscription,
    cancelSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};