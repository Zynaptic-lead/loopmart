// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Package, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Filter,
  ArrowLeft,
  ShoppingBag,
  Heart,
  MessageCircle,
  Star,
  X,
  Menu,
  Search,
  ChevronDown,
  Home,
  User,
  ShoppingCart,
  Trash2,
  RefreshCw,
  Sparkles,
  ThumbsUp,
  Award,
  Gift,
  MessageSquare,
  TrendingUp,
  Users,
  Shield,
  Rocket,
  Zap,
  Target
} from 'lucide-react';
import { userService } from '../services/userService';
import { AuthService } from '../services/auth';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

// Review prompt messages
const REVIEW_PROMPTS = [
  {
    title: "🌟 Share Your Experience!",
    message: "Your insights about '{product}' could help {count} other buyers make the right choice!",
    emoji: "🌟",
    color: "from-yellow-400 to-orange-500",
    icon: Star
  },
  {
    title: "🎯 Help Build Trust!",
    message: "Rate '{product}' and contribute to our trusted community of verified buyers.",
    emoji: "🎯",
    color: "from-purple-400 to-pink-500",
    icon: Target
  },
  {
    title: "💫 Be a Trendsetter!",
    message: "Your review of '{product}' will be seen by thousands of potential buyers!",
    emoji: "💫",
    color: "from-blue-400 to-cyan-500",
    icon: TrendingUp
  },
  {
    title: "🏆 Earn Recognition!",
    message: "Leave a detailed review for '{product}' and earn badges in our community!",
    emoji: "🏆",
    color: "from-green-400 to-emerald-500",
    icon: Award
  },
  {
    title: "🤝 Help Fellow Buyers!",
    message: "Your honest feedback about '{product}' helps others shop with confidence.",
    emoji: "🤝",
    color: "from-indigo-400 to-blue-500",
    icon: Users
  },
  {
    title: "🚀 Boost Seller Success!",
    message: "Your review helps the seller improve and serve you better next time!",
    emoji: "🚀",
    color: "from-red-400 to-orange-500",
    icon: Rocket
  },
  {
    title: "⚡ Quick Impact!",
    message: "A 2-minute review for '{product}' makes a huge difference for our community!",
    emoji: "⚡",
    color: "from-yellow-400 to-red-500",
    icon: Zap
  },
  {
    title: "🛡️ Build Confidence!",
    message: "Verified reviews like yours make LoopMart a safer place to shop!",
    emoji: "🛡️",
    color: "from-gray-400 to-blue-500",
    icon: Shield
  }
];

// Helper functions
const getRandomColor = () => {
  const colors = ['#FFD700', '#FF6347', '#4CAF50', '#1E90FF', '#FF69B4', '#FF8C00', '#9C27B0'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getInitials = (email, name, username) => {
  if (username) return username.slice(0, 2).toUpperCase();
  if (name) return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  if (!email) return 'U';
  const prefix = email.split('@')[0];
  const chars = prefix.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
  return chars || 'U';
};

// LogOut icon component
const LogOut = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [avatarColor, setAvatarColor] = useState('#FFD700');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReviewPrompts, setShowReviewPrompts] = useState({});

  // Get user data
  useEffect(() => {
    const getUserData = () => {
      const currentUser = userService.getUser();
      return currentUser;
    };

    const userData = getUserData();
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setUser(userData);
    setAvatarColor(getRandomColor());
    fetchNotifications();
  }, [navigate]);

  // Load notifications from localStorage
  const loadLocalNotifications = () => {
    try {
      const saved = localStorage.getItem('loopmart_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Filter for current user and only real notifications
        if (user) {
          return parsed.filter(n => 
            n.userId === user.id && 
            n.isRealNotification === true && 
            n.source === 'user-action'
          );
        }
        return parsed.filter(n => 
          n.isRealNotification === true && 
          n.source === 'user-action'
        );
      }
    } catch (error) {
      console.error('Error loading local notifications:', error);
    }
    
    return [];
  };

  // Enhanced notification messages WITHOUT price
  const enhanceNotificationMessage = (notification) => {
    let message = notification.message;
    
    // Remove any price mentions from the message
    message = message.replace(/\₦[0-9,]+/g, '');
    message = message.replace(/[0-9,]+(?:\.\d{2})?\s*(?:NGN|USD|naira|dollar)/gi, '');
    message = message.replace(/price\s*[\:\-]?\s*[0-9,]+/gi, '');
    
    // Add review prompt for connect notifications
    if (notification.type === 'success' || notification.type === 'interest') {
      if (message.includes('connect') || message.includes('interest') || message.includes('sent')) {
        const randomReviewPrompt = REVIEW_PROMPTS[Math.floor(Math.random() * REVIEW_PROMPTS.length)];
        const productName = notification.product?.name || 'the product';
        const count = Math.floor(Math.random() * 500) + 100;
        
        message += `\n\n${randomReviewPrompt.emoji} **${randomReviewPrompt.title}**\n`;
        message += randomReviewPrompt.message
          .replace('{product}', productName)
          .replace('{count}', count.toLocaleString());
      }
    }
    
    return message;
  };

  // Get random review prompt for a product
  const getReviewPrompt = (productName) => {
    const prompt = REVIEW_PROMPTS[Math.floor(Math.random() * REVIEW_PROMPTS.length)];
    const count = Math.floor(Math.random() * 500) + 100;
    
    return {
      ...prompt,
      fullMessage: prompt.message
        .replace('{product}', productName)
        .replace('{count}', count.toLocaleString())
    };
  };

  // Fetch notifications from localStorage and optionally from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load from localStorage
      const localNotifications = loadLocalNotifications();
      
      // Try to load from API if user has token
      let apiNotifications = [];
      const token = AuthService.getToken();
      
      if (token) {
        try {
          const response = await fetch('https://loopmart.ng/api/v1/user/notification', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.status && data.data && Array.isArray(data.data)) {
              // Transform API notifications to match our format
              apiNotifications = data.data.map((item) => ({
                id: item.id || item.notification_id || `api-${Date.now()}-${Math.random()}`,
                userId: item.user_id || item.userId || user?.id || 0,
                productId: item.product_id || item.productId || 0,
                title: item.title || 'Notification',
                message: enhanceNotificationMessage({
                  id: item.id,
                  userId: item.user_id || 0,
                  title: item.title || '',
                  message: item.message || item.body || '',
                  type: 'info',
                  read: false,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  product: item.product_id ? {
                    id: item.product_id,
                    name: item.product_name || item.product?.name || 'Product',
                    price: item.product_price || item.product?.price || 0,
                    image: item.product_image || item.product?.image
                  } : undefined
                }),
                type: item.type || 'info',
                read: item.read === true || item.read_status === true || false,
                createdAt: item.created_at || item.createdAt || new Date().toISOString(),
                updatedAt: item.updated_at || item.updatedAt || new Date().toISOString(),
                product: item.product_id ? {
                  id: item.product_id,
                  name: item.product_name || item.product?.name || 'Product',
                  price: item.product_price || item.product?.price || 0,
                  image: item.product_image || item.product?.image
                } : undefined,
                isRealNotification: true,
                source: 'user-action',
                action: item.action || 'notification'
              }));
            }
          }
        } catch (apiError) {
          console.log('API fetch failed, using local notifications only');
        }
      }
      
      // Merge notifications (prefer local version for duplicates)
      const allNotifications = [...localNotifications, ...apiNotifications];
      const uniqueNotifications = allNotifications.filter((notification, index, self) =>
        index === self.findIndex(t => t.id === notification.id)
      );
      
      // Sort by date (newest first)
      uniqueNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setNotifications(uniqueNotifications);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications. Please try again.');
      
      // Load from localStorage as fallback
      const localNotifications = loadLocalNotifications();
      setNotifications(localNotifications);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      setUpdating(true);
      
      // Update local state first
      const updated = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      );
      
      setNotifications(updated);
      
      // Update localStorage
      localStorage.setItem('loopmart_notifications', JSON.stringify(updated));
      
      // Try to update on server if user has token
      const token = AuthService.getToken();
      if (token) {
        try {
          const notification = notifications.find(n => n.id === notificationId);
          await fetch('https://loopmart.ng/api/v1/user/update/notification', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              notificationId: notificationId,
              productId: notification?.productId || 0
            })
          });
        } catch (serverError) {
          console.log('Server update failed, but local update successful');
        }
      }
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      setUpdating(true);
      
      // Update all unread notifications in state
      const updated = notifications.map(notification => ({ ...notification, read: true }));
      setNotifications(updated);
      
      // Update localStorage
      localStorage.setItem('loopmart_notifications', JSON.stringify(updated));
      
      // Try to update on server if user has token
      const token = AuthService.getToken();
      if (token) {
        const unreadNotifications = notifications.filter(n => !n.read);
        
        try {
          // Update each notification individually
          await Promise.all(
            unreadNotifications.map(notification =>
              fetch('https://loopmart.ng/api/v1/user/update/notification', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                },
                body: JSON.stringify({
                  notificationId: notification.id,
                  productId: notification.productId || 0
                })
              })
            )
          );
        } catch (serverError) {
          console.log('Server update failed, but local update successful');
        }
      }
      
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Delete notification
  const deleteNotification = (notificationId) => {
    const updated = notifications.filter(n => n.id !== notificationId);
    setNotifications(updated);
    localStorage.setItem('loopmart_notifications', JSON.stringify(updated));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('loopmart_notifications', JSON.stringify([]));
  };

  // Toggle review prompt visibility
  const toggleReviewPrompt = (notificationId) => {
    setShowReviewPrompts(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));
  };

  // Filter notifications based on filter state and search query
  const filteredNotifications = notifications.filter(notification => {
    // Apply filter
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query) ||
        notification.product?.name.toLowerCase().includes(query) ||
        false
      );
    }
    
    return true;
  });

  // Calculate counts
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  // Get notification icon by type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />;
      case 'interest':
      case 'success':
        return <Heart className="h-5 w-5 md:h-6 md:w-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />;
      default:
        return <Bell className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />;
    }
  };

  // Get notification color by type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'bg-blue-100 text-blue-800';
      case 'interest':
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate to product if exists
    if (notification.productId) {
      navigate(`/products/${notification.productId}`);
    }
  };

  // Handle review button click
  const handleReviewClick = (notification, e) => {
    e.stopPropagation();
    
    if (notification.productId) {
      // Mark as read first
      if (!notification.read) {
        markAsRead(notification.id);
      }
      
      // Navigate to review page
      navigate(`/review/${notification.productId}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    userService.clearUser();
    AuthService.clearToken();
    navigate('/');
  };

  // Mobile Header Component
  const MobileHeader = () => (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Back button and Logo */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="LoopMart" 
              className="h-6 w-auto"
            />
          </div>
        </div>

        {/* Right: User menu and mobile menu */}
        <div className="flex items-center space-x-2">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                {user.profilePicture ? (
                  <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/40 shadow-sm"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {getInitials(user.email, user.name, user.username)}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && user && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-medium text-gray-900 truncate">
              {user.username || user.name || user.email.split('@')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>
          
          <Link 
            to="/dashboard" 
            className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Home className="h-4 w-4 mr-3" />
            Dashboard
          </Link>
          
          <Link 
            to="/profile" 
            className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="h-4 w-4 mr-3" />
            My Profile
          </Link>
          
          <Link 
            to="/notifications" 
            className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700 bg-blue-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Bell className="h-4 w-4 mr-3" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          
          <div className="border-t border-gray-100 my-2"></div>
          
          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      )}

      {/* Search Bar (for mobile) */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );

  // Desktop Header Component
  const DesktopHeader = () => (
    <header className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="LoopMart" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium">
              Products
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-blue-600 font-medium">
              Categories
            </Link>
            <Link to="/start-selling" className="text-gray-700 hover:text-blue-600 font-medium">
              Sell
            </Link>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Search Bar */}
                <div className="hidden md:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <Link 
                    to="/notifications" 
                    className="p-2 rounded-lg hover:bg-gray-100 relative"
                  >
                    <Bell className="h-5 w-5 text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    {user.profilePicture ? (
                      <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border border-white/40 shadow-sm"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {getInitials(user.email, user.name, user.username)}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">
                        {user.username || user.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    
                    <Link 
                      to="/dashboard" 
                      className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                      <Home className="h-4 w-4 mr-3" />
                      Dashboard
                    </Link>
                    
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-3 hover:bg-gray-50 text-gray-700"
                    >
                      <User className="h-4 w-4 mr-3" />
                      My Profile
                    </Link>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-3 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Review Prompt Component
  const ReviewPrompt = ({ notification }) => {
    if (!notification.productId || !notification.product) return null;
    
    const prompt = getReviewPrompt(notification.product.name);
    const PromptIcon = prompt.icon;
    
    return (
      <div className={`mt-4 p-4 rounded-xl bg-gradient-to-r ${prompt.color} text-white animate-fade-in`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <PromptIcon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">{prompt.title}</h4>
            <p className="text-white/90 mb-3">{prompt.fullMessage}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => handleReviewClick(notification, e)}
                className="bg-white text-gray-900 font-bold px-4 py-2 rounded-lg hover:scale-105 transition-transform flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Leave Review Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleReviewPrompt(notification.id);
                }}
                className="text-white/80 hover:text-white text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <DesktopHeader />
      </div>

      {/* Main Content */}
      <main className={`pt-16 md:pt-20 px-4 md:px-6 py-6 md:py-8 ${mobileMenuOpen ? 'opacity-50' : ''}`}>
        <div className="container mx-auto max-w-6xl">
          {/* Back Button and Title (Desktop) */}
          <div className="hidden md:block mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Notifications</h1>
                  <p className="text-gray-600">Stay updated with your activities and connections</p>
                </div>
              </div>
              
              <button
                onClick={fetchNotifications}
                disabled={loading || updating}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 disabled:opacity-50 bg-white px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Stats and Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
                    <p className="text-sm text-gray-600">Total Notifications</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <div className="h-5 w-5 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{unreadCount}</p>
                    <p className="text-sm text-gray-600">Unread</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{readCount}</p>
                    <p className="text-sm text-gray-600">Read</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Filter - Mobile only search */}
                <div className="md:hidden w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Dropdown */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread Only</option>
                    <option value="read">Read Only</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {/* Mark All as Read Button */}
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      disabled={updating}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm shadow-md hover:shadow-lg transition-all"
                    >
                      {updating ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">Mark All Read</span>
                    </button>
                  )}

                  {/* Clear All Button */}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:from-gray-200 hover:to-gray-300 flex items-center space-x-2 text-sm border border-gray-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Clear All</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-6 text-gray-600 text-lg">Loading your notifications...</p>
                <p className="text-gray-400 text-sm mt-2">Fetching your latest updates</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  Unable to load notifications
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="h-12 w-12 text-blue-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {searchQuery 
                    ? "No matching notifications"
                    : filter === 'all' 
                    ? "Your notification center is empty"
                    : filter === 'unread'
                    ? "No unread notifications"
                    : "No read notifications"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  {searchQuery 
                    ? "Try different keywords or clear your search."
                    : "Connect with sellers or make purchases to receive notifications."}
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/categories')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    Explore Products
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const enhancedMessage = enhanceNotificationMessage(notification);
                  const showReview = (notification.type === 'success' || notification.type === 'interest') && 
                                    notification.productId && 
                                    showReviewPrompts[notification.id];
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 md:p-6 hover:bg-gray-50/80 transition-all duration-300 cursor-pointer group ${
                        !notification.read ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3 md:space-x-4">
                        {/* Icon */}
                        <div className={`p-2 md:p-3 rounded-xl ${getNotificationColor(notification.type)} shadow-sm`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-bold text-gray-800 text-base md:text-lg group-hover:text-blue-600 transition-colors">
                                  {notification.title}
                                </h3>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white animate-pulse ml-2">
                                    NEW
                                  </span>
                                )}
                              </div>
                              
                              {/* Enhanced Message without price */}
                              <div className="prose prose-sm max-w-none mb-4">
                                {enhancedMessage.split('\n').map((line, index) => (
                                  <p key={index} className="text-gray-700 mb-2 last:mb-0">
                                    {line.includes('**') ? (
                                      <span className="font-bold text-gray-900">
                                        {line.replace(/\*\*/g, '')}
                                      </span>
                                    ) : (
                                      line
                                    )}
                                  </p>
                                ))}
                              </div>
                              
                              {/* Product Info (without price) */}
                              {notification.product && (
                                <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4 mb-4 border border-gray-200">
                                  {notification.product.image ? (
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden bg-gray-200">
                                      <img 
                                        src={notification.product.image} 
                                        alt={notification.product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.src = 'https://via.placeholder.com/56x56?text=Product';
                                        }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-sm md:text-base line-clamp-1">
                                      {notification.product.name}
                                    </p>
                                    <p className="text-gray-500 text-xs md:text-sm">
                                      Product Details Available
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/products/${notification.productId}`);
                                      }}
                                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 text-sm font-medium shadow-sm hover:shadow transition-all"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Review Prompt - Only for connect/success notifications */}
                              {showReview && notification.product && (
                                <ReviewPrompt notification={notification} />
                              )}
                              
                              {/* Show Review Prompt Button */}
                              {(notification.type === 'success' || notification.type === 'interest') && 
                               notification.productId && 
                               !showReviewPrompts[notification.id] && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReviewPrompt(notification.id);
                                  }}
                                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-2"
                                >
                                  <Sparkles className="h-4 w-4" />
                                  Share your experience with this product
                                </button>
                              )}
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 md:mt-0 md:ml-4">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  disabled={updating}
                                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-sm font-medium shadow-sm"
                                >
                                  <CheckCircle className="h-4 w-4 inline mr-1" />
                                  <span className="hidden sm:inline">Mark Read</span>
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete notification"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 md:mt-6 gap-2">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.type)} shadow-sm`}>
                                {notification.type === 'interest' ? 'Connection' : notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {notification.source === 'user-action' ? 'Your Action' : 'System'}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {!loading && !error && filteredNotifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-bold text-gray-800">{filteredNotifications.length}</span> of{' '}
                    <span className="font-bold text-gray-800">{notifications.length}</span> notifications
                    {searchQuery && (
                      <span> matching "<span className="text-blue-600">{searchQuery}</span>"</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {unreadCount > 0 ? (
                      <span className="text-blue-600 font-medium">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''} remaining
                      </span>
                    ) : (
                      'All caught up! 🎉'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tips & Guide */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-bold text-blue-800">Maximize Your Experience:</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <h4 className="font-bold text-gray-800">Leave Reviews</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Share your experience to help other buyers and earn community badges!
                </p>
              </div>
              <div className="bg-white/80 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <h4 className="font-bold text-gray-800">Build Trust</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Verified reviews create a safer shopping environment for everyone.
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6" />
                <div>
                  <h4 className="font-bold">Pro Tip:</h4>
                  <p className="text-sm opacity-90">
                    Leaving detailed reviews increases your chances of getting priority support and exclusive offers!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-xl z-40">
          <div className="flex items-center justify-around py-3 px-2">
            <Link 
              to="/" 
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            <Link 
              to="/products" 
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="text-xs mt-1">Products</span>
            </Link>
            
            <Link 
              to="/notifications" 
              className="flex flex-col items-center text-blue-600 p-2 rounded-lg bg-blue-50"
            >
              <div className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1">Alerts</span>
            </Link>
            
            <Link 
              to="/profile" 
              className="flex flex-col items-center text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50"
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </div>
        </div>
      )}

      {/* Mobile Content Padding */}
      {user && <div className="h-16 md:h-0"></div>}
    </div>
  );
}