// pages/CategoriesSection.jsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  ChevronDown,
  ArrowRight,
  Store,
  Info,
  Filter,
  CheckCircle
} from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { useSubscription } from '../contexts/SubscriptionContext';
import logo from '../assets/logo.png';

// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

const CATEGORIES = [
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

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano",
  "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
  "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara"
];

const CATEGORY_MAP = {
  "1": "Gadgets", "2": "Vehicles", "3": "Houses", "4": "Fashion",
  "5": "Jobs", "6": "Cosmetics", "7": "Fruits", "8": "Kitchen Utensils"
};

const CONDITION_BADGE_COLORS = {
  new: "bg-green-100 text-green-800",
  "fairly used": "bg-blue-100 text-blue-800",
  default: "bg-gray-100 text-gray-800",
};

const PRODUCTS_PER_PAGE = 48;

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL.replace('/api', '')}/uploads/products/${imagePath}`;
};

const getConditionBadgeColor = (condition) => {
  const key = (condition || '').toLowerCase();
  return CONDITION_BADGE_COLORS[key] || CONDITION_BADGE_COLORS.default;
};

const showToast = (type, message, title, action = null) => {
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { type, message, title, duration: 5000, action }
  }));
};

const getUserData = () => {
  try {
    const userData = localStorage.getItem('loopmart_user');
    const token = localStorage.getItem('loopmart_token');
    if (!userData || !token) return null;
    return { ...JSON.parse(userData), token };
  } catch {
    return null;
  }
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const formatPrice = (price) => {
  if (!price) return '';
  return `₦${Number(price).toLocaleString()}`;
};

// ============================================================
// SUB-COMPONENTS
// ============================================================

/**
 * ProductCard - Desktop product card component
 */
const ProductCard = ({ product, onProductClick, onConnectClick, isConnecting = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const hasPromo = product.promo_price && product.promo_price > 0 && 
                   product.actual_price > 0 && 
                   product.promo_price < product.actual_price;
  
  const discountPercent = hasPromo 
    ? Math.round(((product.actual_price - product.promo_price) / product.actual_price) * 100)
    : 0;

  const handleConnect = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onConnectClick(e, product);
  };

  return (
    <div
      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 hover:scale-105 bg-white cursor-pointer relative"
      onClick={() => onProductClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-700 hover:scale-110"
          onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
          loading="lazy"
        />

        {/* Badges */}
        <span className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getConditionBadgeColor(product.condition)}`}>
          {product.condition}
        </span>

        {hasPromo && (
          <span className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
            Sale
          </span>
        )}

        {/* Connect Overlay */}
        <div className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-all duration-500 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Sending...</span>
              </>
            ) : (
              'Connect'
            )}
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-red-600 transition-colors duration-300">
          {product.name}
        </h4>

        {product.seller_verified && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105">
              <MdVerified size={10} />
              <span>Verified Seller</span>
            </div>
          </div>
        )}

        {/* Price Display */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            {product.ask_for_price ? (
              <span className="text-gray-600 text-sm font-medium">Contact for price</span>
            ) : hasPromo ? (
              <>
                <span className="text-gray-400 text-sm line-through">{formatPrice(product.actual_price)}</span>
                <span className="text-lg font-bold text-red-600">{formatPrice(product.promo_price)}</span>
                <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">{discountPercent}% OFF</span>
              </>
            ) : product.actual_price > 0 ? (
              <span className="text-lg font-bold text-gray-800">{formatPrice(product.actual_price)}</span>
            ) : (
              <span className="text-gray-500 text-sm">Price not set</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center gap-1">
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

/**
 * MobileProductCard - Mobile-optimized product card for 2-column grid
 */
const MobileProductCard = ({ product, onProductClick, onConnectClick, isConnecting = false }) => {
  const hasPromo = product.promo_price && product.promo_price > 0 && 
                   product.actual_price > 0 && 
                   product.promo_price < product.actual_price;
  
  const discountPercent = hasPromo 
    ? Math.round(((product.actual_price - product.promo_price) / product.actual_price) * 100)
    : 0;

  const handleConnect = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onConnectClick(e, product);
  };

  const getShortCondition = (condition) => {
    if (!condition) return '';
    const lower = condition.toLowerCase();
    if (lower === "fairly used") return "F.Used";
    return condition.slice(0, 4);
  };

  return (
    <div
      className="border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
      onClick={() => onProductClick(product)}
    >
      {/* Image Section */}
      <div className="relative w-full h-32 overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = "https://via.placeholder.com/300x200?text=No+Image"; }}
          loading="lazy"
        />

        <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getConditionBadgeColor(product.condition)}`}>
          {getShortCondition(product.condition)}
        </span>

        {hasPromo && (
          <span className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[10px] font-medium">
            Sale
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="p-2">
        <h4 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-xs">
          {product.name}
        </h4>

        {product.seller_verified && (
          <div className="flex items-center gap-1 mb-1">
            <MdVerified size={10} className="text-green-500" />
            <span className="text-[10px] text-green-600">Verified</span>
          </div>
        )}

        {/* Price Display */}
        <div className="flex items-center gap-1 flex-wrap mb-2">
          {product.ask_for_price ? (
            <span className="text-gray-600 text-[10px]">Contact for price</span>
          ) : hasPromo ? (
            <>
              <span className="text-gray-400 text-[10px] line-through">{formatPrice(product.actual_price)}</span>
              <span className="text-xs font-bold text-red-600">{formatPrice(product.promo_price)}</span>
              <span className="bg-green-500 text-white text-[8px] px-1 py-0.5 rounded-full">{discountPercent}%</span>
            </>
          ) : product.actual_price > 0 ? (
            <span className="text-xs font-bold text-gray-800">{formatPrice(product.actual_price)}</span>
          ) : (
            <span className="text-gray-500 text-[10px]">No price</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
            <MapPin size={10} />
            {product.location.length > 12 ? `${product.location.slice(0, 10)}...` : product.location}
          </span>
        </div>

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all duration-300 active:scale-95 text-xs disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Info size={11} />
              <span>Connect</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

/**
 * SubscriptionStatusBanner - Displays subscription status
 */
const SubscriptionStatusBanner = ({ hasSubscription, onSubscribe }) => {
  if (hasSubscription) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <div className="flex-1">
            <p className="text-green-800 font-medium">
              You have an active subscription! You can list products for sale.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Info className="text-yellow-500" size={20} />
          <div>
            <p className="text-yellow-800 font-medium">
              Get your products listed for a small subscription charge
            </p>
            <p className="text-sm text-yellow-600">
              Your subscription goes directly toward marketing your store and bringing serious buyers to you.
            </p>
          </div>
        </div>
        <button
          onClick={onSubscribe}
          className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-all duration-300 whitespace-nowrap"
        >
          Become a Seller
        </button>
      </div>
    </div>
  );
};

/**
 * PromoBanner - Call-to-action banner for sellers
 */
const PromoBanner = ({ onStartSelling, isLoading }) => (
  <div className="col-span-full mt-8">
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-8 relative overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-700 group">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <div className="flex items-center gap-3 mb-4">
            <img src={logo} alt="Loopmart" className="h-12 w-auto filter brightness-0 transition-transform duration-700 group-hover:scale-110" />
          </div>
          <p className="text-black text-base md:text-lg mb-2 font-medium">Reach more audience by promoting your Product(s)</p>
          <p className="text-black text-base md:text-lg mb-2 font-medium">Get an active badge by becoming a verified seller</p>
          <p className="text-black text-base md:text-lg font-medium">and enjoy multiple benefits that comes with being a verified seller</p>
        </div>
        <div className="flex flex-col items-center">
          <button
            onClick={onStartSelling}
            disabled={isLoading}
            className="bg-black text-white font-bold py-3 px-6 rounded-xl shadow-xl transform hover:scale-110 transition-all duration-500 flex items-center gap-2 text-base disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Get Started'}
            <ArrowRight className="animate-bounce" size={18} />
          </button>
          <p className="text-black/70 text-sm mt-3 text-center">Join thousands of successful sellers today!</p>
        </div>
      </div>
    </div>
  </div>
);

/**
 * MobilePromoBanner - Mobile-optimized CTA banner
 */
const MobilePromoBanner = ({ onStartSelling, isLoading }) => (
  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-4 text-center relative overflow-hidden my-5">
    <div className="relative z-10">
      <div className="flex items-center gap-2 justify-center mb-2">
        <img src={logo} alt="Loopmart" className="h-8 w-auto filter brightness-0" />
      </div>
      <p className="text-black font-medium text-xs mb-1">Promote your Product(s)</p>
      <p className="text-black text-[11px] mb-3">Get verified & enjoy benefits</p>
      <button
        onClick={onStartSelling}
        disabled={isLoading}
        className="bg-black text-white font-bold py-2 px-4 rounded-lg text-xs disabled:opacity-50"
      >
        {isLoading ? 'Checking...' : 'Get Started'}
      </button>
    </div>
  </div>
);

/**
 * LocationModal - State selection modal
 */
const LocationModal = ({ isOpen, onClose, onSelect, searchQuery, onSearchChange, selectedState }) => {
  if (!isOpen) return null;

  const filteredStates = NIGERIAN_STATES.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="text-red-500" /> Choose Location
          </h3>
          <button onClick={onClose} className="hover:scale-110 transition-transform">
            <X size={20} className="text-gray-600 hover:text-red-500" />
          </button>
        </div>

        <input
          type="text"
          placeholder="Search state..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <div className="max-h-64 overflow-y-auto">
          <button
            onClick={() => onSelect("Location")}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-100 text-sm text-gray-700"
          >
            All Locations
          </button>
          {filteredStates.map((state) => (
            <button
              key={state}
              onClick={() => onSelect(state)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-yellow-100 text-sm text-gray-700"
            >
              {state}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CategoriesSection() {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const initialFetchDone = useRef(false);
  
  const { hasSubscription, checkSubscription, loading: subscriptionLoading } = useSubscription();

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("Location");
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filters, setFilters] = useState({ condition: "All", verifiedSeller: false });
  const [loading, setLoading] = useState(true);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const [isConnecting, setIsConnecting] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // ============================================================
  // EFFECTS
  // ============================================================

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      fetchAllProducts();
      initialFetchDone.current = true;
    }
  }, []);

  useEffect(() => {
    const filtered = applyFilters(displayedProducts, selectedCategory, filters, selectedState);
    setFilteredProducts(filtered);
  }, [displayedProducts, selectedCategory, filters, selectedState]);

  // ============================================================
  // PRODUCT DATA FUNCTIONS
  // ============================================================

  const transformProduct = (item) => {
    // Parse image
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
    } catch {
      imageUrl = item.image_url || item.image || item.photo || "";
    }

    // Parse category
    let category = "Others";
    if (item.category_id) {
      category = CATEGORY_MAP[item.category_id] || "Others";
    } else {
      category = item.category || item.product_category || "Others";
    }

    // Parse prices
    const actualPrice = item.actual_price ? parseFloat(item.actual_price) : 0;
    const promoPrice = item.promo_price ? parseFloat(item.promo_price) : null;
    const hasPromo = promoPrice && promoPrice > 0 && promoPrice < actualPrice;

    return {
      id: item.product_id || item.id,
      name: item.title || item.name || item.product_name || "Unnamed Product",
      price: item.ask_for_price 
        ? "Contact Seller" 
        : hasPromo 
          ? formatPrice(promoPrice) 
          : formatPrice(actualPrice),
      actual_price: actualPrice,
      promo_price: promoPrice,
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
  };

  const fetchAllProducts = useCallback(async () => {
    try {
      setLoading(true);
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

      const transformedProducts = productsArray.map(transformProduct);
      setAllProducts(transformedProducts);
      
      const randomProducts = getRandomProducts(transformedProducts, PRODUCTS_PER_PAGE);
      setDisplayedProducts(randomProducts);
      setFilteredProducts(randomProducts);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast('error', 'Failed to load products. Please refresh the page.', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  const getRandomProducts = useCallback((products, count = PRODUCTS_PER_PAGE) => {
    if (!products || products.length === 0) return [];
    const shuffled = shuffleArray(products);
    return shuffled.slice(0, Math.min(count, products.length));
  }, []);

  // ============================================================
  // FILTER FUNCTIONS
  // ============================================================

  const applyFilters = useCallback((productsToFilter, category, filterState, location) => {
    let filtered = [...productsToFilter];

    if (category !== "All") {
      filtered = filtered.filter(product =>
        product.category.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(product.category.toLowerCase())
      );
    }

    if (filterState.condition !== "All") {
      filtered = filtered.filter(product => {
        if (filterState.condition === "Others") {
          return !["new", "fairly used"].includes(product.condition.toLowerCase());
        }
        return product.condition.toLowerCase() === filterState.condition.toLowerCase();
      });
    }

    if (filterState.verifiedSeller) {
      filtered = filtered.filter(product => product.seller_verified);
    }

    if (location !== "Location") {
      filtered = filtered.filter(product =>
        product.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    return filtered;
  }, []);

  const refreshProducts = useCallback(() => {
    if (allProducts.length > 0) {
      const newRandomProducts = getRandomProducts(allProducts, PRODUCTS_PER_PAGE);
      setDisplayedProducts(newRandomProducts);
      const filtered = applyFilters(newRandomProducts, selectedCategory, filters, selectedState);
      setFilteredProducts(filtered);
      showToast('info', 'Products refreshed! Showing new random selection.', 'Refreshed');
    }
  }, [allProducts, getRandomProducts, selectedCategory, filters, selectedState, applyFilters]);

  const clearFilters = useCallback(() => {
    setSelectedCategory("All");
    setFilters({ condition: "All", verifiedSeller: false });
    setSelectedState("Location");
    setIsCategoryDropdownOpen(false);
  }, []);

  // ============================================================
  // EVENT HANDLERS
  // ============================================================

  const scroll = useCallback((direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  }, []);

  const handleCategorySelect = useCallback((categoryName) => {
    setSelectedCategory(categoryName);
    setIsCategoryDropdownOpen(false);
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
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
        body: JSON.stringify({ product_id: product.id, user_id: userData.id })
      });

      const data = await response.json();

      if (data.status === true || data.success === true) {
        showToast('success', 'Interest sent! Seller will contact you.', 'Success! 🎯');
        setTimeout(() => navigate(`/products/${product.id}`), 1500);
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

  const handleLocationSelect = useCallback((state) => {
    setSelectedState(state);
    setIsModalOpen(false);
  }, []);

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const renderProductGrid = (products, isMobile = false) => {
    if (products.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your filters.</p>
          <button onClick={clearFilters} className="mt-4 text-red-500 hover:text-red-700 font-medium">
            Clear all filters
          </button>
        </div>
      );
    }

    const Card = isMobile ? MobileProductCard : ProductCard;
    const gridClass = isMobile 
      ? "grid grid-cols-2 gap-3" 
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    return (
      <>
        <div className={gridClass}>
          {products.map((product) => (
            <Card
              key={product.id}
              product={product}
              onProductClick={handleProductClick}
              onConnectClick={handleConnectClick}
              isConnecting={isConnecting === product.id}
            />
          ))}
        </div>
        {showPromoBanner && products.length > 0 && (
          isMobile 
            ? <MobilePromoBanner onStartSelling={handleStartSellingClick} isLoading={subscriptionLoading} />
            : <PromoBanner onStartSelling={handleStartSellingClick} isLoading={subscriptionLoading} />
        )}
      </>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section className="pt-0 pb-8 md:py-8 bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="text-left">
            <h2 className="text-3xl font-bold text-black">Select product category</h2>
            <p className="text-gray-600 mt-2">(choose a category to filter your search)</p>
            <p className="text-xs text-gray-400 mt-1">
              Showing {filteredProducts.length} of {totalProducts} products
            </p>
          </div>
          
          {/* Desktop Controls */}
          <div className="hidden md:flex text-right items-center gap-2">
            <button
              onClick={refreshProducts}
              className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm hover:bg-yellow-600 transition-all duration-300 shadow-sm hover:scale-105"
              title="Show different products"
            >
              <RefreshIcon />
              <span className="hidden sm:inline">Shuffle Products</span>
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-yellow-100 transition-all duration-300 bg-white shadow-sm hover:scale-105"
            >
              <span>{selectedState}</span>
              <MapPin size={16} className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Banner */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <SubscriptionStatusBanner 
          hasSubscription={hasSubscription} 
          onSubscribe={handleSubscribeClick}
        />
      </div>

      {/* Mobile Floating Action Button */}
      <MobileFloatingButton 
        onClick={handleStartSellingClick} 
        isLoading={subscriptionLoading}
        hasSubscription={hasSubscription}
      />

      {/* DESKTOP LAYOUT */}
      <div className="hidden md:flex gap-6 px-4">
        {/* Sidebar Filters */}
        <aside className="w-1/4 bg-white rounded-xl shadow p-5 sticky top-4 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FaFilter className="text-gray-700" /> Filter
            </h3>
            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-700 transition-colors duration-300">
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <p className="text-gray-700 font-medium mb-2">Category</p>
            <div className="relative">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                <span>{selectedCategory === "All" ? "All Categories" : selectedCategory}</span>
                <ChevronDown size={16} className={`transition-transform duration-300 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    onClick={() => handleCategorySelect("All")}
                    className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 ${
                      selectedCategory === "All" ? "bg-yellow-100 text-yellow-800 font-medium" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => handleCategorySelect(cat.name)}
                      className={`w-full text-left px-3 py-2 text-sm transition-all duration-200 ${
                        selectedCategory === cat.name ? "bg-yellow-100 text-yellow-800 font-medium" : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Condition Filter */}
          <p className="text-gray-700 font-medium mb-2">Product Condition</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {["All", "New", "Others"].map((condition) => (
              <button
                key={condition}
                onClick={() => handleFilterChange("condition", condition)}
                className={`border rounded-lg px-3 py-1 text-sm transition-all duration-300 hover:scale-105 ${
                  filters.condition === condition
                    ? "bg-yellow-100 border-yellow-400 text-yellow-800"
                    : "border-gray-300 hover:bg-yellow-100"
                }`}
              >
                {condition}
              </button>
            ))}
          </div>

          {/* Verified Seller Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MdVerified size={20} className="text-blue-500" />
              <p className="text-gray-700 text-sm">Verified seller</p>
            </div>
            <ToggleSwitch
              checked={filters.verifiedSeller}
              onChange={(checked) => handleFilterChange("verifiedSeller", checked)}
            />
          </div>

          <button
            onClick={clearFilters}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg shadow transition-all duration-300 mb-4 transform hover:scale-105 active:scale-95"
          >
            Reset Filters
          </button>

          {/* Sell CTA */}
          <SellCTA onStartSelling={handleStartSellingClick} isLoading={subscriptionLoading} />
        </aside>

        {/* Main Content */}
        <div className="w-3/4">
          {/* Categories Carousel */}
          <CategoriesCarousel
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
            scrollRef={scrollRef}
            onScroll={scroll}
          />

          {/* Products Grid */}
          <div className="rounded-xl shadow p-6">
            {loading ? (
              <LoadingSpinner />
            ) : (
              renderProductGrid(filteredProducts, false)
            )}
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="block md:hidden px-3 mt-4">
        {/* Categories Carousel - Mobile */}
        <CategoriesCarouselMobile
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          scrollRef={scrollRef}
          onScroll={scroll}
        />

        {/* Mobile Action Row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <button
            onClick={refreshProducts}
            className="flex items-center gap-1.5 bg-yellow-500 text-black px-3 py-2 rounded-lg text-xs font-medium hover:bg-yellow-600 transition-all duration-300"
          >
            <RefreshIcon size={14} />
            <span>Shuffle</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-2 text-xs bg-white shadow-sm"
          >
            <span className="max-w-[100px] truncate">{selectedState}</span>
            <MapPin size={14} className="text-gray-500" />
          </button>

          <button onClick={clearFilters} className="text-red-500 text-xs font-medium px-2 py-2">
            Reset
          </button>
        </div>

        {/* Mobile Filters */}
        <MobileFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Products Grid - Mobile */}
        <div className="rounded-xl">
          {loading ? (
            <LoadingSpinner />
          ) : (
            renderProductGrid(filteredProducts, true)
          )}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleLocationSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedState={selectedState}
      />
    </section>
  );
}

// ============================================================
// RENDER HELPERS (Sub-components)
// ============================================================

const RefreshIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <path d="M16 16h5v5"/>
  </svg>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
  </div>
);

const ToggleSwitch = ({ checked, onChange }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only peer"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
    <div className="relative w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer transition-all duration-500 ease-in-out peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-green-600 shadow-inner">
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transform transition-all duration-500 ease-in-out ${
        checked ? 'translate-x-7 scale-110 bg-white' : 'translate-x-1 scale-100 bg-gray-50'
      }`}>
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          checked ? 'bg-green-400 opacity-20 animate-pulse' : 'bg-gray-400 opacity-10'
        }`} />
      </div>
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        checked ? 'bg-green-400 opacity-30 blur-sm scale-110' : 'bg-gray-400 opacity-0'
      }`} />
    </div>
    <span className={`ml-2 text-xs font-medium transition-all duration-300 ${checked ? 'text-green-600' : 'text-gray-500'}`}>
      {checked ? 'ON' : 'OFF'}
    </span>
  </label>
);

const SellCTA = ({ onStartSelling, isLoading }) => (
  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-4 text-center border-2 border-yellow-300 shadow-lg transform hover:scale-105 transition-all duration-500 hover:shadow-2xl">
    <Store className="w-8 h-8 mx-auto mb-2 text-black animate-bounce" />
    <h4 className="font-bold text-black text-lg mb-2">Start Selling Today!</h4>
    <p className="text-black text-sm mb-3">Join thousands of successful sellers on LoopMart</p>
    <button
      onClick={onStartSelling}
      disabled={isLoading}
      className="bg-black text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 w-full transform hover:scale-105 active:scale-95 disabled:opacity-50"
    >
      {isLoading ? 'Checking...' : 'Get Started'}
    </button>
  </div>
);

const MobileFloatingButton = ({ onClick, isLoading, hasSubscription }) => (
  <div className="md:hidden fixed bottom-6 right-6 z-40">
    <div className="relative group">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center disabled:opacity-50"
        style={{ boxShadow: '0 10px 25px rgba(251, 191, 36, 0.5)', width: '60px', height: '60px' }}
      >
        <Store size={24} className="text-black" />
      </button>
      <div className="absolute bottom-full right-0 mb-2 w-48 bg-black text-white text-xs rounded-lg py-2 px-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center gap-2">
          <Store size={14} />
          <span className="font-medium">Start Selling Today!</span>
        </div>
        <div className="mt-1 text-gray-300">
          {isLoading ? 'Checking...' : (hasSubscription ? 'Tap to start' : 'Subscription required')}
        </div>
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black" />
      </div>
    </div>
  </div>
);

const CategoriesCarousel = ({ categories, selectedCategory, onSelect, scrollRef, onScroll }) => (
  <div className="relative flex items-center mb-6">
    <button
      onClick={() => onScroll("left")}
      className="absolute left-0 z-10 bg-white shadow-md rounded-full p-2 hover:bg-yellow-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
    >
      <ChevronLeft size={22} />
    </button>

    <div
      ref={scrollRef}
      className="flex overflow-x-auto gap-5 scroll-smooth px-10 py-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((cat) => (
        <div
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={`min-w-[180px] h-36 rounded-xl border cursor-pointer bg-white shadow-sm flex flex-col justify-center items-center text-center transition-all duration-500 hover:scale-105 hover:shadow-md ${
            selectedCategory === cat.name ? "border-yellow-400 border-2 bg-yellow-50" : "border-gray-100"
          } ${cat.color || ""}`}
        >
          {cat.img && (
            <img
              src={cat.img}
              alt={cat.name}
              className="w-16 h-16 object-contain mb-3 transition-transform duration-700 hover:scale-110 hover:rotate-3"
              loading="lazy"
            />
          )}
          <h3 className="font-medium text-gray-700">{cat.name}</h3>
        </div>
      ))}
    </div>

    <button
      onClick={() => onScroll("right")}
      className="absolute right-0 z-10 bg-white shadow-md rounded-full p-2 hover:bg-yellow-100 transition-all duration-300 transform hover:scale-110 active:scale-95"
    >
      <ChevronRight size={22} />
    </button>
  </div>
);

const CategoriesCarouselMobile = ({ categories, selectedCategory, onSelect, scrollRef, onScroll }) => (
  <div className="relative flex items-center mb-4">
    <button
      onClick={() => onScroll("left")}
      className="absolute left-0 z-10 bg-white shadow-md rounded-full p-1.5 hover:bg-yellow-100 transition-all duration-300"
    >
      <ChevronLeft size={18} />
    </button>

    <div
      ref={scrollRef}
      className="flex overflow-x-auto gap-3 scroll-smooth px-7 py-2"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((cat) => (
        <div
          key={cat.name}
          onClick={() => onSelect(cat.name)}
          className={`min-w-[calc(50%-6px)] w-[calc(50%-6px)] h-24 rounded-xl border cursor-pointer bg-white shadow-sm flex flex-col justify-center items-center text-center transition-all duration-300 ${
            selectedCategory === cat.name ? "border-yellow-400 border-2 bg-yellow-50" : "border-gray-100"
          } ${cat.color || ""}`}
        >
          {cat.img && (
            <img src={cat.img} alt={cat.name} className="w-10 h-10 object-contain mb-1" loading="lazy" />
          )}
          <h3 className="font-medium text-gray-700 text-xs">{cat.name}</h3>
        </div>
      ))}
    </div>

    <button
      onClick={() => onScroll("right")}
      className="absolute right-0 z-10 bg-white shadow-md rounded-full p-1.5 hover:bg-yellow-100 transition-all duration-300"
    >
      <ChevronRight size={18} />
    </button>
  </div>
);

const MobileFilters = ({ filters, onFilterChange }) => (
  <div className="bg-white rounded-xl p-3 mb-4 border border-gray-200">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-gray-700 text-sm font-medium">Condition:</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {["All", "New", "Fairly Used", "Others"].map((condition) => (
        <button
          key={condition}
          onClick={() => onFilterChange("condition", condition)}
          className={`px-2.5 py-1 rounded-full text-xs transition-all duration-300 ${
            filters.condition === condition
              ? "bg-yellow-400 text-black font-medium"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {condition === "Fairly Used" ? "F.Used" : condition}
        </button>
      ))}
    </div>

    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
      <div className="flex items-center gap-1.5">
        <MdVerified size={14} className="text-green-500" />
        <span className="text-gray-700 text-xs">Verified Seller</span>
      </div>
      <ToggleSwitch
        checked={filters.verifiedSeller}
        onChange={(checked) => onFilterChange("verifiedSeller", checked)}
      />
    </div>
  </div>
);
