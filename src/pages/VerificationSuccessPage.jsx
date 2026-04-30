// pages/VerificationSuccessPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaShieldAlt, 
  FaArrowRight, 
  FaTachometerAlt, 
  FaHome,
  FaShoppingCart,
  FaSpinner,
  FaCrown,
  FaStar
} from 'react-icons/fa';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

export default function VerificationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [verificationDetails, setVerificationDetails] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, approved, failed

  useEffect(() => {
    const processVerificationData = async () => {
      // Get payment details from URL params
      const params = new URLSearchParams(location.search);
      const reference = params.get('reference');
      const trxref = params.get('trxref');
      const paymentRef = reference || trxref;
      
      // Check if user is logged in
      const token = localStorage.getItem('loopmart_token');
      const user = localStorage.getItem('loopmart_user');
      
      if (token && user) {
        setIsAuthenticated(true);
        setUserData(JSON.parse(user));
        
        // Fetch verification status from server
        if (paymentRef) {
          await verifyPaymentAndCheckStatus(token, paymentRef);
        } else {
          await fetchVerificationStatus(token);
        }
      } else {
        setIsLoading(false);
      }
      
      // Get verification details from localStorage if available
      const savedVerification = localStorage.getItem('pending_verification');
      if (savedVerification) {
        try {
          const verification = JSON.parse(savedVerification);
          setVerificationDetails(verification);
          localStorage.removeItem('pending_verification');
        } catch(e) {}
      }
      
      setIsLoading(false);
    };
    
    processVerificationData();
  }, [location]);

  const fetchVerificationStatus = async (token) => {
    try {
      const response = await fetch(`${API_URL}/v1/verify/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Verification status:', data);
      
      if (data.status) {
        if (data.data?.verified === true || data.data?.status === 'approved') {
          setVerificationStatus('approved');
          // Update user data
          const currentUser = JSON.parse(localStorage.getItem('loopmart_user') || '{}');
          const updatedUser = {
            ...currentUser,
            isVerified: true,
            verificationStatus: 'approved',
            verifiedAt: new Date().toISOString()
          };
          localStorage.setItem('loopmart_user', JSON.stringify(updatedUser));
          setUserData(updatedUser);
        } else if (data.data?.status === 'pending') {
          setVerificationStatus('pending');
        } else {
          setVerificationStatus('failed');
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const verifyPaymentAndCheckStatus = async (token, reference) => {
    try {
      // First, verify the payment with backend
      const verifyResponse = await fetch(`${API_URL}/v1/payment/verify?reference=${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Payment verification:', verifyData);
      
      if (verifyData.status) {
        setVerificationStatus('approved');
        // Update user data
        const currentUser = JSON.parse(localStorage.getItem('loopmart_user') || '{}');
        const updatedUser = {
          ...currentUser,
          isVerified: true,
          verificationStatus: 'approved',
          verifiedAt: new Date().toISOString()
        };
        localStorage.setItem('loopmart_user', JSON.stringify(updatedUser));
        setUserData(updatedUser);
      } else {
        // Check status anyway
        await fetchVerificationStatus(token);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      await fetchVerificationStatus(token);
    }
  };

  const handleGoToDashboard = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/dashboard');
      return;
    }
    navigate('/dashboard');
  };

  const handleStartSelling = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/start-selling');
      return;
    }
    navigate('/start-selling');
  };

  const handleBrowseProducts = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your verification status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
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
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
            verificationStatus === 'approved' ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {verificationStatus === 'approved' ? (
              <FaCheckCircle className="text-green-500 text-5xl" />
            ) : (
              <FaShieldAlt className="text-yellow-500 text-5xl" />
            )}
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
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            {verificationStatus === 'approved' ? 'Verification Complete! 🎉' : 'Verification Submitted!'}
          </h1>
          <p className="text-gray-600 text-md mt-2">
            {verificationStatus === 'approved' 
              ? 'Your identity has been successfully verified.' 
              : 'Your verification request has been received and is being processed.'}
          </p>
        </div>

        {/* Verification Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-xl p-6 mb-6 border ${
            verificationStatus === 'approved' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}
        >
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FaShieldAlt className={verificationStatus === 'approved' ? 'text-green-600' : 'text-yellow-600'} />
            Verification Status
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${
                verificationStatus === 'approved' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {verificationStatus === 'approved' ? '✓ Approved' : '⏳ Pending Review'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Verification Type:</span>
              <span className="font-semibold text-gray-900">Identity Verification</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Date Submitted:</span>
              <span className="text-gray-700">{new Date().toLocaleString()}</span>
            </div>
          </div>

          {verificationStatus === 'pending' && (
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⏳ Your verification is being reviewed. This typically takes 1-2 business days.
                You will receive an email notification once approved.
              </p>
            </div>
          )}

          {verificationStatus === 'approved' && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Your account is now verified! You now have access to all verified seller features.
              </p>
            </div>
          )}
        </motion.div>

        {/* Benefits Section for Verified Users */}
        {verificationStatus === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-5 mb-6 border border-yellow-200"
          >
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <FaCrown className="text-yellow-500" />
              Your Verified Benefits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span>Trust Badge on Profile</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span>Priority Search Results</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span>Increased Buyer Trust</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span>Enhanced Visibility</span>
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
              {/* Button 1: Start Selling - Yellow background (only if verified) */}
              {verificationStatus === 'approved' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleStartSelling}
                  className="flex items-center justify-between gap-3 bg-yellow-500 text-white p-5 rounded-xl hover:bg-yellow-600 transition shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <FaShoppingCart className="text-white text-2xl" />
                    <div className="text-left">
                      <div className="font-bold text-lg">Start Selling</div>
                      <div className="text-xs opacity-90">List your products now</div>
                    </div>
                  </div>
                  <FaArrowRight />
                </motion.button>
              )}

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

            {/* Button 3: Browse Products - Full width */}
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
              🔔 <strong>Note:</strong> To access your dashboard or start selling, please 
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

        {/* Support Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Have questions about verification? Contact our{' '}
            <Link to="/support" className="text-yellow-600 hover:underline">
              support team
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
