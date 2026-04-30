// ShopPage.jsx - Add Product button removed for visitors
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaCamera, FaArrowLeft, FaHome } from "react-icons/fa";
import { 
  FaCheckCircle, FaTimes, FaStore, FaPhone, FaMapMarkerAlt, 
  FaPlus, FaShare, FaEdit, FaRocket, FaTrash, FaEllipsisV,
  FaThumbsUp, FaExclamationTriangle, FaFilter, FaComment, 
  FaCalendar, FaShoppingBag, FaUsers, FaGlobe, FaUserCircle
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

const getShopToken = () => {
  try {
    return localStorage.getItem('loopmart_shop_token');
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
            {/* Header */}
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

            {/* Rating Summary */}
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

            {/* Filter Buttons */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FaFilter className="text-gray-400" size={16} />
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

            {/* Reviews List */}
            <div className="p-4">
              {loadingReviews ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading reviews...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <FaComment className="text-gray-300 text-4xl mx-auto mb-3" />
                  <p className="text-gray-500">No reviews found {activeFilter !== 'all' ? 'with this filter' : 'for this shop'}</p>
                  {activeFilter !== 'all' && (
                    <button 
                      onClick={() => setActiveFilter('all')}
                      className="mt-3 text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Show all reviews
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-800 mb-4">
                    {filteredReviews.length} Review{filteredReviews.length !== 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-6">
                    {filteredReviews.map((review) => (
                      <div key={review.id} className="pb-6 border-b border-gray-100 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {review.reviewerImage ? (
                              <img 
                                src={review.reviewerImage} 
                                alt={review.reviewerName}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {review.reviewerInitials}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {review.reviewerName}
                                </span>
                                {review.verifiedPurchase && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                                    <FaCheckCircle size={10} />
                                    Verified Purchase
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <FaCalendar size={12} />
                                {review.date}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>

                        {review.productName && (
                          <div className="mb-2">
                            <span className="text-sm text-gray-600">Product: </span>
                            <span className="text-sm font-medium text-gray-800">
                              {review.productName}
                            </span>
                          </div>
                        )}

                        <p className="text-gray-700 mb-3">{review.comment}</p>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleHelpful(review.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                          >
                            <FaThumbsUp size={14} />
                            Helpful ({review.helpfulCount || 0})
                          </button>
                          {review.rating <= 2 && (
                            <div className="flex items-center gap-1 text-red-600 text-sm">
                              <FaExclamationTriangle size={14} />
                              <span>Critical Review</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
  
  // Reviews data
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Image errors
  const [bannerError, setBannerError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalEarnings: 0,
    activeProducts: 0
  });

  // Get current user
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Get shop ID from slug
  const getShopIdFromSlug = () => {
    if (!slug) return '';
    if (!isNaN(Number(slug))) return slug;
    
    const parts = slug.split('-');
    const lastPart = parts[parts.length - 1];
    if (!isNaN(Number(lastPart))) return lastPart;
    
    return slug;
  };

  // Function to fetch average rating
  const fetchAverageRating = useCallback(async (userId, shopToken) => {
    try {
      console.log('Fetching average rating for user:', userId);
      
      const token = getToken();
      const headers = {
        'Accept': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let url = `https://loopmart.ng/api/v1/user/avg-rating?userId=${userId}`;
      if (shopToken) {
        url += `&shop_token=${shopToken}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        
        // Check different response formats
        if (data.data?.avg_rating !== undefined) {
          return parseFloat(data.data.avg_rating);
        } else if (data.avg_rating !== undefined) {
          return parseFloat(data.avg_rating);
        } else if (data.data?.avg !== undefined) {
          return parseFloat(data.data.avg);
        } else if (data.avg !== undefined) {
          return parseFloat(data.avg);
        } else if (data.data?.rating !== undefined) {
          return parseFloat(data.data.rating);
        } else if (data.rating !== undefined) {
          return parseFloat(data.rating);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching average rating:', error);
      return 0;
    }
  }, []);

  // Function to fetch reviews
  const fetchShopReviews = useCallback(async (userId, shopToken, shopProducts = []) => {
    try {
      setLoadingReviews(true);
      console.log('Fetching reviews for user:', userId);

      const token = getToken();
      let realReviews = [];

      if (!shopToken) {
        console.log('No shop_token available, cannot fetch reviews');
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
        setRatingDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        setLoadingReviews(false);
        return;
      }

      try {
        const url = `https://loopmart.ng/api/v1/user/review?user_id=${userId}&shop_token=${shopToken}`;
        
        const headers = {
          'Accept': 'application/json'
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const userReviewsResponse = await fetch(url, { headers });
        
        if (userReviewsResponse.ok) {
          const reviewsData = await userReviewsResponse.json();
          
          if (reviewsData.status === true && reviewsData.productReviews) {
            reviewsData.productReviews.forEach((product) => {
              if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
                product.reviews.forEach((apiReview) => {
                  const reviewerName = apiReview.user?.name || 'Anonymous Buyer';
                  const reviewerImage = apiReview.user?.photo_url ? 
                    formatImageUrl(apiReview.user.photo_url, 'profile') : '';
                  
                  realReviews.push({
                    id: apiReview.id || Date.now() + Math.random(),
                    reviewerName: reviewerName,
                    reviewerInitials: getInitials(reviewerName),
                    rating: parseInt(apiReview.rate) || 3,
                    comment: apiReview.comment || 'No comment provided',
                    date: formatReviewDate(apiReview.created_at || new Date().toISOString()),
                    verifiedPurchase: true,
                    productName: product.title,
                    helpfulCount: 0,
                    productId: parseInt(product.id) || product.id,
                    reviewerId: parseInt(apiReview.reviewer_id) || apiReview.reviewer_id,
                    reviewerImage: reviewerImage
                  });
                });
              }
            });
            
            const total = reviewsData.totalReview || 0;
            const avg = reviewsData.avgRating || 0;
            const distribution = reviewsData.rate || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            
            setReviews(realReviews);
            setAverageRating(avg);
            setTotalReviews(total);
            setRatingDistribution(distribution);
            
          } else if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
            realReviews = reviewsData.reviews.map((apiReview) => ({
              id: apiReview.id || Date.now() + Math.random(),
              reviewerName: apiReview.user?.name || 'Anonymous Buyer',
              reviewerInitials: getInitials(apiReview.user?.name || 'AB'),
              rating: parseInt(apiReview.rate || apiReview.rating) || 3,
              comment: apiReview.comment || 'No comment provided',
              date: formatReviewDate(apiReview.created_at || new Date().toISOString()),
              verifiedPurchase: true,
              productName: apiReview.product_title || 'Product',
              helpfulCount: 0,
              productId: apiReview.product_id,
              reviewerId: apiReview.reviewer_id || apiReview.user_id,
              reviewerImage: apiReview.user?.photo_url ? formatImageUrl(apiReview.user.photo_url, 'profile') : ''
            }));
            
            const total = realReviews.length;
            const avg = realReviews.reduce((sum, review) => sum + review.rating, 0) / (total || 1);
            const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            
            realReviews.forEach(review => {
              const rating = Math.min(5, Math.max(1, Math.round(review.rating)));
              distribution[rating]++;
            });
            
            setReviews(realReviews);
            setAverageRating(avg);
            setTotalReviews(total);
            setRatingDistribution(distribution);
          }
        }
      } catch (userReviewError) {
        console.log('User reviews endpoint error:', userReviewError);
      }

      if (realReviews.length === 0) {
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
        setRatingDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      }

    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
      setRatingDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  // Fetch shop data
  const fetchShopData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setBannerError(false);
      setProfileError(false);
      
      const shopId = getShopIdFromSlug();
      if (!shopId) {
        setError('Invalid shop URL');
        setLoading(false);
        return;
      }

      console.log('Fetching shop data for ID:', shopId);

      const token = getToken();
      
      let userData = null;
      let verifiedShopData = null;
      
      if (token) {
        try {
          const response = await fetch(`https://loopmart.ng/api/v1/verified-seller/details?userId=${shopId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              verifiedShopData = data.data;
            }
          }
        } catch (verifiedError) {
          console.log('Verified seller endpoint error:', verifiedError);
        }
      }

      if (!verifiedShopData) {
        try {
          const response = await fetch(`https://loopmart.ng/api/v1/users/${shopId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.data?.user) {
              userData = data.data.user;
            }
          }
        } catch (publicError) {
          console.log('Public endpoint failed:', publicError);
        }
      }

      if (!verifiedShopData && !userData && token) {
        try {
          const response = await fetch('https://loopmart.ng/api/v1/user', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.data?.user && data.data.user.id?.toString() === shopId.toString()) {
              userData = data.data.user;
            }
          }
        } catch (authError) {
          console.log('Authenticated endpoint failed:', authError);
        }
      }

      // Fetch all products to find user's products
      console.log('Fetching all products...');
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
          console.log(`Found ${userProducts.length} products for user ${shopId}`);
          
          if (userProducts.length > 0 && userProducts[0].shop_token) {
            shopTokenFromProducts = userProducts[0].shop_token;
          }
        }
      } catch (productError) {
        console.log('Failed to fetch products:', productError);
      }

      if (userProducts.length === 0 && !verifiedShopData && !userData) {
        setError('No shop found for this user');
        setLoading(false);
        return;
      }

      const firstProduct = userProducts[0];
      const sourceData = verifiedShopData || userData;
      
      let bannerUrl = '';
      if (verifiedShopData?.banner) {
        bannerUrl = formatImageUrl(verifiedShopData.banner, 'banner');
      } else if (sourceData?.banner) {
        bannerUrl = formatImageUrl(sourceData.banner, 'banner');
      } else if (sourceData?.cover_image) {
        bannerUrl = formatImageUrl(sourceData.cover_image, 'banner');
      } else if (firstProduct?.shop_banner) {
        bannerUrl = formatImageUrl(firstProduct.shop_banner, 'banner');
      }
      
      let profilePicture = '';
      if (verifiedShopData?.photo_url) {
        profilePicture = formatImageUrl(verifiedShopData.photo_url, 'profile');
      } else if (sourceData?.photo_url) {
        profilePicture = formatImageUrl(sourceData.photo_url, 'profile');
      } else if (sourceData?.profile_picture) {
        profilePicture = formatImageUrl(sourceData.profile_picture, 'profile');
      }

      const totalSales = userProducts.reduce((sum, product) => {
        return sum + (parseInt(product.sold) || 0);
      }, 0);

      const totalEarnings = userProducts.reduce((sum, product) => {
        const price = parseFloat(product.actual_price) || 0;
        const sold = parseInt(product.sold) || 0;
        return sum + (price * sold);
      }, 0);

      const avgRating = await fetchAverageRating(shopId, shopTokenFromProducts);

      const shopData = {
        id: parseInt(shopId),
        name: sourceData?.name || sourceData?.username || firstProduct?.name || 'Unknown Seller',
        username: sourceData?.username || sourceData?.name || firstProduct?.username || 'unknown',
        email: sourceData?.email || firstProduct?.email || '',
        phone: sourceData?.phone_number || sourceData?.phone || firstProduct?.phone_number || '',
        location: sourceData?.address || sourceData?.user_location || sourceData?.location || 
                sourceData?.shop_address || sourceData?.business_location || 
                firstProduct?.location || 'Unknown Location',
        description: sourceData?.bio || sourceData?.description || sourceData?.about || 
                    firstProduct?.bio || 'No description available',
        isVerified: verifiedShopData?.verify_status === "1" || verifiedShopData?.badge_status === "1" || 
                  sourceData?.verify_status === "1" || sourceData?.badge_status === "1" || false,
        createdAt: sourceData?.created_at || firstProduct?.created_at || new Date().toISOString(),
        profilePicture: profilePicture,
        coverImage: bannerUrl,
        totalProducts: userProducts.length,
        rating: avgRating || verifiedShopData?.avg_rating || sourceData?.avg_rating || firstProduct?.avg_rating || 0,
        followers: sourceData?.followers || verifiedShopData?.followers || 0,
        following: sourceData?.following || verifiedShopData?.following || 0,
        website: sourceData?.website || verifiedShopData?.website,
        shopToken: shopTokenFromProducts || verifiedShopData?.shop_token || sourceData?.shop_token,
        socialMedia: {
          facebook: sourceData?.facebook || verifiedShopData?.facebook,
          twitter: sourceData?.twitter || verifiedShopData?.twitter,
          instagram: sourceData?.instagram || verifiedShopData?.instagram
        }
      };

      console.log('Final shop data created:', shopData);
      setShop(shopData);

      setStats({
        totalSales,
        totalEarnings,
        activeProducts: userProducts.length
      });

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
        } catch (error) {
          console.log('Image parsing error:', error);
        }

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
          sold: item.sold || "0",
          avg_rating: item.avg_rating || "0",
          ask_for_price: item.ask_for_price || false,
          actual_price: item.actual_price,
          promo_price: item.promo_price,
          category: item.category,
          shop_token: item.shop_token
        };
      });

      setProducts(transformedProducts);

      await fetchShopReviews(shopId, shopTokenFromProducts, transformedProducts);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to load shop');
    } finally {
      setLoading(false);
    }
  }, [slug, currentUser, fetchShopReviews, fetchAverageRating]);

  // Refresh reviews function
  const refreshReviews = () => {
    if (shop && shop.shopToken) {
      fetchShopReviews(shop.id.toString(), shop.shopToken, products);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchShopData();
    }
  }, [slug, fetchShopData]);

  // Event handlers
  const handleBack = () => navigate(-1);
  const handleGoHome = () => navigate('/');
  const handleProductClick = (productId) => navigate(`/products/${productId}`);
  const handleContactSeller = () => {
    if (shop?.phone) window.open(`tel:${shop.phone}`, '_blank');
    else if (shop?.email) window.open(`mailto:${shop.email}`, '_blank');
    else toast?.info('Contact information not available');
  };
  const handleAddProduct = () => navigate('/start-selling');
  const handleShareProduct = (product) => {
    const shareUrl = window.location.origin + `/products/${product.id}`;
    if (navigator.share) {
      navigator.share({ title: product.title, text: product.description, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast?.success('Link copied to clipboard!');
    }
  };
  const handleEditProduct = (product) => toast?.info(`Edit product: ${product.title}`);
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      toast?.info(`Deleted product ID: ${productId}`);
    }
  };
  const handleBoostProduct = (product) => toast?.info(`Boost product: ${product.title}`);

  // Loading state
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

  // Error state
  if (error || !shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaStore size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Shop Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Shop could not be found'}</p>
          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 rounded-lg"
            >
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 rounded-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <FaArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
              </button>
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <FaHome size={18} />
                <span className="text-sm font-medium">Home</span>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {shop.username}'s Shop
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Banner Section */}
          <div className="h-32 md:h-48 lg:h-56 relative border-b border-gray-300">
            {shop.coverImage && shop.coverImage !== '' && !bannerError ? (
              <>
                <img 
                  src={shop.coverImage} 
                  alt="Shop Banner" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  onError={() => setBannerError(true)}
                  onLoad={() => console.log('Banner loaded successfully')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                {isOwnShop && (
                  
                )}
              </>
            ) : (
              <div className="w-full h-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500"></div>
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white p-4">
                  <FaStore className="text-3xl md:text-4xl mx-auto mb-2" />
                  <p className="text-sm md:text-base opacity-90 font-medium">
                    {shop.username}
                  </p>
                  <p className="text-xs md:text-sm opacity-60 mt-1">
                    {shop.isVerified ? 'Verified Seller' : 'Seller'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:-mt-16 mb-4">
              {/* Profile Picture */}
              <div className="relative -mt-12 md:-mt-0 mx-auto md:mx-0">
                {shop.profilePicture && shop.profilePicture !== '' && !profileError ? (
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                    <img
                      src={shop.profilePicture}
                      alt="Profile"
                      className="object-cover w-full h-full"
                      onError={() => setProfileError(true)}
                      onLoad={() => console.log('Profile loaded successfully')}
                    />
                    {isOwnShop && (
                      <button className="absolute bottom-1 right-1 bg-black border-2 border-white p-1 md:p-2 rounded-full hover:bg-gray-800 transition-all">
                        <FaCamera size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white flex items-center justify-center text-white text-xl md:text-3xl font-bold shadow-lg">
                    {getInitials(shop.name || shop.username || shop.email)}
                    {isOwnShop && (
                     
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Buttons - Removed Add Product button for visitors */}
              <div className="mt-4 md:mt-0 md:ml-auto md:mb-2 flex flex-col sm:flex-row gap-2 justify-center md:justify-end">
                {isOwnShop && !shop.isVerified && (
                  <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold flex items-center gap-2 animate-pulse shadow-lg">
                    <FaCheckCircle size={16} />
                    <span>Get Verified</span>
                  </button>
                )}
                {/* Only show Contact Seller for visitors, Add Product only for shop owner */}
                {!isOwnShop && (
                  <button 
                    onClick={handleContactSeller}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all"
                  >
                    <FaPhone size={14} />
                    <span>Contact Seller</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowReviews(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-all"
                >
                  <FaStar size={14} />
                  <span>Reviews ({totalReviews})</span>
                </button>
              </div>
            </div>

            {/* Shop Details - Rest remains the same */}
            <div className="mt-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">{shop.username}</h1>
                {shop.isVerified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <FaCheckCircle size={12} />
                    Verified Seller
                  </span>
                )}
              </div>
              
              {shop.email && (
                <p className="text-gray-600 mb-3 text-sm md:text-base">{shop.email}</p>
              )}
              
              {/* Stats Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-500" />
                    <span className="font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
                </div>
                
                <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
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
              
              {/* Mobile contact info */}
              <div className="md:hidden flex flex-wrap gap-3 text-xs text-gray-600 mb-3 justify-center">
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
              </div>

              {/* Social Media Links */}
              {(shop.website || shop.socialMedia?.facebook || shop.socialMedia?.twitter || shop.socialMedia?.instagram) && (
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  {shop.website && (
                    <a href={shop.website.startsWith('http') ? shop.website : `https://${shop.website}`} 
                       target="_blank" rel="noopener noreferrer"
                       className="text-blue-500 hover:text-blue-600">
                      <FaGlobe size={16} />
                    </a>
                  )}
                  {shop.socialMedia?.facebook && (
                    <a href={shop.socialMedia.facebook} target="_blank" rel="noopener noreferrer"
                       className="text-blue-600 hover:text-blue-700">
                      <span className="text-sm">FB</span>
                    </a>
                  )}
                  {shop.socialMedia?.twitter && (
                    <a href={shop.socialMedia.twitter} target="_blank" rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-500">
                      <span className="text-sm">TW</span>
                    </a>
                  )}
                  {shop.socialMedia?.instagram && (
                    <a href={shop.socialMedia.instagram} target="_blank" rel="noopener noreferrer"
                       className="text-pink-500 hover:text-pink-600">
                      <span className="text-sm">IG</span>
                    </a>
                  )}
                </div>
              )}

              {shop.description && shop.description !== 'No description available' && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">About</h3>
                  <p className="text-gray-600 text-sm md:text-base">{shop.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Products ({products.length})
              </h2>
              {products.length > 0 && (
                <button 
                  onClick={() => setShowReviews(true)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <FaStar size={14} />
                  View Reviews
                </button>
              )}
            </div>
            
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow relative group"
                  >
                    {/* Dropdown Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                                <FaShare className="mr-3 text-blue-500" size={14} />
                                Share
                              </button>
                              
                              {isOwnShop && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleEditProduct(product);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FaEdit className="mr-3 text-green-500" size={14} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleBoostProduct(product);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <FaRocket className="mr-3 text-purple-500" size={14} />
                                    Boost
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={() => {
                                      handleDeleteProduct(product.id);
                                      setActiveDropdown(null);
                                    }}
                                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <FaTrash className="mr-3" size={14} />
                                    Delete
                                  </button>
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Product Image */}
                    <div 
                      className="bg-gray-100 h-40 md:h-48 rounded-lg mb-3 flex items-center justify-center overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {product.image && !product.image.includes('placeholder.com') ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="object-cover h-full w-full hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      ) : (
                        <FaStore className="text-gray-400 text-2xl" />
                      )}
                    </div>
                    
                    <h4 
                      className="font-semibold text-gray-800 mb-2 cursor-pointer hover:text-blue-600"
                      onClick={() => handleProductClick(product.id)}
                    >
                      {product.title}
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-red-600">{product.price}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.condition === 'new' 
                          ? 'bg-green-100 text-green-800' 
                          : product.condition === 'fairly_used'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {product.condition === 'fairly_used' ? 'Fairly Used' : 
                         product.condition === 'new' ? 'New' : 'Used'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{product.location}</p>
                    {product.avg_rating && product.avg_rating !== '0' && (
                      <div className="flex items-center gap-1 mt-2">
                        <FaStar className="text-yellow-500 text-sm" />
                        <span className="text-sm text-gray-600">{product.avg_rating}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaStore className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No products listed yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {isOwnShop 
                      ? 'Start selling by listing your first product' 
                      : 'This shop hasn\'t listed any products yet.'}
                  </p>
                </div>
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
