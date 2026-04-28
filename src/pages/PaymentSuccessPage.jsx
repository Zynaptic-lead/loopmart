// pages/PaymentSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaStore, 
  FaCreditCard, 
  FaArrowRight, 
  FaTachometerAlt, 
  FaHome,
  FaShoppingCart,
  FaSpinner
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useToast } from '../contexts/ToastContext';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkSubscription, hasSubscription } = useSubscription();
  const toast = useToast();
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingSubscription, setVerifyingSubscription] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('loopmart_token');
    const user = localStorage.getItem('loopmart_user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(user));
    }
    
    // Get payment details from URL params (Paystack returns these)
    const params = new URLSearchParams(location.search);
    const reference = params.get('reference');
    const trxref = params.get('trxref');
    const paymentRef = reference || trxref;
    
    // Get plan from sessionStorage (set when user selected plan)
    const selectedPlan = sessionStorage.getItem('selected_plan');
    const planAmount = sessionStorage.getItem('plan_amount');
    const planInterval = sessionStorage.getItem('plan_interval');
    
    console.log('Payment Success Page - URL Params:', {
      reference,
      trxref,
      paymentRef,
      selectedPlan,
      planAmount,
      planInterval
    });
    
    if (paymentRef) {
      // Real payment from Paystack
      setPaymentDetails({
        plan: selectedPlan || 'Seller Plan',
        planInterval: planInterval || 'monthly',
        amount: planAmount || '0',
        transactionId: paymentRef,
        timestamp: new Date().toLocaleString(),
        status: 'completed',
        isRealPayment: true
      });
      
      // Verify subscription status after successful payment
      verifyAndUpdateSubscription();
    } else if (location.state?.paymentDetails) {
      // Payment details passed via navigation state
      setPaymentDetails(location.state.paymentDetails);
    } else {
      // No payment reference found - redirect to pricing
      console.error('No payment reference found');
      toast?.error('Invalid payment session. Please subscribe again.');
      navigate('/pricing');
    }
    
    setLoading(false);
  }, [location]);

  const verifyAndUpdateSubscription = async () => {
    setVerifyingSubscription(true);
    try {
      // Refresh subscription status from backend
      const isActive = await checkSubscription();
      console.log('Subscription verification result:', isActive);
      
      if (isActive) {
        toast?.success('Subscription activated successfully!');
      } else {
        // Wait a bit and retry
        setTimeout(async () => {
          await checkSubscription();
        }, 3000);
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
    } finally {
      setVerifyingSubscription(false);
      // Clear session storage
      sessionStorage.removeItem('selected_plan');
      sessionStorage.removeItem('plan_amount');
      sessionStorage.removeItem('plan_interval');
    }
  };

  const handleListProduct = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/start-selling');
      return;
    }
    
    // Check subscription status first
    const isActive = await checkSubscription();
    
    if (isActive) {
      // User has active subscription, go to start selling
      navigate('/start-selling');
    } else {
      // No active subscription, go to pricing
      toast?.error('Please subscribe to a plan to list products');
      navigate('/pricing');
    }
  };

  const handleGoToDashboard = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard');
      return;
    }
    navigate('/dashboard');
  };

  const handleBrowseProducts = () => {
    navigate('/');
  };

  if (loading || verifyingSubscription) {
    return (
      <div className="min-h-screen bg-green-100 flex items-center justify-center p-4">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Format amount display
  const formatAmount = (amount) => {
    if (!amount) return '₦0';
    // Remove any non-numeric characters except decimal
    const numericAmount = String(amount).replace(/[^0-9.]/g, '');
    const num = parseFloat(numericAmount);
    if (isNaN(num)) return `₦${amount}`;
    return `₦${num.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-green-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8"
      >
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
        </motion.div>

        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src={logo} 
            alt="LoopMart" 
            className="h-12 w-auto mx-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Payment Successful! 🎉</h1>
          <p className="text-gray-600 text-md mt-2">
            Your subscription has been activated successfully.
          </p>
        </div>

        {/* Payment Details Card */}
        {paymentDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200"
          >
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaCreditCard className="text-green-600" />
              Subscription Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold text-gray-900">
                  {paymentDetails.plan} {paymentDetails.planInterval === 'yearly' ? '(Annual)' : '(Monthly)'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-green-600 text-lg">
                  {formatAmount(paymentDetails.amount)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs text-gray-700">{paymentDetails.transactionId}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-700">{paymentDetails.timestamp}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* What's Next Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">What would you like to do next?</h2>
          
          <div className="flex flex-col gap-4">
            {/* Row with two buttons side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Button 1: List Your Product - Yellow background */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleListProduct}
                className="flex items-center justify-between gap-3 bg-yellow-500 text-white p-5 rounded-xl hover:bg-yellow-600 transition shadow-md"
              >
                <div className="flex items-center gap-3">
                  <FaStore className="text-white text-2xl" />
                  <div className="text-left">
                    <div className="font-bold text-lg">List Your Product</div>
                    <div className="text-xs opacity-90">Start selling on LoopMart</div>
                  </div>
                </div>
                <FaArrowRight />
              </motion.button>

              {/* Button 2: Go to Dashboard - Black background */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoToDashboard}
                className="flex items-center justify-between gap-3 bg-black text-white p-5 rounded-xl hover:bg-gray-800 transition shadow-md"
              >
                <div className="flex items-center gap-3">
                  <FaTachometerAlt className="text-white text-2xl" />
                  <div className="text-left">
                    <div className="font-bold text-lg">Go to Dashboard</div>
                    <div className="text-xs opacity-90">Manage your account</div>
                  </div>
                </div>
                <FaArrowRight />
              </motion.button>
            </div>

            {/* Button 3: Browse Products - Yellow outline, black text - Full width */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBrowseProducts}
              className="flex items-center justify-between gap-3 bg-transparent border-2 border-yellow-500 text-black p-5 rounded-xl hover:bg-yellow-50 transition"
            >
              <div className="flex items-center gap-3">
                <FaShoppingCart className="text-yellow-500 text-2xl" />
                <div className="text-left">
                  <div className="font-bold text-lg">Browse Products</div>
                  <div className="text-xs text-gray-600">Continue shopping</div>
                </div>
              </div>
              <FaArrowRight className="text-yellow-500" />
            </motion.button>
          </div>
        </div>

        {/* Additional Info for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              🔔 <strong>Note:</strong> To list products or access your dashboard, please 
              <Link to="/login" className="text-yellow-700 font-semibold underline mx-1">login</Link>
              or
              <Link to="/register" className="text-yellow-700 font-semibold underline mx-1">create an account</Link>
              first.
            </p>
          </div>
        )}

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 py-3 px-4 rounded-lg transition"
        >
          <FaHome size={16} />
          <span>Back to Home</span>
        </button>

        {/* Share/Referral Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Have questions? Contact our{' '}
            <Link to="/support" className="text-yellow-600 hover:underline">
              support team
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
