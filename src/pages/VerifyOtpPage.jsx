// pages/VerifyOtpPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';
import logo from '../assets/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('reset_email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email, redirect to forgot password
      navigate('/forgot-password');
    }
  }, [navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty
      const lastIndex = Math.min(pastedOtp.length, 5);
      document.getElementById(`otp-${lastIndex}`)?.focus();
    } else {
      // Handle single digit
      if (value.match(/^[0-9]$/)) {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto-focus next input
        if (index < 5) {
          document.getElementById(`otp-${index + 1}`)?.focus();
        }
      } else if (value === '') {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      showMessage('Please enter the 6-digit verification code', 'error');
      setLoading(false);
      return;
    }

    if (!email) {
      showMessage('Email is required', 'error');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', otpString);

      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        body: formData,
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
      
      const isSuccess = data.status === true || 
                       data.success === true || 
                       data.message?.toLowerCase().includes('verified');
      
      if (isSuccess) {
        showMessage('Code verified successfully!', 'success');
        
        // Store OTP for password reset
        sessionStorage.setItem('reset_otp', otpString);
        
        // Redirect to reset password page
        setTimeout(() => {
          navigate('/reset-password');
        }, 1500);
      } else {
        showMessage(data.message || 'Invalid verification code', 'error');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'application/json' 
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        showMessage('Server returned an invalid response', 'error');
        setResendLoading(false);
        return;
      }
      
      const isSuccess = data.status === true || 
                       data.success === true || 
                       data.message?.toLowerCase().includes('sent');
      
      if (isSuccess) {
        showMessage('New code sent to your email!', 'success');
        setTimer(60);
        setCanResend(false);
        // Clear OTP fields
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        document.getElementById('otp-0')?.focus();
      } else {
        showMessage(data.message || 'Failed to resend code', 'error');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setResendLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Verify Your Email</h1>
          <p className="text-gray-600 text-sm mt-1">
            Enter the 6-digit code sent to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                disabled={loading || resendLoading}
                autoFocus={index === 0}
              />
            ))}
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
            disabled={loading || otp.join('').length !== 6}
            className="w-full bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" size={16} />
                <span>Verifying...</span>
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-yellow-600 hover:text-yellow-700 font-semibold hover:underline disabled:opacity-50"
                >
                  {resendLoading ? (
                    <span className="inline-flex items-center">
                      <FaSpinner className="animate-spin mr-1" size={12} />
                      Sending...
                    </span>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              ) : (
                <span className="text-gray-400">
                  Resend in {timer} seconds
                </span>
              )}
            </p>
          </div>
        </form>

        {/* Back to Forgot Password */}
        <div className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="inline-flex items-center text-sm text-gray-600 hover:text-yellow-600"
          >
            <FaArrowLeft className="mr-2" size={12} />
            Back to Forgot Password
          </Link>
        </div>

        {/* Back to Login */}
        <div className="mt-2 text-center">
          <Link
            to="/login"
            className="text-sm text-yellow-600 hover:text-yellow-700 hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}