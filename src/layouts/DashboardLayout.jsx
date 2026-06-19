// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionWarning from '../components/dashboard/SubscriptionWarning';
import { FaStore, FaHome, FaUser, FaCog, FaSignOutAlt, FaShoppingBag, FaCreditCard, FaBell, FaBars } from 'react-icons/fa';

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('loopmart_user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loopmart_token');
    localStorage.removeItem('loopmart_user');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', icon: FaHome, path: '/dashboard' },
    { name: 'My Shop', icon: FaStore, path: `/shop/${user?.id || ''}` },
    { name: 'Products', icon: FaShoppingBag, path: '/my-products' },
    { name: 'Subscription', icon: FaCreditCard, path: '/pricing' },
    { name: 'Profile', icon: FaUser, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaBars size={20} />
        </button>
        <h1 className="text-lg font-bold text-yellow-500">LoopMart</h1>
        <div className="w-8"></div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-yellow-500">LoopMart</h1>
            <p className="text-sm text-gray-600">Dashboard</p>
          </div>

          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors"
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-4 border-t border-gray-200 pt-4"
            >
              <FaSignOutAlt size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-screen">
          {/* ============================================== */}
          {/* SUBSCRIPTION WARNING - SHOWS ON ALL DASHBOARD PAGES */}
          {/* ============================================== */}
          <div className="max-w-7xl mx-auto px-4 pt-4">
            <SubscriptionWarning />
          </div>

          {/* Page Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}