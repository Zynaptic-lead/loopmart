// App.jsx - Cleaner version with route constants
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import { NotificationProvider } from './contexts/NotificationContext'
import RootLayout from './layouts/RootLayout'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'

// Page Imports
import HomePage from './pages/HomePage'
import PricingPage from './pages/PricingPage'
import NotificationsPage from './pages/NotificationsPage'
import ProductDetails from './pages/ProductDetails'
import SellingSuccessPage from './pages/SellingSuccessPage'
import StartSelling from './pages/StartSelling'
import ShopPage from './pages/ShopPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'  // NEW PAGE

// Route Constants
const ROUTES = {
  HOME: '/',
  PRICING: '/pricing',
  PRODUCT_DETAILS: '/products/:id',
  SHOP: '/shop/:slug',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  PAYMENT_SUCCESS: '/payment-success',  // NEW ROUTE
  NOTIFICATIONS: '/notifications',
  START_SELLING: '/start-selling',
  DASHBOARD: '/dashboard',
  SELLING_SUCCESS: '/selling-success',
}

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

function App() {
  console.log('📱 App rendering');

  // Token handler - runs ONCE when app loads
  useEffect(() => {
    console.log('🔍 useEffect running - checking for token');
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    console.log('Current URL:', window.location.href);
    console.log('Token found:', token ? 'YES - ' + token.substring(0, 20) + '...' : 'NO');
    
    if (token && !localStorage.getItem('loopmart_token')) {
      console.log('✅ Storing token in localStorage');
      localStorage.setItem('loopmart_token', token);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('🧹 Token removed from URL');
      
      setTimeout(() => {
        console.log('🔄 Reloading app...');
        window.location.reload();
      }, 500);
    }
  }, []);

  return (
    <SubscriptionProvider>
      <NotificationProvider>
        <ToastProvider>
          <Router>
            <RootLayout>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.HOME} element={<HomePage />} />
                <Route path={ROUTES.PRICING} element={<PricingPage />} />
                <Route path={ROUTES.PRODUCT_DETAILS} element={<ProductDetails />} />
                <Route path={ROUTES.SHOP} element={<ShopPage />} />
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
                <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtpPage />} />
                <Route path={ROUTES.PAYMENT_SUCCESS} element={<PaymentSuccessPage />} />
                
                {/* Protected Routes */}
                <Route path={ROUTES.NOTIFICATIONS} element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.START_SELLING} element={
                  <ProtectedRoute>
                    <StartSelling />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.DASHBOARD} element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path={ROUTES.SELLING_SUCCESS} element={
                  <ProtectedRoute>
                    <SellingSuccessPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </RootLayout>
          </Router>
        </ToastProvider>
      </NotificationProvider>
    </SubscriptionProvider>
  )
}

export default App
