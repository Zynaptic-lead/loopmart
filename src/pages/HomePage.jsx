// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BannerCarousel from "../components/BannerCarousel";
import CategoriesSection from "../components/CategoriesSection";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

export default function HomePage() {
  const navigate = useNavigate();
  const [isAnyModalActive, setIsAnyModalActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ 
    type: 'success', 
    message: '', 
    title: '' 
  });
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Listen for toast events
  useEffect(() => {
    const handleToastEvent = (event) => {
      const { type, message, title } = event.detail;
      setToastMessage({ type, message, title });
      setShowToast(true);
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    };

    window.addEventListener('show-toast', handleToastEvent);

    return () => {
      window.removeEventListener('show-toast', handleToastEvent);
    };
  }, []);

  // Listen for scroll events to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      // Show button when scrolled down 300px
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Simple Toast Component
  const Toast = () => {
    if (!showToast) return null;

    const bgColor = toastMessage.type === 'success' ? 'bg-green-100 border-green-300' :
                   toastMessage.type === 'error' ? 'bg-red-100 border-red-300' :
                   toastMessage.type === 'warning' ? 'bg-yellow-100 border-yellow-300' :
                   'bg-blue-100 border-blue-300';
    
    const textColor = toastMessage.type === 'success' ? 'text-green-800' :
                     toastMessage.type === 'error' ? 'text-red-800' :
                     toastMessage.type === 'warning' ? 'text-yellow-800' :
                     'text-blue-800';

    return (
      <div className={`fixed top-4 right-4 z-[9999] min-w-[300px] max-w-md border rounded-lg shadow-lg ${bgColor} animate-slide-in`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              {toastMessage.type === 'success' && (
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
              {toastMessage.type === 'error' && (
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
              )}
              {toastMessage.type === 'warning' && (
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                  <span className="text-white text-sm">!</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              {toastMessage.title && <h3 className={`font-semibold ${textColor}`}>{toastMessage.title}</h3>}
              <p className={`text-sm mt-1 ${textColor}`}>{toastMessage.message}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Scroll to Top Button Component
  const ScrollToTopButton = () => {
    if (!showScrollButton) return null;

    return (
      <button
        onClick={scrollToTop}
        className="fixed bottom-8 left-8 z-50 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 animate-bounce"
        aria-label="Scroll to top"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onModalStateChange={setIsAnyModalActive} />
      
      {/* Main content with proper spacing */}
      <main className="flex-1 bg-gray-50 pt-16">
        <BannerCarousel />
        <CategoriesSection />
      </main>
      
      <Footer />
      <Toast />
      <ScrollToTopButton />
      
      {/* Add CSS animation */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        /* Custom bounce animation if you want more control */
        @keyframes custom-bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: custom-bounce 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
