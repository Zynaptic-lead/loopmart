// src/components/dashboard/SubscriptionWarning.jsx
import React, { useState, useEffect } from 'react';
import { MdWarning, MdCheckCircle, MdCancel, MdRefresh, MdInfo } from 'react-icons/md';
import { FaExclamationTriangle, FaClock } from 'react-icons/fa';

export default function SubscriptionWarning() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

  const fetchSubscriptionStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('loopmart_token') || localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      console.log('🔍 Fetching subscription status...');
      
      const response = await fetch(`${API_URL}/v1/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Subscription data:', data);
        
        if (data.status && data.data) {
          setSubscription(data.data);
        } else if (data.success && data.data) {
          setSubscription(data.data);
        } else {
          setError('Failed to fetch subscription status');
        }
      } else if (response.status === 401) {
        console.log('User not authenticated');
        setLoading(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch subscription status');
      }
    } catch (error) {
      console.error('❌ Error fetching subscription:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchSubscriptionStatus, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRenew = () => {
    window.location.href = '/pricing';
  };

  // Show nothing while loading (or show a subtle loader)
  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
          <p className="text-gray-500 text-sm">Checking subscription...</p>
        </div>
      </div>
    );
  }

  // If no subscription or error, show a warning to subscribe
  if (error || !subscription) {
    return (
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <MdWarning className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800">
              ⚠️ No Active Subscription
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              You don't have an active subscription. Subscribe to start selling!
            </p>
            <button 
              onClick={handleRenew}
              className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If subscription is active and NOT expiring soon (more than 7 days)
  if (subscription.active && !subscription.is_expiring_soon) {
    const expiryDate = subscription.expires_at ? new Date(subscription.expires_at) : null;
    const formattedDate = expiryDate ? expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A';
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2">
          <MdCheckCircle className="text-green-500 text-lg flex-shrink-0" />
          <p className="text-green-700 text-sm">
            ✅ Active until <strong>{formattedDate}</strong>
          </p>
        </div>
      </div>
    );
  }

  // ==============================================
  // ⚠️ EXPIRING SOON - THIS IS WHAT YOU WANT TO SEE
  // ==============================================
  if (subscription.is_expiring_soon) {
    const daysLeft = subscription.days_until_expiry || 0;
    const expiryDate = subscription.expires_at ? new Date(subscription.expires_at) : null;
    const formattedDate = expiryDate ? expiryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'N/A';
    
    return (
      <div className="bg-red-50 border border-red-400 rounded-lg p-4 mb-4 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <FaExclamationTriangle className="text-red-600 text-xl" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-red-800 text-lg">
              ⚠️ Subscription Expiring Soon!
            </p>
            <p className="text-red-700 text-sm mt-1">
              Your subscription will expire in <strong>{daysLeft} days</strong> on <strong>{formattedDate}</strong>.
            </p>
            <p className="text-red-600 text-xs mt-1">
              Your products will be hidden from the shop after expiry. Renew now to keep selling!
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <button 
                onClick={handleRenew}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <MdRefresh className="text-white" />
                Renew Subscription Now
              </button>
              <span className="text-xs text-red-600">
                <FaClock className="inline mr-1" />
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If subscription expired
  const expiryDate = subscription.expires_at ? new Date(subscription.expires_at) : null;
  const formattedDate = expiryDate ? expiryDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';
  
  return (
    <div className="bg-red-50 border border-red-400 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <MdCancel className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-red-800">❌ Subscription Expired</p>
          <p className="text-red-700 text-sm mt-1">
            Your subscription expired on <strong>{formattedDate}</strong>. 
            Your products are now hidden from the shop.
          </p>
          <button 
            onClick={handleRenew}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Renew Subscription
          </button>
        </div>
      </div>
    </div>
  );
}