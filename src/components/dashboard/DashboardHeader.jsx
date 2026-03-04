import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { userService } from '../../services/userService';
import { getInitials, getRandomColor } from '../../utils/helpers';
import logo from '../../assets/logo.png';

export default function DashboardHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [avatarColor, setAvatarColor] = useState('#1E90FF');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Helper to get profile image URL
  const getProfileImageUrl = (photoFilename) => {
    if (!photoFilename) return null;
    if (photoFilename.startsWith('http')) return photoFilename;
    if (photoFilename.startsWith('/uploads')) return `https://loopmart.ng${photoFilename}`;
    return `https://loopmart.ng/uploads/users/${photoFilename}`;
  };

  useEffect(() => {
    const userFromStorage = userService.getUser();
    if (userFromStorage) {
      console.log('DashboardHeader - User from storage:', userFromStorage);
      setUser(userFromStorage);
      setAvatarColor(getRandomColor());
    }

    const unsubscribe = userService.subscribe((currentUser) => {
      console.log('DashboardHeader - User updated:', currentUser);
      setUser(currentUser);
      if (currentUser) {
        setAvatarColor(getRandomColor());
      }
    });
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    console.log('Logging out user');
    userService.clearUser();
    setShowDropdown(false);
    navigate('/');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Get profile picture URL from photo_url field
  const profilePictureUrl = user?.photo_url ? getProfileImageUrl(user.photo_url) : null;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Logo and mobile menu */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center ml-2 lg:ml-0">
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Loopmart" className="h-10 w-auto" />
              </Link>
            </div>
          </div>

          {/* Center section - Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders, products, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right section - User Profile - REMOVED NAME, ONLY SHOW PICTURE */}
          <div className="flex items-center space-x-3" ref={dropdownRef}>
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Removed the text div that shows name - only keep the profile picture */}
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-1 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {profilePictureUrl ? (
                      <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-md">
                        <img 
                          src={profilePictureUrl} 
                          alt="Profile" 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            console.log('Profile image failed to load:', profilePictureUrl);
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {getInitials(user.email, user.name, user.username)}
                      </div>
                    )}
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>

                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.username || user.name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      <Link 
                        to="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <UserIcon size={16} className="mr-3" />
                        My Profile
                      </Link>

                      <Link 
                        to="/settings" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings size={16} className="mr-3" />
                        Settings
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        <LogOut size={16} className="mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">?</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </header>
  );
}