// ShopPage.jsx - Clean version without verified text and camera icons
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaArrowLeft, FaHome } from "react-icons/fa";
import { 
  FaCheckCircle, FaTimes, FaStore, FaPhone, FaMapMarkerAlt, 
  FaPlus, FaShare, FaEdit, FaRocket, FaTrash, FaEllipsisV,
  FaThumbsUp, FaExclamationTriangle, FaFilter, FaComment, 
  FaCalendar, FaShoppingBag, FaUsers, FaGlobe
} from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

// Helper functions
const getCurrentUser = () => {
  try {
    const userData = localStorage.getItem('loopmart_user');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
};

const getToken = () => {
  try {
    return localStorage.getItem('loopmart_token') || localStorage.getItem('token');
  } catch {
    return null;
  }
};

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatImageUrl = (url, type) => {
  if (!url || url === '' || url === 'null' || url === 'undefined' || url === '[]') {
    return '';
  }

  const cleanUrl = url.toString().replace(/[\[\]"]/g, '').trim();
  if (!cleanUrl) return '';

  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    return cleanUrl;
  }

  if (type === 'profile' || type === 'banner') {
    return `https://loopmart.ng/uploads/users/${cleanUrl}`;
  } else if (type === 'product') {
    return `https://loopmart.ng/uploads/products/${cleanUrl}`;
  }

  return `https://loopmart.ng/uploads/${cleanUrl}`;
};

const formatReviewDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Recently';
  }
};

// Reviews Sidebar Component
const ReviewsSidebar = ({ 
  reviews, 
  shopName,
  averageRating,
  totalReviews,
  ratingDistribution,
  isOpen,
  onClose,
  loadingReviews,
  onRefreshReviews
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [filteredReviews, setFilteredReviews] = useState(reviews || []);

  useEffect(() => {
    let filtered = reviews || [];
    switch (activeFilter) {
      case 'verified':
        filtered = (reviews || []).filter(review => review.verifiedPurchase);
        break;
      case 'high':
        filtered = (reviews || []).filter(review => review.rating >= 4);
        break;
      case 'low':
        filtered = (reviews || []).filter(review => review.rating <= 2);
        break;
      default:
        filtered = reviews || [];
    }
    setFilteredReviews(filtered);
  }, [activeFilter, reviews]);

  const handleHelpful = (reviewId) => {
    setFilteredReviews(prev => prev.map(review =>
      review.id === reviewId 
        ? { ...review, helpfulCount: (review.helpfulCount || 0) + 1 }
        : review
    ));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? "text-yellow-500" : "text-gray-300"}
        size={14}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          />

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-full md:w-96 bg-white shadow-xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <FaTimes className="text-gray-500" size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
                  <p className="text-sm text-gray-600">{shopName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" size={18} />
                <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
              </div>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center flex-1">
                  <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <div className="text-sm text-gray-600">{totalReviews} reviews</div>
                </div>
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-600 w-8">{stars}★</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${(ratingDistribution[stars] || 0) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">
                        {ratingDistribution[stars] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <button 
                onClick={onRefreshReviews}
                disabled={loadingReviews}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
              >
                {loadingReviews ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <FaComment size={14} />
                    <span>Refresh Reviews</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {['all', 'verified', 'high', 'low'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      activeFilter === filter
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'all' ? 'All Reviews' :
                     filter === 'verified' ? 'Verified Purchases' :
                     filter === 'high' ? 'High Rating (4-5)' : 'Low Rating (1-2)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4">
              {loadingReviews ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <FaComment className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500">No reviews found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredReviews.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{review.reviewerName}</span>
                            {review.verifiedPurchase && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                <FaCheckCircle size={10} />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <FaCalendar size={12} />
                            {review.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>

                      {review.productName && (
                        <div className="mb-2 text-sm text-gray-600">
                          Product: <span className="font-medium">{review.productName}</span>
                        </div>
                      )}

                      <p className="text-gray-700 mb-3">{review.comment}</p>

                      <button
                        onClick={() => handleHelpful(review.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                      >
                        <FaThumbsUp size={14} />
                        Helpful ({review.helpfulCount || 0})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Shop Page Component
export default function ShopPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwnShop, setIsOwnShop] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({5: 0, 4: 0, 3: 0, 2: 0, 1: 0});
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [bannerError, setBannerError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalEarnings: 0,
    activeProducts: 0
  });

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const getShopIdFromSlug = () => {
    if (!slug) return '';
    if (!isNaN(Number(slug))) return slug;
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    if (!isNaN(Number(lastPart))) return lastPart;
    return slug;
  };

  const fetchAverageRating = useCallback(async (userId, shopToken) => {
    try {
      const token = getToken();
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      let url = `https://loopmart.ng/api/v1/user/avg-rating?userId=${userId}`;
      if (shopToken) url += `&shop_token=${shopToken}`;
      
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data = await response.json();
        if (data.data?.avg_rating !== undefined) return parseFloat(data.data.avg_rating);
        if (data.avg_rating !== undefined) return parseFloat(data.avg_rating);
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }, []);

  const fetchShopReviews = useCallback(async (userId, shopToken) => {
    try {
      setLoadingReviews(true);
      const token = getToken();
      
      if (!shopToken) {
        setReviews([]);
        setLoadingReviews(false);
        return;
      }

      const url = `https://loopmart.ng/api/v1/user/review?user_id=${userId}&shop_token=${shopToken}`;
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        let reviewList = [];
        
        if (data.status === true && data.productReviews) {
          data.productReviews.forEach(product => {
            if (product.reviews && Array.isArray(product.reviews)) {
              product.reviews.forEach(review => {
                reviewList.push({
                  id: review.id || Date.now(),
                  rating: parseInt(review.rate) || 3,
                  comment: review.comment || '',
                  date: formatReviewDate(review.created_at),
                  reviewerName: review.user?.name || 'Anonymous',
                  verifiedPurchase: true,
                  productName: product.title
                });
              });
            }
          });
        }
        
        setReviews(reviewList);
        setTotalReviews(reviewList.length);
        
        const avg = reviewList.length > 0 
          ? reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length 
          : 0;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const fetchShopData = useCallback(async () => {
    try {
      setLoading(true);
      const shopId = getShopIdFromSlug();
      if (!shopId) {
        setError('Invalid shop URL');
        setLoading(false);
        return;
      }

      const token = getToken();
      let userProducts = [];
      let shopTokenFromProducts = null;
      
      try {
        const productsResponse = await fetch('https://loopmart.ng/api/allproduct');
        if (productsResponse.ok) {
          const allProducts = await productsResponse.json();
          userProducts = allProducts.filter((product) => 
            product.user_id?.toString() === shopId.toString() || 
            product.seller_id?.toString() === shopId.toString()
          );
          
          if (userProducts.length > 0 && userProducts[0].shop_token) {
            shopTokenFromProducts = userProducts[0].shop_token;
          }
        }
      } catch (productError) {
        console.log('Failed to fetch products:', productError);
      }

      if (userProducts.length === 0) {
        setError('No shop found');
        setLoading(false);
        return;
      }

      const firstProduct = userProducts[0];
      
      let bannerUrl = '';
      if (firstProduct?.shop_banner) {
        bannerUrl = formatImageUrl(firstProduct.shop_banner, 'banner');
      }
      
      let profilePicture = '';

      const totalSales = userProducts.reduce((sum, product) => {
        return sum + (parseInt(product.sold) || 0);
      }, 0);

      const avgRating = await fetchAverageRating(shopId, shopTokenFromProducts);

      const shopData = {
        id: parseInt(shopId),
        username: firstProduct?.name || firstProduct?.username || 'Seller',
        email: firstProduct?.email || '',
        phone: firstProduct?.phone_number || '',
        location: firstProduct?.location || 'Unknown',
        description: firstProduct?.bio || 'No description available',
        isVerified: false,
        profilePicture: profilePicture,
        coverImage: bannerUrl,
        totalProducts: userProducts.length,
        shopToken: shopTokenFromProducts
      };

      setShop(shopData);
      setStats({ totalSales, totalEarnings: 0, activeProducts: userProducts.length });
      
      if (currentUser?.id?.toString() === shopId.toString()) {
        setIsOwnShop(true);
      }

      const transformedProducts = userProducts.map((item) => {
        let productImage = '';
        try {
          if (item.image_url) {
            let imageUrl = item.image_url;
            if (typeof imageUrl === 'string' && imageUrl.startsWith('[')) {
              try {
                const imageArray = JSON.parse(imageUrl);
                if (Array.isArray(imageArray) && imageArray.length > 0) {
                  imageUrl = imageArray[0];
                }
              } catch (e) {}
            }
            if (imageUrl && imageUrl !== '[]') {
              productImage = formatImageUrl(imageUrl, 'product');
            }
          }
        } catch (error) {}
        
        const actualPrice = item.actual_price ? parseFloat(item.actual_price) : 0;
        const promoPrice = item.promo_price ? parseFloat(item.promo_price) : null;
        const hasPromo = promoPrice && promoPrice < actualPrice;
        
        return {
          id: item.product_id || item.id,
          title: item.title || "Unnamed Product",
          price: item.ask_for_price ? "Contact Seller" : 
                (hasPromo ? `₦${promoPrice?.toLocaleString()}` : `₦${actualPrice.toLocaleString()}`),
          image: productImage || 'https://via.placeholder.com/300x200?text=No+Image',
          condition: item.condition || "Unknown",
          location: item.location || "Unknown",
          description: item.description || "",
          quantity: item.quantity || "0",
          sold: item.sold || "0"
        };
      });

      setProducts(transformedProducts);
      await fetchShopReviews(shopId, shopTokenFromProducts);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  }, [slug, currentUser, fetchShopReviews, fetchAverageRating]);

  const refreshReviews = () => {
    if (shop && shop.shopToken) {
      fetchShopReviews(shop.id.toString(), shop.shopToken);
    }
  };

  useEffect(() => {
    if (slug) fetchShopData();
  }, [slug, fetchShopData]);

  const handleBack = () => navigate(-1);
  const handleGoHome = () => navigate('/');
  const handleProductClick = (productId) => navigate(`/products/${productId}`);
  const handleContactSeller = () => {
    if (shop?.phone) window.open(`tel:${shop.phone}`, '_blank');
    else toast?.info('Contact information not available');
  };
  const handleShareProduct = (product) => {
    const shareUrl = window.location.origin + `/products/${product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.title, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast?.success('Link copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <FaStore className="text-red-500 text-5xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Shop could not be found'}</p>
          <button onClick={handleBack} className="w-full bg-yellow-500 text-white font-medium py-3 rounded-lg">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <FaArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
              </button>
              <button onClick={handleGoHome} className="flex items-center gap-2 text-gray-600 hover:text-yellow-600">
                <FaHome size={18} />
                <span className="text-sm font-medium">Home</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">{shop.username}'s Shop</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Banner Section - No camera icon */}
          <div className="h-32 md:h-48 lg:h-56 relative border-b border-gray-300">
            {shop.coverImage && shop.coverImage !== '' && !bannerError ? (
              <img 
                src={shop.coverImage} 
                alt="Shop Banner" 
                className="absolute inset-0 w-full h-full object-cover" 
                onError={() => setBannerError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center">
                <FaStore className="text-white text-4xl md:text-5xl opacity-50" />
              </div>
            )}
          </div>

          {/* Profile Info - No camera icon */}
          <div className="px-4 md:px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:-mt-16 mb-4">
              {/* Profile Picture - No camera icon */}
              <div className="relative -mt-12 md:-mt-0 mx-auto md:mx-0">
                {shop.profilePicture && shop.profilePicture !== '' && !profileError ? (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                    <img src={shop.profilePicture} alt="Profile" className="object-cover w-full h-full" onError={() => setProfileError(true)} />
                  </div>
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border-4 border-white flex items-center justify-center text-white text-xl md:text-3xl font-bold shadow-lg">
                    {getInitials(shop.username)}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 md:ml-auto md:mb-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={handleContactSeller}
                    className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-yellow-600 transition"
                  >
                    <FaPhone size={14} />
                    <span>Contact Seller</span>
                  </button>
                  <button 
                    onClick={() => setShowReviews(true)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:bg-blue-600 transition"
                  >
                    <FaStar size={14} />
                    <span>Reviews ({totalReviews})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Shop Details - No Verified text */}
            <div className="mt-4 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{shop.username}</h1>
              
              {shop.email && <p className="text-gray-500 text-sm mb-3">{shop.email}</p>}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <FaStar className="text-yellow-500" />
                  <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {shop.phone && (
                    <div className="flex items-center gap-1">
                      <FaPhone size={12} className="text-gray-400" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  {shop.location && (
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt size={12} className="text-gray-400" />
                      <span>{shop.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <FaShoppingBag size={12} className="text-gray-400" />
                    <span>{shop.totalProducts} Products</span>
                  </div>
                  {stats.totalSales > 0 && (
                    <div className="flex items-center gap-1">
                      <FaUsers size={12} className="text-gray-400" />
                      <span>{stats.totalSales} Sales</span>
                    </div>
                  )}
                </div>
              </div>

              {shop.description && shop.description !== 'No description available' && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                  <p className="text-gray-600 text-sm">{shop.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="px-4 md:px-6 pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Products ({products.length})</h2>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition relative group"
                  >
                    {/* Dropdown Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition z-10">
                      <div className="relative">
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <FaEllipsisV className="text-gray-500" size={16} />
                        </button>

                        <AnimatePresence>
                          {activeDropdown === index && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1"
                            >
                              <button
                                onClick={() => {
                                  handleShareProduct(product);
                                  setActiveDropdown(null);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <FaShare className="mr-3" size={14} /> Share
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div 
                      className="bg-gray-100 h-48 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {product.image && !product.image.includes('placeholder.com') ? (
                        <img src={product.image} alt={product.title} className="object-cover h-full w-full hover:scale-105 transition" />
                      ) : (
                        <FaStore className="text-gray-400 text-3xl" />
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600">
                      {product.title}
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-red-600">{product.price}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.condition === 'new' ? 'bg-green-100 text-green-800' : 
                        product.condition === 'fairly_used' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {product.condition === 'fairly_used' ? 'Fairly Used' : product.condition}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{product.location}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <FaStore className="text-gray-400 text-5xl mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No products listed yet</h3>
                <p className="text-gray-500">This shop hasn't listed any products yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Sidebar */}
      <ReviewsSidebar
        reviews={reviews}
        shopName={shop.username}
        averageRating={averageRating}
        totalReviews={totalReviews}
        ratingDistribution={ratingDistribution}
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
        loadingReviews={loadingReviews}
        onRefreshReviews={refreshReviews}
      />
    </div>
  );
}
