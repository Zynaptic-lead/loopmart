// src/pages/PricingPage.jsx - SIMPLIFIED TEST VERSION
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import { userService } from '../services/userService';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

const vendorPlans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: '₦1,000',
    period: 'month',
    plan: 'monthly',
    cta: 'Start Monthly Plan',
    popular: false,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: '₦10,000',
    period: 'year',
    plan: 'yearly',
    cta: 'Choose Yearly Plan',
    popular: true,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { hasSubscription, refreshSubscription } = useSubscription();
  const [processingPlan, setProcessingPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Test if component is mounted
  useEffect(() => {
    console.log('✅ PricingPage mounted successfully');
  }, []);

  const handlePlanSelection = (plan) => {
    console.log('🟢 Button clicked! Plan:', plan.name);
    console.log('User logged in?', userService.isAuthenticated());
    
    if (!userService.isAuthenticated()) {
      toast?.warning('Please login first');
      navigate('/login');
      return;
    }
    
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    
    console.log('🟢 Confirming payment for plan:', selectedPlan.plan);
    setProcessingPlan(selectedPlan.id);
    
    try {
      const token = userService.getToken();
      
      if (!token) {
        toast?.error('Please login again');
        navigate('/login');
        return;
      }

      const requestBody = { plan: selectedPlan.plan };
      console.log('Sending request:', requestBody);

      const response = await fetch(`${API_URL}/v1/subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.status && data.data?.authorization_url) {
        toast?.success('Redirecting to payment...');
        setShowPaymentModal(false);
        window.location.href = data.data.authorization_url;
      } else {
        toast?.error(data.message || 'Failed to initialize');
        setShowPaymentModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast?.error('Network error');
      setShowPaymentModal(false);
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-4 border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <img 
            src={logo} 
            alt="LoopMart Logo" 
            className="h-10 w-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
            Professional E-Commerce
            <span className="block text-yellow-600 mt-2">Without the Complexity</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => {
                const el = document.getElementById('pricing-plans');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-black text-white font-semibold rounded-lg"
            >
              View Pricing Plans
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Plans Section */}
      <div id="pricing-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Simple, Transparent Pricing
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {vendorPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl overflow-hidden border p-8 bg-white ${
                plan.popular ? 'shadow-xl border-yellow-400' : 'shadow-md border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="px-6 py-2 bg-yellow-500 text-black text-sm font-bold rounded-full">
                    RECOMMENDED
                  </div>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-black">{plan.name}</h3>
              <div className="flex items-baseline mt-4">
                <span className="text-5xl font-bold text-black">{plan.price}</span>
                <span className="ml-2 text-gray-500">/{plan.period}</span>
              </div>
              
              <button
                onClick={() => {
                  console.log('🔴 Button clicked directly!');
                  handlePlanSelection(plan);
                }}
                className="w-full mt-6 py-3 px-6 rounded-lg font-semibold text-lg bg-yellow-500 text-black hover:bg-yellow-600"
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Confirm Subscription</h3>
            <p className="mb-4">You are about to subscribe to {selectedPlan.name}</p>
            <button
              onClick={handleConfirmPayment}
              disabled={processingPlan === selectedPlan.id}
              className="w-full py-3 bg-yellow-500 text-black font-bold rounded-lg"
            >
              {processingPlan === selectedPlan.id ? 'Processing...' : 'Proceed to Payment'}
            </button>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-3 py-3 border rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
