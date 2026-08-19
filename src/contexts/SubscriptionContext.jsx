// contexts/SubscriptionContext.jsx - FIXED VERSION
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

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
    return localStorage.getItem('loopmart_token') || localStorage.getItem('token');
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

  // Check subscription status - using the correct endpoint /v1/subscription/status
  const checkSubscription = useCallback(async () => {
    const token = getAuthToken();
    
    if (!token) {
      console.log('No token found, subscription inactive');
      setHasSubscription(false);
      setSubscriptionDetails(null);
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Checking subscription status...');
      
      const response = await fetch(`${API_URL}/v1/subscription/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Subscription check response:', data);

      // Check if the response is successful
      const isSuccess = response.ok && (data.status === true || data.success === true);
      
      if (isSuccess) {
        // Check if subscription is active
        const subscriptionData = data.data;
        const isActive = subscriptionData?.active === true || 
                        subscriptionData?.status === 'active' ||
                        subscriptionData?.is_active === true;
        
        console.log('Subscription active:', isActive);
        setHasSubscription(isActive);
        setSubscriptionDetails(subscriptionData || null);
        return isActive;
      } else {
        console.log('Subscription check failed:', data.message || 'Unknown error');
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

  // Refresh subscription - force a fresh check
  const refreshSubscription = useCallback(async () => {
    // Just call checkSubscription directly - it handles its own loading state
    const result = await checkSubscription();
    return result;
  }, [checkSubscription]);

  // Initialize subscription - uses POST /v1/subscription
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

      console.log('Initializing subscription for interval:', interval);

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
      console.log('Subscription initialization response:', data);

      const isSuccess = data.status === true || data.success === true;

      if (response.ok && isSuccess) {
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

  // Auto-check subscription on mount when token exists
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      console.log('Auto-checking subscription on mount...');
      checkSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const value = {
    hasSubscription,
    subscriptionDetails,
    loading,
    error,
    checkSubscription,
    refreshSubscription,
    initializeSubscription,
    cancelSubscription,
    setSubscription: (active, details) => {
      setHasSubscription(active);
      if (details) setSubscriptionDetails(details);
    }
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};