// pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    // Get email and OTP from session storage
    const storedEmail = sessionStorage.getItem('reset_email');
    const storedOtp = sessionStorage.getItem('reset_otp');
    
    if (!storedEmail || !storedOtp) {
      // If missing data, redirect to forgot password
      navigate('/forgot-password');
    } else {
      setEmail(storedEmail);
      setOtp(storedOtp);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ text: '', type: '' });
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validation
    if (!formData.password.trim()) {
      showMessage('Please enter a new password', 'error');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      showMessage('Password must be at least 8 characters', 'error');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      showMessage('Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    if (!email || !otp) {
      showMessage('Session expired. Please start over.', 'error');
      setTimeout(() => navigate('/forgot-password'), 2000);
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('otp', otp);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('password_confirmation', formData.password_confirmation);

      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        body: formDataToSend,
        headers: { 'Accept': 'application/json' },
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
      
      const isSuccess = data.status === true || data.success === true;
      
      if (isSuccess) {
        showMessage('Password reset successful!', 'success');
        
        // Clear session storage
        sessionStorage.removeItem('reset_email');
        sessionStorage.removeItem('reset_otp');
        
        // Redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        showMessage(data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Reset password error:', error);
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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Reset Password</h1>
          <p className="text-gray-600 text-sm mt-1">
            Create a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none pr-10"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none pr-10"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {formData.password && formData.password_confirmation && 
           formData.password !== formData.password_confirmation && (
            <div className="text-red-500 text-xs flex items-center gap-1 p-2 bg-red-50 rounded border border-red-200">
              <FaTimesCircle size={12} />
              <span>Passwords do not match</span>
            </div>
          )}

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
            disabled={loading || formData.password !== formData.password_confirmation || formData.password.length < 8}
            className="w-full bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" size={16} />
                <span>Resetting...</span>
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

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