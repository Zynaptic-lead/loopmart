import React, { useState, useEffect } from 'react';
import { MdWarning, MdCheckCircle, MdCancel, MdRefresh } from 'react-icons/md';
import { FaExclamationTriangle, FaClock } from 'react-icons/fa';

export default function SubscriptionWarning() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use environment variable - NO HARDCODING
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

      const response = await fetch(`${API_URL}/v1/subscription/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubscription(data.data);
        } else {
          setError('Failed to fetch subscription status');
        }
      } else if (response.status === 401) {
        // User not authenticated, silently fail
        setLoading(false);
      } else {
        setError('Failed to fetch subscription status');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchSubscriptionStatus, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRenew = () => {
    window.location.href = '/subscription';
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-500"></div>
          <p className="text-gray-600 text-sm">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return null;
  }

  // If subscription is active and not expiring soon
  if (subscription.active && !subscription.is_expiring_soon) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <MdCheckCircle className="text-green-500 text-xl flex-shrink-0" />
          <div>
            <p className="text-green-700 font-medium">
              ✅ Active Subscription
            </p>
            <p className="text-green-600 text-sm">
              Your subscription is active until <strong>
                {subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </strong>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If subscription is expiring soon (within 7 days)
  if (subscription.is_expiring_soon) {
    const daysLeft = subscription.days_until_expiry;
    
    return (
      <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-4 mb-4 animate-pulse">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800">
              ⚠️ Subscription Expiring Soon!
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              {subscription.warning_message || 
                `Your subscription will expire in ${daysLeft} days on ${
                  subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'
                }.`}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button 
                onClick={handleRenew}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <MdRefresh className="text-white" />
                Renew Now
              </button>
              <span className="text-xs text-yellow-600">
                {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If subscription expired
  return (
    <div className="bg-red-50 border border-red-400 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <MdCancel className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-red-800">❌ Subscription Expired</p>
          <p className="text-red-700 text-sm mt-1">
            {subscription.warning_message || 
              `Your subscription expired on ${
                subscription.expires_at ? new Date(subscription.expires_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'
              }. Your products are now hidden from the shop.`}
          </p>
          <button 
            onClick={handleRenew}
            className="mt-3 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Renew Subscription
          </button>
        </div>
      </div>
    </div>
  );
}