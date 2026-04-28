// src/pages/PricingPage.jsx - FULLY RESPONSIVE VERSION
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaCheck, FaStore, FaCalendarAlt, FaCrown, 
  FaShieldAlt, FaHeadset, FaGlobe, FaCreditCard,
  FaUsers, FaStar, FaRocket, FaShoppingCart,
  FaMoneyBillWave, FaHandshake, FaChartLine,
  FaTimesCircle, FaBuilding, FaEye, FaMedal,
  FaLock, FaTrophy, FaArrowRight, FaPercent,
  FaBolt, FaArrowLeft, FaSpinner, FaTimes,
  FaBars, FaTimes as FaClose
} from 'react-icons/fa';
import { MdAttachMoney, MdTrendingUp } from 'react-icons/md';
import { IoIosBusiness } from 'react-icons/io';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

const vendorPlans = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: '₦1,000',
    period: 'month',
    interval: 'monthly',
    description: 'Flexible monthly subscription for growing businesses',
    features: [
      { text: 'Dedicated online shop on LoopMart', icon: IoIosBusiness },
      { text: 'Unlimited product & service listings', icon: FaShoppingCart },
      { text: 'Professional product gallery', icon: FaGlobe },
      { text: 'Direct buyer communication channel', icon: FaHandshake },
      { text: 'Marketplace visibility', icon: FaEye },
      { text: 'Standard customer support', icon: FaHeadset },
    ],
    cta: 'Start Monthly Plan',
    popular: false,
    highlight: 'Flexible monthly billing. Cancel anytime.',
    durationDays: 30,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: '₦10,000',
    period: 'year',
    interval: 'annually',
    description: 'Annual plan with maximum savings & benefits',
    features: [
      { text: 'All Monthly Plan features', icon: FaCheck },
      { text: 'Save ₦2,000 (2 months free)', icon: FaPercent },
      { text: 'Priority search visibility', icon: MdTrendingUp },
      { text: 'Verified seller badge', icon: FaMedal },
      { text: 'Enhanced shop customization', icon: FaBuilding },
      { text: 'Priority customer support', icon: FaBolt },
    ],
    cta: 'Choose Yearly Plan',
    popular: true,
    highlight: 'Best Value - Save 17% + premium features',
    durationDays: 365,
  },
];

const faqs = [
  {
    question: 'How does LoopMart differ from traditional marketplaces?',
    answer: 'LoopMart focuses on direct vendor-buyer connections without handling payments. You maintain full control over transactions while we provide the platform and visibility.',
  },
  {
    question: 'Can I list both products and services?',
    answer: 'Absolutely. Our platform supports listing physical products, digital goods, and professional services with customizable categories and pricing models.',
  },
  {
    question: 'What payment methods are available for vendors?',
    answer: 'You handle payments directly with buyers using your preferred methods (bank transfer, mobile money, cash). LoopMart doesn\'t process payments, so you receive funds immediately.',
  },
  {
    question: 'How quickly can I upgrade or downgrade my plan?',
    answer: 'Plan changes are instant. Downgrades take effect at your next billing cycle, while upgrades are applied immediately with prorated billing.',
  },
  {
    question: 'Do you offer bulk listing capabilities?',
    answer: 'Yes, all plans include bulk CSV upload functionality for efficient product management, with enhanced capabilities for annual subscribers.',
  },
  {
    question: 'Is there a setup fee or hidden charges?',
    answer: 'No hidden fees. Your subscription covers all platform features. We\'re transparent about pricing to help you budget effectively.',
  },
];

const features = [
  {
    title: 'Direct Commerce Platform',
    description: 'Connect directly with buyers while maintaining full control over pricing and transactions.',
    icon: FaHandshake,
  },
  {
    title: 'Brand Building Tools',
    description: 'Customizable shop profiles that help establish and grow your brand identity.',
    icon: FaBuilding,
  },
  {
    title: 'Secure & Verified',
    description: 'Enterprise-grade security with verified seller profiles for increased buyer trust.',
    icon: FaShieldAlt,
  },
  {
    title: 'Advanced Analytics',
    description: 'Insightful dashboard showing visitor trends, engagement metrics, and performance data.',
    icon: FaChartLine,
  },
  {
    title: 'Growth Optimization',
    description: 'Tools and features designed to help scale your business efficiently.',
    icon: MdTrendingUp,
  },
  {
    title: 'Premium Support',
    description: 'Dedicated support channels with faster response times for business-critical issues.',
    icon: FaHeadset,
  },
];

const PaymentModal = ({ isOpen, onClose, plan, onConfirm, processing }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-black">Confirm Subscription</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <FaTimes size={20} className="sm:text-2xl" />
          </button>
        </div>

        <div className="mb-6">
          <div className={`p-3 sm:p-4 rounded-lg ${plan?.popular ? 'bg-yellow-50' : 'bg-gray-50'} mb-4`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              {plan?.popular ? <FaCrown className="text-yellow-600 text-lg sm:text-xl" /> : <FaStore className="text-black text-lg sm:text-xl" />}
              <h4 className="text-lg sm:text-xl font-bold">{plan?.name}</h4>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-black">{plan?.price}</span>
              <span className="text-sm sm:text-base text-gray-500">/{plan?.period}</span>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3">
            <h5 className="font-semibold text-gray-700 text-sm sm:text-base">You'll get:</h5>
            {plan?.features.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <FaCheck className="text-green-500 mt-1 flex-shrink-0 text-sm sm:text-base" />
                <span className="text-gray-600 text-sm sm:text-base">{feature.text}</span>
              </div>
            ))}
            <p className="text-xs sm:text-sm text-gray-500 mt-2">...and {plan?.features.length - 3} more features</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
          <p className="text-xs sm:text-sm text-blue-800">
            <strong>Note:</strong> You'll be redirected to Paystack to complete your payment securely.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={processing}
            className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 ${
              plan?.popular
                ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                : 'bg-black text-white hover:bg-gray-900'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {processing ? (
              <div className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              `Proceed to Payment`
            )}
          </button>
          <button
            onClick={onClose}
            disabled={processing}
            className="w-full py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const LoginPromptModal = ({ isOpen, onClose, onLogin, onSignup }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-black">Login Required</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2">
            <FaTimes size={20} className="sm:text-2xl" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-6 text-sm sm:text-base">
          You need to be logged in to subscribe to a plan. Please login or create an account to continue.
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={onLogin}
            className="w-full py-2.5 sm:py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition text-sm sm:text-base"
          >
            Login to Your Account
          </button>
          <button
            onClick={onSignup}
            className="w-full py-2.5 sm:py-3 border-2 border-black text-black font-bold rounded-lg hover:bg-gray-50 transition text-sm sm:text-base"
          >
            Create New Account
          </button>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 mt-2"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function PricingPage() {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  
  const { hasSubscription, setSubscription, checkSubscription } = useSubscription();

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    const paymentRef = reference || trxref;
    
    if (paymentRef && !verifyingPayment) {
      verifyPayment(paymentRef);
    }
  }, [searchParams]);

  const verifyPayment = async (reference) => {
    setVerifyingPayment(true);
    
    try {
      toast?.info('Verifying your payment...');
      
      const token = getToken();
      
      if (!token) {
        toast?.error('Session expired. Please login again.');
        window.location.href = '/login';
        return;
      }
      
      const response = await fetch(`${API_URL}/v1/subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Subscription status after payment:', data);
      
      if (data.status && data.data?.active) {
        toast?.success('Payment successful! Your subscription is now active.');
        const expiryDate = new Date(data.data.expires_at);
        setSubscription(true, expiryDate);
        window.location.href = '/start-selling';
      } else {
        toast?.info('Payment completed. Activating your subscription...');
        
        setTimeout(async () => {
          const retryResponse = await fetch(`${API_URL}/v1/subscription`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          const retryData = await retryResponse.json();
          
          if (retryData.status && retryData.data?.active) {
            toast?.success('Subscription activated! Redirecting...');
            const expiryDate = new Date(retryData.data.expires_at);
            setSubscription(true, expiryDate);
            window.location.href = '/start-selling';
          } else {
            toast?.warning('Subscription activation in progress. Redirecting...');
            window.location.href = '/start-selling';
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast?.error('Failed to verify payment. Redirecting...');
      window.location.href = '/start-selling';
    } finally {
      setVerifyingPayment(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  const getToken = () => {
    return localStorage.getItem('loopmart_token') || localStorage.getItem('auth_token');
  };

  const getUserData = () => {
    try {
      const userData = localStorage.getItem('loopmart_user');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  const scrollToPlans = () => {
    document.getElementById('pricing-plans')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
    setMobileMenuOpen(false);
  };

  const isUserLoggedIn = () => {
    const token = getToken();
    const user = getUserData();
    return !!token && !!user;
  };

  const handlePlanSelection = (plan) => {
    setSelectedPlan(plan);
    
    if (!isUserLoggedIn()) {
      setShowLoginModal(true);
      toast?.warning('Please login to subscribe to a plan');
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPlan) return;
    
    setProcessingPlan(selectedPlan.id);
    
    try {
      const token = getToken();
      
      if (!token) {
        toast?.error('Authentication failed. Please login again.');
        setShowPaymentModal(false);
        setShowLoginModal(true);
        return;
      }

      sessionStorage.setItem('selected_plan', selectedPlan.name);
      sessionStorage.setItem('plan_amount', selectedPlan.price.replace('₦', '').replace(',', ''));
      sessionStorage.setItem('plan_interval', selectedPlan.interval);

      const requestBody = {
        interval: selectedPlan.interval
      };
      
      console.log('Sending request to:', `${API_URL}/v1/subscription`);
      console.log('Request body:', requestBody);

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
      console.log('API Response:', data);

      if (data.status && data.data?.authorization_url) {
        toast?.success('Transaction initialized! Redirecting to payment...');
        setShowPaymentModal(false);
        window.location.href = data.data.authorization_url;
      } else {
        const errorMessage = data.message || data.error || 'Failed to initialize subscription.';
        toast?.error(errorMessage);
        setShowPaymentModal(false);
        sessionStorage.removeItem('selected_plan');
        sessionStorage.removeItem('plan_amount');
        sessionStorage.removeItem('plan_interval');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast?.error('Network error. Please try again.');
      setShowPaymentModal(false);
      sessionStorage.removeItem('selected_plan');
      sessionStorage.removeItem('plan_amount');
      sessionStorage.removeItem('plan_interval');
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleStartSelling = () => {
    const isSubscribed = hasSubscription;
    
    if (isSubscribed) {
      navigate('/start-selling');
    } else {
      scrollToPlans();
      toast?.info('Please subscribe to a plan to start selling!');
    }
    setMobileMenuOpen(false);
  };

  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl sm:text-4xl text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600 text-sm sm:text-base">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  const SubscriptionStatusBanner = () => {
    if (!hasSubscription) return null;
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <FaCheck className="text-green-500 text-lg sm:text-xl flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-800 text-sm sm:text-base">You have an active subscription!</h3>
              <p className="text-xs sm:text-sm text-green-600">You can start selling right away.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/start-selling')}
            className="px-4 sm:px-6 py-1.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            Go to Start Selling
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setSelectedPlan(null);
        }}
        onLogin={() => {
          setShowLoginModal(false);
          navigate('/login?redirect=/pricing');
        }}
        onSignup={() => {
          setShowLoginModal(false);
          navigate('/signup?redirect=/pricing');
        }}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onConfirm={handleConfirmPayment}
        processing={processingPlan === selectedPlan?.id}
      />

      {/* Responsive Header */}
      <div className="py-3 sm:py-4 border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <img 
              src={logo} 
              alt="LoopMart Logo" 
              className="h-8 sm:h-10 w-auto cursor-pointer"
              onClick={() => navigate('/')}
            />
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <button 
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-black transition text-sm lg:text-base"
              >
                Home
              </button>
              <button 
                onClick={scrollToPlans}
                className="text-gray-600 hover:text-black transition text-sm lg:text-base"
              >
                Pricing
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="text-gray-600 hover:text-black transition text-sm lg:text-base"
              >
                Contact
              </button>
              {!hasSubscription && (
                <button
                  onClick={handleStartSelling}
                  className="px-4 lg:px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition text-sm lg:text-base"
                >
                  Start Selling
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {mobileMenuOpen ? <FaClose size={20} /> : <FaBars size={20} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 py-4 border-t border-gray-200"
            >
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                    navigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-black transition py-2 text-left"
                >
                  Home
                </button>
                <button 
                  onClick={scrollToPlans}
                  className="text-gray-600 hover:text-black transition py-2 text-left"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => {
                    navigate('/contact');
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-black transition py-2 text-left"
                >
                  Contact
                </button>
                {!hasSubscription && (
                  <button
                    onClick={handleStartSelling}
                    className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition text-center"
                  >
                    Start Selling
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Hero Section - Responsive */}
      <div className="pt-8 sm:pt-12 lg:pt-20 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-50 border border-yellow-200 rounded-full mb-4 sm:mb-6">
              <span className="text-xs sm:text-sm font-semibold text-yellow-800 flex items-center gap-1 sm:gap-2">
                <FaRocket className="text-yellow-600 text-xs sm:text-sm" />
                GROW YOUR BUSINESS ONLINE
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 leading-tight">
              Professional E-Commerce
              <span className="block text-yellow-600 mt-2">
                Without the Complexity
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
              LoopMart provides enterprise-grade online selling infrastructure. 
              Focus on your business while we handle the platform, visibility, and connections.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <button 
                onClick={scrollToPlans}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                View Pricing Plans
                <FaArrowRight className="text-sm sm:text-base" />
              </button>
              
              <button
                onClick={handleStartSelling}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-black text-black font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-300 text-sm sm:text-base"
              >
                {hasSubscription ? 'Start Selling Now' : 'Get Started'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Plans Section - Responsive Grid */}
      <div id="pricing-plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Choose the plan that aligns with your business goals. Both include 
              our core platform features with varying levels of premium benefits.
            </p>
          </motion.div>
        </div>

        <SubscriptionStatusBanner />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 max-w-6xl mx-auto">
          {vendorPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative rounded-2xl overflow-hidden border transition-transform duration-300 hover:scale-[1.02] ${
                plan.popular 
                  ? 'shadow-xl border-yellow-400' 
                  : 'shadow-md border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="px-4 sm:px-6 py-1.5 sm:py-2 bg-yellow-500 text-black text-xs sm:text-sm font-bold rounded-full shadow-lg flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    <FaCrown className="text-sm sm:text-base" />
                    RECOMMENDED
                  </div>
                </div>
              )}
              
              <div className="p-5 sm:p-6 md:p-8 bg-white">
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-black">{plan.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{plan.description}</p>
                    </div>
                    <div className={`p-2 sm:p-3 rounded-full ${
                      plan.popular ? 'bg-yellow-500 text-black' : 'bg-black text-white'
                    } shadow-sm`}>
                      {plan.popular ? (
                        <FaTrophy className="text-lg sm:text-xl" />
                      ) : (
                        <FaStore className="text-lg sm:text-xl" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline flex-wrap">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">{plan.price}</span>
                      <span className="ml-2 text-sm sm:text-base text-gray-500">/{plan.period}</span>
                    </div>
                    {plan.highlight && (
                      <p className={`mt-2 text-xs sm:text-sm font-medium ${
                        plan.popular ? 'text-yellow-600' : 'text-gray-500'
                      }`}>
                        {plan.highlight}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePlanSelection(plan)}
                    disabled={hasSubscription}
                    className={`w-full py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 ${
                      hasSubscription
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : plan.popular
                          ? 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-md hover:shadow-lg'
                          : 'bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg'
                    }`}
                  >
                    {hasSubscription ? 'Already Subscribed' : plan.cta}
                  </button>
                </div>
                
                <div className="border-t border-gray-100 pt-6 sm:pt-8">
                  <h4 className="text-base sm:text-lg font-semibold text-black mb-4 sm:mb-6 flex items-center gap-2">
                    <FaCheck className="text-green-500 text-sm sm:text-base" />
                    Included Features
                  </h4>
                  <ul className="space-y-3 sm:space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 mt-0.5 text-yellow-500">
                          <feature.icon className="text-base sm:text-lg" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-700">
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section - Responsive */}
      <div className="bg-black py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Why Professional Vendors Choose LoopMart
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-3xl mx-auto px-4">
              Our platform is designed for serious businesses looking to establish 
              and grow their online presence with minimal friction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-yellow-500/30 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <FaCheck className="text-green-400 text-lg sm:text-xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Our Value Proposition</h3>
              </div>
              
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <FaStore className="text-yellow-400 mt-1 flex-shrink-0 text-sm sm:text-base" />
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base mb-1">Complete E-Commerce Platform</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">Full-featured online shop without technical complexity</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <FaHandshake className="text-yellow-400 mt-1 flex-shrink-0 text-sm sm:text-base" />
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base mb-1">Direct Business Relationships</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">Build lasting customer connections with full transaction control</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <MdTrendingUp className="text-yellow-400 mt-1 flex-shrink-0 text-base sm:text-xl" />
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base mb-1">Growth Infrastructure</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">Scalable tools designed for business expansion</p>
                  </div>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-800 hover:border-red-500/30 transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <FaTimesCircle className="text-red-400 text-lg sm:text-xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">What We're Not</h3>
              </div>
              
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start gap-2 sm:gap-3">
                  <FaCreditCard className="text-red-400 mt-1 flex-shrink-0 text-sm sm:text-base" />
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base mb-1">Not a Payment Processor</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">We don't handle transactions or collect fees on your sales</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <MdAttachMoney className="text-red-400 mt-1 flex-shrink-0 text-base sm:text-xl" />
                  <div>
                    <h4 className="font-semibold text-white text-sm sm:text-base mb-1">Not a Middleman</h4>
                    <p className="text-gray-300 text-xs sm:text-sm">No commission fees or hidden charges on your revenue</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <FaLock className="text-yellow-400 mt-1 flex-shrink-0 text-sm sm:text-base" />
                  <div className="bg-gray-800 rounded-xl p-3 sm:p-4 mt-2 border border-gray-700 w-full">
                    <p className="text-white text-xs sm:text-sm font-medium">
                      💡 You maintain complete financial control. Buyers pay you directly, 
                      and you receive 100% of your sales revenue.
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Grid - Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6">
            Professional-Grade Features
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Tools and capabilities designed for serious business growth
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 hover:border-yellow-300 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${
                index % 2 === 0 ? 'bg-yellow-50' : 'bg-gray-50'
              } flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 border ${
                index % 2 === 0 ? 'border-yellow-100' : 'border-gray-100'
              }`}>
                <feature.icon className={`text-xl sm:text-2xl ${
                  index % 2 === 0 ? 'text-yellow-600' : 'text-black'
                }`} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ Section - Responsive */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full mb-4 sm:mb-6 shadow-sm border border-gray-200">
              <span className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1 sm:gap-2">
                <FaHeadset className="text-yellow-600 text-xs sm:text-sm" />
                SUPPORT & GUIDANCE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Clear answers to help you make informed decisions about your business
            </p>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-200 hover:border-yellow-200"
              >
                <button
                  onClick={() => setActiveFAQ(activeFAQ === index ? null : index)}
                  className="w-full p-4 sm:p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                  aria-expanded={activeFAQ === index}
                >
                  <span className="text-sm sm:text-base lg:text-lg font-semibold text-black pr-4 sm:pr-8">{faq.question}</span>
                  <span className={`text-gray-500 text-sm sm:text-base transition-transform duration-300 ${activeFAQ === index ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {activeFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section - Responsive */}
      <div className="bg-black py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-500/20 rounded-full mb-6 sm:mb-8 border border-yellow-500/30">
              <span className="text-xs sm:text-sm font-semibold text-yellow-300 flex items-center gap-1 sm:gap-2">
                <FaBolt className="text-xs sm:text-sm" />
                READY TO ELEVATE YOUR BUSINESS
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6 px-4">
              {hasSubscription ? 'Continue Your Professional Journey' : 'Start Your Professional Online Journey Today'}
            </h2>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
              {hasSubscription 
                ? 'Your subscription is active. Start listing products and growing your business right now!'
                : 'Join thousands of successful vendors who trust LoopMart for their online business infrastructure. No technical skills required.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <button 
                onClick={handleStartSelling}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-all duration-300 text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 border border-yellow-600"
              >
                <FaStore className="text-sm sm:text-base" />
                {hasSubscription ? 'Go to Start Selling' : 'Create Your Professional Shop'}
                <FaArrowRight className="text-sm sm:text-base" />
              </button>
              <button 
                onClick={() => navigate('/contact')}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold rounded-lg hover:bg-yellow-500/10 transition-all duration-300 text-sm sm:text-base lg:text-lg"
              >
                Schedule Business Consultation
              </button>
            </div>
            
            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-xl mx-auto px-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">No Setup Fee</div>
                <div className="text-xs sm:text-sm text-gray-400">Start instantly</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">30-Day Trial</div>
                <div className="text-xs sm:text-sm text-gray-400">Risk-free start</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-white">24/7 Support</div>
                <div className="text-xs sm:text-sm text-gray-400">Always available</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
