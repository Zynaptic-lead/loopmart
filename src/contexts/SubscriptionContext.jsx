import React, { createContext, useState, useContext, useEffect } from 'react';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check subscription status from localStorage on mount
  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = () => {
    try {
      const subscriptionData = localStorage.getItem('subscription');
      if (subscriptionData) {
        const { active, expiry } = JSON.parse(subscriptionData);
        if (active && expiry) {
          const expiryDate = new Date(expiry);
          if (expiryDate > new Date()) {
            setHasSubscription(true);
            setSubscriptionExpiry(expiryDate);
          } else {
            // Subscription expired
            localStorage.removeItem('subscription');
            setHasSubscription(false);
            setSubscriptionExpiry(null);
          }
        } else {
          setHasSubscription(false);
          setSubscriptionExpiry(null);
        }
      } else {
        setHasSubscription(false);
        setSubscriptionExpiry(null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasSubscription(false);
      setSubscriptionExpiry(null);
    } finally {
      setLoading(false);
    }
  };

  const setSubscription = (active, expiryDate = null) => {
    if (active && expiryDate) {
      const subscriptionData = {
        active: true,
        expiry: expiryDate.toISOString()
      };
      localStorage.setItem('subscription', JSON.stringify(subscriptionData));
      setHasSubscription(true);
      setSubscriptionExpiry(expiryDate);
    } else {
      localStorage.removeItem('subscription');
      setHasSubscription(false);
      setSubscriptionExpiry(null);
    }
  };

  const value = {
    hasSubscription,
    subscriptionExpiry,
    loading,
    checkSubscription,
    setSubscription
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};