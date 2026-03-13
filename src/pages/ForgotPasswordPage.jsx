// pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [success, setSuccess] = useState(false);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (!email.trim()) {
      showMessage('Please enter your email address', 'error');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showMessage('Please enter a valid email address', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ email: email.trim() }),
        credentials: 'include',
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        showMessage('Server returned an invalid response', 'error');
        setLoading(false);
        return;
      }
      
      const isSuccess = data.status === true || 
                       data.success === true || 
                       data.message?.toLowerCase().includes('sent') ||
                       data.message?.toLowerCase().includes('otp');
      
      if (isSuccess) {
        setSuccess(true);
        showMessage('Verification code sent to your email!', 'success');
        
        // Store email in sessionStorage for OTP verification
        sessionStorage.setItem('reset_email', email.trim());
        
        // Redirect to OTP verification page after 2 seconds
        setTimeout(() => {
          navigate('/verify-otp');
        }, 2000);
      } else {
        showMessage(data.message || 'Failed to send verification code', 'error');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <img 
            src={logo} 
            alt="LoopMart" 
            className="h-12 w-auto mx-auto cursor-pointer"
            onClick={() => navigate('/')}
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Forgot Password?</h1>
          <p className="text-gray-600 text-sm mt-1">
            Enter your email address and we'll send you a verification code to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
            <p className="text-gray-600 text-sm mb-4">
              We've sent a verification code to <strong>{email}</strong>
            </p>
            <p className="text-gray-500 text-xs mb-6">
              Please check your inbox and spam folder
            </p>
            <button
              onClick={() => navigate('/verify-otp')}
              className="w-full bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-600 transition"
            >
              Enter Verification Code
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            {message.text && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <FaCheckCircle className="flex-shrink-0" size={16} />
                ) : (
                  <FaTimesCircle className="flex-shrink-0" size={16} />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  <span>Sending...</span>
                </>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-yellow-600"
          >
            <FaArrowLeft className="mr-2" size={12} />
            Back to Login
          </Link>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
        >
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}