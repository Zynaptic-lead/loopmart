// src/contexts/SubscriptionContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import subscriptionService from '../services/subscriptionService';
import { userService } from '../services/userService';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [plan, setPlan] = useState(null);

  const checkSubscription = async () => {
    if (!userService.isAuthenticated()) {
      setHasSubscription(false);
      setLoading(false);
      return false;
    }

    setLoading(true);
    try {
      const response = await subscriptionService.getSubscriptionStatus();
      console.log('🔍 Subscription status check:', response);
      
      if (response.status && response.data) {
        const isActive = response.data.is_active || response.data.active || false;
        setHasSubscription(isActive);
        
        if (response.data.expires_at) {
          setExpiryDate(new Date(response.data.expires_at));
        }
        
        if (response.data.plan) {
          setPlan(response.data.plan);
        }
        
        setSubscriptionDetails(response.data);
        
        // Cache in localStorage for quick access
        if (isActive) {
          localStorage.setItem('loopmart_subscription', JSON.stringify({
            active: true,
            expires_at: response.data.expires_at,
            plan: response.data.plan
          }));
        } else {
          localStorage.removeItem('loopmart_subscription');
        }
        
        return isActive;
      } else {
        setHasSubscription(false);
        localStorage.removeItem('loopmart_subscription');
        return false;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasSubscription(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = async () => {
    return await checkSubscription();
  };

  const initiateSubscription = async (planData) => {
    try {
      const response = await subscriptionService.initiateSubscription(planData);
      return response;
    } catch (error) {
      console.error('Error initiating subscription:', error);
      throw error;
    }
  };

  const verifyPayment = async (reference) => {
    try {
      const response = await subscriptionService.verifyPayment(reference);
      if (response.status && response.data?.active) {
        await refreshSubscription();
      }
      return response;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      const response = await subscriptionService.cancelSubscription();
      if (response.status) {
        await refreshSubscription();
      }
      return response;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  };

  const setSubscription = (active, expiry = null) => {
    setHasSubscription(active);
    setExpiryDate(expiry);
    if (!active) {
      localStorage.removeItem('loopmart_subscription');
    }
  };

  // Auto-check on mount and when auth changes
  useEffect(() => {
    checkSubscription();
    
    // Listen for auth changes
    const unsubscribe = userService.subscribe(() => {
      checkSubscription();
    });
    
    // Listen for storage events (in case subscription is updated in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'loopmart_token' || e.key === 'auth_token' || e.key === 'loopmart_user') {
        checkSubscription();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{
      hasSubscription,
      expiryDate,
      loading,
      subscriptionDetails,
      plan,
      checkSubscription,
      refreshSubscription,
      initiateSubscription,
      verifyPayment,
      cancelSubscription,
      setSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};