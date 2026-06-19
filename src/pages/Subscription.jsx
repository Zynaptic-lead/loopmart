import React, { useState, useEffect } from 'react';
import SubscriptionWarning from '../components/dashboard/SubscriptionWarning';

export default function Subscription() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (interval) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/v1/subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ interval })
      });
      
      const data = await response.json();
      if (data.success && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>
      
      <SubscriptionWarning />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Monthly Plan</h2>
          <p className="text-4xl font-bold text-yellow-500 mb-4">₦5,000</p>
          <p className="text-gray-600 mb-6">Perfect for getting started</p>
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={loading}
            className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe Monthly'}
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 text-center border-2 border-yellow-500">
          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">Best Value</span>
          <h2 className="text-2xl font-bold mb-4">Annual Plan</h2>
          <p className="text-4xl font-bold text-yellow-500 mb-4">₦50,000</p>
          <p className="text-gray-600 mb-6">Save 20% with annual billing</p>
          <button
            onClick={() => handleSubscribe('annually')}
            disabled={loading}
            className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Subscribe Annually'}
          </button>
        </div>
      </div>
    </div>
  );
}