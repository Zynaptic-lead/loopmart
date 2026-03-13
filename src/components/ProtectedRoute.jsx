// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { userService } from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import { useEffect, useRef } from 'react';

const ProtectedRoute = ({ children }) => {
  const user = userService.getUser();
  const token = userService.getToken();
  const toast = useToast();
  const hasShownToast = useRef(false);
  const location = useLocation();

  useEffect(() => {
    // Only show toast once when component mounts and user is not logged in
    if (!user || !token) {
      if (!hasShownToast.current) {
        toast.warning('Please login to access this page');
        hasShownToast.current = true;
      }
    }
  }, []); // Empty dependency array - runs only once

  if (!user || !token) {
    // Redirect to login page with the return URL
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

export default ProtectedRoute;