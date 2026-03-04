import { Navigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import { useEffect, useRef } from 'react';

const ProtectedRoute = ({ children }) => {
  const user = userService.getUser();
  const token = userService.getToken();
  const toast = useToast();
  const hasShownToast = useRef(false); // Prevent multiple toasts

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
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;