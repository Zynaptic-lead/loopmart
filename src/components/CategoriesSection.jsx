// pages/CategoriesSection.jsx - Without Sold feature - Fully Responsive Version
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, MapPin, X, ChevronDown,
  ArrowRight, Store, Info, Filter, CheckCircle
} from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useSubscription } from '../contexts/SubscriptionContext';
import logo from '../assets/logo.png';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

// Categories data
const categories = [
  { name: "Gadgets", img: "/images/category 1.png" },
  { name: "Vehicles", img: "/images/category 2.png" },
  { name: "Houses", img: "/images/category 3.png" },
  { name: "Fashion", img: "/images/category 4.png" },
  { name: "Jobs", img: "/images/category 5.png" },
  { name: "Cosmetics", img: "/images/category 6.png" },
  { name: "Fruits", img: "/images/category 7.png" },
  { name: "Kitchen Utensils", img: "/images/category 8.png" },
  { name: "Others", color: "bg-yellow-400" },
];

// Nigerian states
const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
];

// Helper functions
const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL.replace('/api', '')}/uploads/products/${imagePath}`;
};

const getConditionBadgeColor = (condition) => {
  const conditionLower = (condition || '').toLowerCase();
  switch (conditionLower) {
    case "new": return "bg-green-100 text-green-800";
    case "fairly used": return "bg-blue-100 text-blue-800";
    case "used": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

// Toast notification helper
const showToast = (type, message, title, action = null) => {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { type, message, title, duration: 5000, action }
  }));
};

// Get user data from storage
const getUserData = () => {
  try {
    const userData = localStorage.getItem('loopmart_user');
    const token = localStorage.getItem('loopmart_token');
    if (!userData || !token) return null;
    return { ...JSON.parse(userData), token };
  } catch (e) {
    console.error('Error getting user data:', e);
    return null;
  }
};

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Product Card Component - Responsive with 2 columns on mobile
const ProductCard = ({ product, onProductClick, onConnectClick, isConnecting = false }) => {
  const hasPromo = product.actual_price && product.promo_price;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 hover:scale-105 bg-white cursor-pointer relative"
      onClick={() => onProductClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-40 sm:h-48 object-cover transition-transform duration-700 hover:scale-110"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
          loading="lazy"
        />

        <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getConditionBadgeColor(product.condition)}`}>
          {product.condition}
        </span>

        {hasPromo && (
          <span className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
            Sale
          </span>
        )}

        <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <button
            onClick={(e) => onConnectClick(e, product)}
            disabled={isConnecting}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 text-sm sm:text-base"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              'Connect'
            )}
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-red-600 transition-colors duration-300 text-sm sm:text-base">
          {product.name}
        </h4>

        {product.seller_verified && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              <MdVerified size={10} />
              <span>Verified Seller</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            {hasPromo && <span className="text-gray-400 text-xs sm:text-sm line-through">{product.actual_price}</span>}
            <span className="text-base sm:text-lg font-bold text-red-600">{product.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={12} />
              {product.location}
            </span>
            {product.seller_verified && (
              <MdVerified size={14} className="text-green-500" title="Verified Seller" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Product Card Component - 2 columns friendly
const MobileProductCard = ({ product, onProductClick, onConnectClick, isConnecting = false }) => {
  const hasPromo = product.actual_price && product.promo_price;

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-500 active:scale-95 cursor-pointer overflow-hidden"
      onClick={() => onProductClick(product)}
    >
      <div className="relative w-full h-36 sm:h-40 overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
          }}
          loading="lazy"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getConditionBadgeColor(product.condition)}`}>
            {product.condition}
          </span>
        </div>

        {hasPromo && (
          <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs font-medium">
            Sale
          </span>
        )}
      </div>

      <div className="p-2 sm:p-3">
        <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2 hover:text-red-600 text-xs sm:text-sm">
          {product.name}
        </h4>

        {product.seller_verified && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
              <MdVerified size={8} />
              <span>Verified</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 mb-2">
          <div className="flex items-center gap-1 flex-wrap">
            {hasPromo && <span className="text-gray-400 text-[10px] line-through">{product.actual_price}</span>}
            <span className="text-sm sm:text-base font-bold text-red-600">{product.price}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5">
              <MapPin size={10} />
              {product.location.length > 12 ? product.location.slice(0, 10) + '...' : product.location}
            </span>
            {product.seller_verified && (
              <MdVerified size={10} className="text-green-500" />
            )}
          </div>
        </div>

        <button
          onClick={(e) => onConnectClick(e, product)}
          disabled={isConnecting}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 active:scale-95 text-xs sm:text-sm disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Info size={12} />
              <span className="hidden xs:inline">Connect</span>
              <span className="xs:hidden">Contact</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Subscription Status Banner Component
const SubscriptionStatusBanner = ({ hasSubscription, onSubscribe }) => {
  if (hasSubscription) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <CheckCircle className="text-green-500 flex-shrink-0" size={18} />
          <div className="flex-1">
            <p className="text-green-800 font-medium text-sm sm:text-base">
              You have an active subscription! You can list products for sale.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2 sm:gap-3">
          <Info className="text-yellow-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-yellow-800 font-medium text-sm sm:text-base">
              Subscription required to list products for sale
            </p>
            <p className="text-xs text-yellow-600 hidden sm:block">
              Your subscription goes directly toward marketing your store and bringing serious buyers to you.
            </p>
          </div>
        </div>
        <button
          onClick={onSubscribe}
          className="px-4 sm:px-6 py-1.5 sm:py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-all duration-300 whitespace-nowrap text-sm sm:text-base"
        >
          Become a Seller
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function CategoriesSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  const { hasSubscription, checkSubscription, loading: subscriptionLoading } = useSubscription();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("Location");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [isConnecting, setIsConnecting] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const initialFetchDone = useRef(false);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  const getRandomProducts = useCallback((products, count = 48) => {
    if (!products || products.length === 0) return [];
    const shuffled = shuffleArray(products);
    return shuffled.slice(0, Math.min(count, products.length));
  }, []);

  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching all products...');
      
      const response = await fetch(`${API_URL}/allproduct`);
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      let productsArray = [];
      if (data.data && Array.isArray(data.data)) {
        productsArray = data.data;
        setTotalProducts(data.total || productsArray.length);
      } else if (Array.isArray(data)) {
        productsArray = data;
        setTotalProducts(productsArray.length);
      } else if (data.products && Array.isArray(data.products)) {
        productsArray = data.products;
        setTotalProducts(data.total || productsArray.length);
      }
      
      const transformedProducts = productsArray.map((item) => {
        let imageUrl = "";
        try {
          if (item.image_url) {
            if (typeof item.image_url === 'string' && item.image_url.startsWith('[')) {
              const parsed = JSON.parse(item.image_url);
              if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
            } else {
              imageUrl = item.image_url;
            }
          } else if (item.image) {
            imageUrl = item.image;
          } else if (item.photo) {
            imageUrl = item.photo;
          }
        } catch (error) {
          imageUrl = item.image_url || item.image || item.photo || "";
        }

        let category = "Others";
        if (item.category_id) {
          const categoryMap = {
            "1": "Gadgets", "2": "Vehicles", "3": "Houses", "4": "Fashion",
            "5": "Jobs", "6": "Cosmetics", "7": "Fruits", "8": "Kitchen Utensils"
          };
          category = categoryMap[item.category_id] || "Others";
        } else {
          category = item.category || item.product_category || "Others";
        }

        const actualPrice = item.actual_price ? parseFloat(item.actual_price) : 0;
        const promoPrice = item.promo_price ? parseFloat(item.promo_price) : null;
        const hasPromo = promoPrice && promoPrice < actualPrice;
        const productId = item.product_id || item.id;

        return {
          id: productId,
          name: item.title || item.name || item.product_name || "Unnamed Product",
          price: item.ask_for_price ? "Contact Seller" : (hasPromo ? `₦${promoPrice?.toLocaleString()}` : `₦${actualPrice.toLocaleString()}`),
          actual_price: actualPrice > 0 ? `₦${actualPrice.toLocaleString()}` : "",
          promo_price: promoPrice ? `₦${promoPrice?.toLocaleString()}` : "",
          condition: item.condition || "Others",
          category,
          image: imageUrl,
          seller_verified: item.badge_status === "1" || item.verify_status === "1" || false,
          location: item.location || item.product_location || "Unknown",
          ask_for_price: item.ask_for_price || false,
          description: item.description || item.product_description || "",
          seller_id: item.seller_id || item.user_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
        };
      });

      setAllProducts(transformedProducts);
      const randomProducts = getRandomProducts(transformedProducts, 48);
      setDisplayedProducts(randomProducts);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast('error', 'Failed to load products. Please refresh the page.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [getRandomProducts]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchAllProducts();
      initialFetchDone.current = true;
    }
  }, [fetchAllProducts]);

  const refreshProducts = useCallback(() => {
    if (allProducts.length > 0) {
      const newRandomProducts = getRandomProducts(allProducts, 48);
      setDisplayedProducts(newRandomProducts);
      showToast('info', 'Products refreshed! Showing new random selection.', 'Refreshed');
    }
  }, [allProducts, getRandomProducts]);

  // Apply filters
  const applyFilters = useCallback(() => {
    let filtered = [...displayedProducts];

    if (selectedCategory !== "All") {
      filtered = filtered.filter(product =>
        product.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        selectedCategory.toLowerCase().includes(product.category.toLowerCase())
      );
    }

    if (conditionFilter !== "All") {
      filtered = filtered.filter(product => {
        if (conditionFilter === "Others") {
          return !["new", "fairly used", "used"].includes(product.condition.toLowerCase());
        }
        return product.condition.toLowerCase() === conditionFilter.toLowerCase();
      });
    }

    if (verifiedFilter) {
      filtered = filtered.filter(product => product.seller_verified);
    }

    if (selectedState !== "Location") {
      filtered = filtered.filter(product =>
        product.location.toLowerCase().includes(selectedState.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [displayedProducts, selectedCategory, conditionFilter, verifiedFilter, selectedState]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const scroll = useCallback((direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  }, []);

  const handleCategorySelect = useCallback((categoryName) => {
    setSelectedCategory(categoryName);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory("All");
    setConditionFilter("All");
    setVerifiedFilter(false);
    setSelectedState("Location");
  }, []);

  const handleProductClick = useCallback((product) => {
    navigate(`/products/${product.id}`);
  }, [navigate]);

  const handleSubscribeClick = useCallback(() => {
    navigate('/pricing');
  }, [navigate]);

  const handleStartSellingClick = useCallback(async () => {
    const userData = getUserData();
    
    if (!userData) {
      showToast('warning', 'Please login to start selling', 'Login Required', {
        label: 'Login',
        onClick: () => navigate('/login')
      });
      return;
    }

    const isSubscribed = await checkSubscription();
    
    if (!isSubscribed) {
      showToast('warning', 'You need an active subscription to start selling', 'Subscription Required', {
        label: 'View Plans',
        onClick: () => navigate('/pricing')
      });
      navigate('/pricing');
      return;
    }
    
    navigate('/start-selling');
  }, [navigate, checkSubscription]);

  const handleConnectClick = useCallback(async (e, product) => {
    e.stopPropagation();
    e.preventDefault();

    const userData = getUserData();
    
    if (!userData) {
      showToast('warning', 'Please login to connect with seller', 'Login Required', {
        label: 'Login',
        onClick: () => navigate('/login')
      });
      return;
    }

    setIsConnecting(product.id);

    try {
      const response = await fetch(`${API_URL}/v1/product/engagement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: product.id,
          user_id: userData.id
        })
      });

      const data = await response.json();

      if (data.status === true || data.success === true) {
        showToast('success', `Interest sent! Seller will contact you.`, 'Success! 🎯');
        
        setTimeout(() => {
          navigate(`/products/${product.id}`);
        }, 1500);
      } else {
        showToast('error', data.message || 'Failed to send interest', 'Error');
      }
    } catch (error) {
      console.error('Connection error:', error);
      showToast('error', 'Network error. Please check your connection.', 'Error');
    } finally {
      setIsConnecting(null);
    }
  }, [navigate]);

  const filteredStates = useMemo(() =>
    NIGERIAN_STATES.filter((state) =>
      state.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery]
  );

  // Responsive grid classes: 2 columns on mobile, 3 on tablet, 4 on desktop
  const productGridClass = "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6";

  return (
    <section className="pt-0 pb-8 md:py-8 bg-gray-50">
      {/* Heading */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-black">Select product category</h2>
            <p className="text-gray-600 text-sm sm:text-base mt-1">(choose a category to filter your search)</p>
            <p className="text-xs text-gray-400 mt-1">
              Showing {filteredProducts.length} of {totalProducts} products
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshProducts}
              className="flex items-center gap-1 sm:gap-2 bg-yellow-500 text-black px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-yellow-600 transition-all duration-300 shadow-sm hover:scale-105"
              title="Show different products"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 16h5v5"/>
              </svg>
              <span className="hidden xs:inline">Shuffle</span>
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 sm:gap-2 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-yellow-100 transition-all duration-300 bg-white shadow-sm"
            >
              <span className="hidden xs:inline">{selectedState}</span>
              <span className="xs:hidden">{selectedState === "Location" ? "Loc" : selectedState.slice(0, 6)}</span>
              <MapPin size={14} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Status Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 mb-4">
        <SubscriptionStatusBanner 
          hasSubscription={hasSubscription} 
          onSubscribe={handleSubscribeClick}
        />
      </div>

      {/* Mobile Only - Fixed Start Selling Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <button
            onClick={handleStartSellingClick}
            disabled={subscriptionLoading}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center disabled:opacity-50"
            style={{ width: '56px', height: '56px' }}
          >
            <Store size={22} className="text-black" />
          </button>
          <div className="absolute bottom-full right-0 mb-2 w-44 bg-black text-white text-xs rounded-lg py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="flex items-center gap-2">
              <Store size={12} />
              <span className="font-medium">Start Selling!</span>
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
          </div>
        </div>
      </div>

      {/* Main Layout - Responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Categories Carousel - Always visible */}
        <div className="relative flex items-center mb-4 sm:mb-6">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 bg-white shadow-md rounded-full p-1.5 sm:p-2 hover:bg-yellow-100 transition-all duration-300"
          >
            <ChevronLeft size={18} className="sm:w-[22px] sm:h-[22px]" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-3 sm:gap-5 scroll-smooth px-8 sm:px-10 py-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat, i) => (
              <div
                key={i}
                onClick={() => handleCategorySelect(cat.name)}
                className={`min-w-[120px] sm:min-w-[150px] md:min-w-[180px] h-28 sm:h-32 md:h-36 rounded-xl border cursor-pointer bg-white shadow-sm flex flex-col justify-center items-center text-center transition-all duration-500 hover:scale-105 ${selectedCategory === cat.name ? "border-yellow-400 border-2 bg-yellow-50" : "border-gray-100"} ${cat.color || ""}`}
              >
                {cat.img && (
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain mb-2 transition-transform duration-700 hover:scale-110"
                    loading="lazy"
                  />
                )}
                <h3 className="font-medium text-gray-700 text-xs sm:text-sm md:text-base">{cat.name}</h3>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 bg-white shadow-md rounded-full p-1.5 sm:p-2 hover:bg-yellow-100 transition-all duration-300"
          >
            <ChevronRight size={18} className="sm:w-[22px] sm:h-[22px]" />
          </button>
        </div>

        {/* Filter Bar - Horizontal layout with icons */}
        <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Condition Filter - Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="text-gray-600 text-xs sm:text-sm font-medium">Condition:</span>
              {["All", "New", "Fairly Used", "Used", "Others"].map((condition) => (
                <button
                  key={condition}
                  onClick={() => setConditionFilter(condition)}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-all duration-300 hover:scale-105 ${
                    conditionFilter === condition
                      ? "bg-yellow-400 text-black font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {condition === "Fairly Used" ? "Fairly Used" : condition === "Used" ? "Used" : condition}
                </button>
              ))}
            </div>

            {/* Verified Seller Toggle */}
            <div className="flex items-center gap-2">
              <MdVerified size={16} className="text-green-500" />
              <span className="text-gray-600 text-xs sm:text-sm">Verified</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={verifiedFilter}
                  onChange={(e) => setVerifiedFilter(e.target.checked)}
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-green-500 transition-all duration-300">
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 ${verifiedFilter ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>

            {/* Reset Button */}
            <button
              onClick={clearFilters}
              className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium transition-colors duration-300"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Products Grid - Responsive 2 columns on mobile */}
        <div className="rounded-xl bg-white shadow p-3 sm:p-4 lg:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-yellow-500"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-base sm:text-lg">No products found matching your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-red-500 hover:text-red-700 font-medium">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Grid - 2 columns on mobile, 3 on tablet, 4 on desktop */}
              <div className={productGridClass}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                    onConnectClick={handleConnectClick}
                    isConnecting={isConnecting === product.id}
                  />
                ))}
              </div>

              {/* Promo Banner */}
              {showPromoBanner && filteredProducts.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-4 sm:p-6 md:p-8 relative overflow-hidden shadow-2xl transition-all duration-700">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="text-center md:text-left">
                        <div className="flex items-center gap-3 justify-center md:justify-start mb-3">
                          <img src={logo} alt="Loopmart" className="h-8 sm:h-10 md:h-12 w-auto filter brightness-0" />
                        </div>
                        <p className="text-black text-sm sm:text-base md:text-lg mb-1 font-medium">
                          Reach more audience by promoting your Product(s)
                        </p>
                        <p className="text-black text-sm sm:text-base md:text-lg font-medium">
                          Get an active badge by becoming a verified seller
                        </p>
                      </div>
                      <div className="flex flex-col items-center">
                        <button
                          onClick={handleStartSellingClick}
                          disabled={subscriptionLoading}
                          className="bg-black text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-500 flex items-center gap-2 text-sm sm:text-base disabled:opacity-50"
                        >
                          {subscriptionLoading ? 'Checking...' : 'Get Started'}
                          <ArrowRight className="animate-bounce" size={16} />
                        </button>
                        <p className="text-black/70 text-xs mt-2 text-center">
                          Join thousands of successful sellers today!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <MapPin className="text-red-500" size={18} /> Choose Location
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:scale-110 transition-transform">
                <X size={20} className="text-gray-600 hover:text-red-500" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search state..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="max-h-64 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedState("Location");
                  setIsModalOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-100 text-sm text-gray-700"
              >
                All Locations
              </button>
              {filteredStates.map((state, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedState(state);
                    setIsModalOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-100 text-sm text-gray-700"
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}