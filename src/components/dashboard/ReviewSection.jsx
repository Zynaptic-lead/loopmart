import React, { useState, useEffect } from 'react';
import { FaStar, FaRegStar, FaMapMarkerAlt, FaCalendarAlt, FaBox, FaUser } from 'react-icons/fa';
import ApiService from '../../services/api';
import { userService } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';

// Helper for profile image URL
const getProfileImageUrl = (photoFilename) => {
  if (!photoFilename) return null;
  if (photoFilename.startsWith('http')) return photoFilename;
  if (photoFilename.startsWith('/uploads')) return `https://loopmart.ng${photoFilename}`;
  return `https://loopmart.ng/uploads/users/${photoFilename}`;
};

export default function ReviewSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState([
    { stars: 5, count: 0, percentage: 0 },
    { stars: 4, count: 0, percentage: 0 },
    { stars: 3, count: 0, percentage: 0 },
    { stars: 2, count: 0, percentage: 0 },
    { stars: 1, count: 0, percentage: 0 }
  ]);
  
  const [userStats, setUserStats] = useState({
    name: "Loading...",
    profession: "Loading...",
    location: "Loading...",
    memberSince: "Loading...",
    listedProducts: "0",
    reviews: 0
  });

  const toast = useToast();

  // Function to get user data from localStorage
  const getUserDataFromStorage = () => {
    try {
      const userDataString = localStorage.getItem('loopmart_user');
      const token = localStorage.getItem('loopmart_token');
      
      if (!userDataString || !token) {
        return null;
      }
      
      const userData = JSON.parse(userDataString);
      
      return {
        userId: userData.id,
        token: token,
        name: userData.name || userData.username,
        email: userData.email,
        shop_token: userData.shop_token,
        location: userData.business_location || userData.address || userData.user_location,
        memberSince: userData.created_at,
        photo_url: userData.photo_url,
        bio: userData.bio || userData.about || userData.description
      };
    } catch (e) {
      console.error('Error parsing user data:', e);
      return null;
    }
  };

  // Calculate rating distribution
  const calculateRatingDistribution = (reviewsList) => {
    const distribution = [0, 0, 0, 0, 0];
    
    reviewsList.forEach(review => {
      const rating = Math.min(Math.max(Math.round(review.rating), 1), 5);
      if (rating === 5) distribution[0]++;
      else if (rating === 4) distribution[1]++;
      else if (rating === 3) distribution[2]++;
      else if (rating === 2) distribution[3]++;
      else if (rating === 1) distribution[4]++;
    });

    const totalReviews = reviewsList.length;
    const newDistribution = distribution.map((count, index) => ({
      stars: 5 - index,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
    }));

    setRatingDistribution(newDistribution);
  };

  // Render stars based on rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          index < fullStars ? (
            <FaStar key={index} className="text-yellow-400 text-lg" />
          ) : (
            <FaRegStar key={index} className="text-gray-300 text-lg" />
          )
        ))}
        <span className="ml-2 text-gray-700 font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Function to get profile picture URL
  const getProfilePictureUrl = () => {
    if (userProfile?.photo_url) {
      return getProfileImageUrl(userProfile.photo_url);
    }
    
    const localData = getUserDataFromStorage();
    if (localData?.photo_url) {
      return getProfileImageUrl(localData.photo_url);
    }
    
    return null;
  };

  // Fetch all data in parallel
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = getUserDataFromStorage();
      
      if (!userData) {
        setError('Please login to view reviews');
        setLoading(false);
        return;
      }

      const { userId, token, shop_token } = userData;

      // Fetch all data in parallel
      const [profileResponse, productsResponse, avgRatingResponse, reviewsResponse] = await Promise.allSettled([
        ApiService.get('/api/v1/user').catch(err => ({ status: 'rejected', reason: err })),
        ApiService.get('/api/v1/user/products').catch(err => ({ status: 'rejected', reason: err })),
        ApiService.get(`/api/v1/user/avg-rating?userId=${userId}`).catch(err => ({ status: 'rejected', reason: err })),
        ApiService.get(`/api/v1/user/review?user_id=${userId}${shop_token ? `&shop_token=${shop_token}` : ''}`).catch(err => ({ status: 'rejected', reason: err }))
      ]);

      // Process profile data
      if (profileResponse.status === 'fulfilled' && profileResponse.value?.data) {
        const profileData = profileResponse.value.data;
        const userDataFromApi = profileData.user || profileData;
        
        setUserProfile(userDataFromApi);
        
        setUserStats(prev => ({
          ...prev,
          name: userDataFromApi.name || userDataFromApi.username || 'Unknown',
          profession: userDataFromApi.bio || 'Not specified',
          location: userDataFromApi.business_location || userDataFromApi.address || 'Not specified',
          memberSince: userDataFromApi.created_at ? new Date(userDataFromApi.created_at).getFullYear().toString() : 'Unknown'
        }));
      } else {
        // Fallback to localStorage
        setUserStats(prev => ({
          ...prev,
          name: userData.name || 'Unknown',
          profession: userData.bio || 'Not specified',
          location: userData.location || 'Not specified',
          memberSince: userData.memberSince ? new Date(userData.memberSince).getFullYear().toString() : 'Unknown'
        }));
      }

      // Process products data
      if (productsResponse.status === 'fulfilled' && productsResponse.value) {
        let productsData = [];
        if (productsResponse.value.data?.data) {
          productsData = productsResponse.value.data.data;
        } else if (Array.isArray(productsResponse.value.data)) {
          productsData = productsResponse.value.data;
        } else if (Array.isArray(productsResponse.value)) {
          productsData = productsResponse.value;
        }
        
        if (Array.isArray(productsData)) {
          setUserStats(prev => ({
            ...prev,
            listedProducts: productsData.length.toString()
          }));
        }
      }

      // Process average rating
      if (avgRatingResponse.status === 'fulfilled' && avgRatingResponse.value?.data) {
        const avgData = avgRatingResponse.value.data;
        const avgRatingValue = parseFloat(avgData.avg_rating || avgData.average_rating || avgData.avg || 0);
        setAverageRating(avgRatingValue);
      }

      // Process reviews - FIXED: Handle the API response structure correctly
      if (reviewsResponse.status === 'fulfilled' && reviewsResponse.value) {
        const responseData = reviewsResponse.value;
        console.log('Reviews API Response:', responseData);
        
        let formattedReviews = [];
        
        // Handle different response structures
        if (responseData.status === true && responseData.productReviews) {
          // Structure from your API: { status: true, productReviews: [...] }
          responseData.productReviews.forEach(product => {
            if (product.reviews && Array.isArray(product.reviews)) {
              product.reviews.forEach(review => {
                formattedReviews.push({
                  id: review.id || Date.now(),
                  rating: parseInt(review.rate) || 3,
                  comment: review.comment || 'No comment provided',
                  created_at: review.created_at || new Date().toISOString(),
                  reviewer_name: review.user?.name || 'Anonymous',
                  reviewer_image: review.user?.photo_url,
                  product_name: product.title || 'Product',
                  product_id: product.id
                });
              });
            }
          });
        } else if (responseData.data && Array.isArray(responseData.data)) {
          formattedReviews = responseData.data.map(review => ({
            id: review.id,
            rating: review.rating || review.rate || 3,
            comment: review.comment || '',
            created_at: review.created_at,
            reviewer_name: review.reviewer_name || review.user_name,
            reviewer_image: review.reviewer_image,
            product_name: review.product_name
          }));
        } else if (Array.isArray(responseData)) {
          formattedReviews = responseData.map(review => ({
            id: review.id,
            rating: review.rating || review.rate || 3,
            comment: review.comment || '',
            created_at: review.created_at,
            reviewer_name: review.reviewer_name,
            reviewer_image: review.reviewer_image,
            product_name: review.product_name
          }));
        }

        console.log('Formatted reviews:', formattedReviews);
        setReviews(formattedReviews);
        setUserStats(prev => ({
          ...prev,
          reviews: formattedReviews.length
        }));

        calculateRatingDistribution(formattedReviews);
        
        // Calculate average from reviews if not from API
        if (formattedReviews.length > 0 && averageRating === 0) {
          const sum = formattedReviews.reduce((acc, review) => acc + review.rating, 0);
          const avg = sum / formattedReviews.length;
          setAverageRating(avg);
        }
      } else {
        console.log('No reviews found or failed to fetch');
        setReviews([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      toast?.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    const handleStorageChange = () => {
      fetchAllData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  const profilePictureUrl = getProfilePictureUrl();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">Reviews</h1>
        <p className="text-gray-600">Manage and view your customer feedback</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FaStar className="h-5 w-5 text-red-500 mr-2" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAllData}
            className="mt-2 text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Profile */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                {profilePictureUrl ? (
                  <img 
                    src={profilePictureUrl}
                    alt={userStats.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallbackDiv = document.getElementById('profile-fallback');
                      if (fallbackDiv) fallbackDiv.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  id="profile-fallback"
                  className={`w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold ${profilePictureUrl ? 'hidden' : 'flex'}`}
                >
                  {userStats.name.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{userStats.name}</h2>
              <p className="text-gray-600">{userStats.profession}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <FaMapMarkerAlt className="text-gray-400 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium text-gray-900">{userStats.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-gray-400 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Member since</p>
                  <p className="font-medium text-gray-900">{userStats.memberSince}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaBox className="text-gray-400 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Listed products</p>
                  <p className="font-medium text-gray-900">{userStats.listedProducts}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FaUser className="text-gray-400 text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Reviews</p>
                  <p className="font-medium text-gray-900">{userStats.reviews}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Reviews & Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reviews Overview Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Reviews Overview</h3>
              <button
                onClick={fetchAllData}
                className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
              >
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Total Reviews</h4>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {reviews.length === 0 ? 'No reviews yet' : `${reviews.length} total`}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Average Rating</h4>
                {averageRating > 0 ? (
                  <>
                    <div className="flex justify-center mb-1">
                      {renderStars(averageRating)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaRegStar key={star} className="text-gray-300 text-lg" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">No ratings yet</p>
                  </>
                )}
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Response Rate</h4>
                <p className="text-2xl font-bold text-green-500">100%</p>
                <p className="text-xs text-gray-500 mt-1">You reply to all reviews</p>
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Rating Distribution</h4>
                
                <div className="space-y-3">
                  {ratingDistribution.map((rating) => (
                    <div key={rating.stars} className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-sm font-medium text-gray-600">{rating.stars}</span>
                        <FaStar className="text-yellow-400 text-sm" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${rating.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{rating.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Reviews</h3>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                        </div>
                        <h4 className="font-medium text-gray-900">{review.product_name}</h4>
                        <p className="text-gray-700 mt-2">{review.comment}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm font-medium text-gray-900">{review.reviewer_name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : !error && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FaRegStar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No reviews yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven't received any reviews yet. Reviews will appear here once customers rate your products.
              </p>
            </div>
          )}

          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-700">
              ⚡ Responding to reviews helps build trust with potential customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
