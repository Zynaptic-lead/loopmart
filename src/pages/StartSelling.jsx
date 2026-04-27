// src/pages/StartSelling.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Store, Shield, Users, TrendingUp, ArrowRight, Loader, ImageIcon } from 'lucide-react';
import logo from '../assets/logo.png';
import { useToast } from '../contexts/ToastContext';
import { userService } from '../services/userService';
import ApiService from '../services/api';

export default function StartSelling() {
  const navigate = useNavigate();
  const { hasSubscription, loading: subLoading, checkSubscription } = useSubscription();
  const [checking, setChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    actual_price: '',
    condition: '',
    description: '',
    location: '',
    quantity: '1',
    ask_for_price: '0',
    promo_price: '',
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    { id: "1", name: "Gadgets" },
    { id: "2", name: "Vehicles" },
    { id: "3", name: "Houses" },
    { id: "4", name: "Fashion" },
    { id: "5", name: "Jobs" },
    { id: "6", name: "Cosmetics" },
    { id: "7", name: "Fruits" },
    { id: "8", name: "Kitchen Utensils" },
    { id: "9", name: "Others" }
  ];

  const conditions = [
    { value: "new", label: "New" },
    { value: "fairly_used", label: "Fairly Used" },
    { value: "used", label: "Used" }
  ];

  // Check subscription on mount - Use the context's checkSubscription
  useEffect(() => {
    const verifySubscription = async () => {
      setChecking(true);
      try {
        // First, check if user is logged in
        const token = userService.getToken();
        if (!token) {
          console.log('No token found, redirecting to login');
          toast?.error('Please login to continue');
          navigate('/login');
          return;
        }

        // Check subscription status using context
        console.log('Verifying subscription status...');
        const isActive = await checkSubscription();
        console.log('Subscription active status:', isActive);
        
        if (!isActive) {
          console.log('No active subscription, redirecting to pricing');
          toast?.error('Active subscription required to list products');
          navigate('/pricing');
          return;
        }
        
        console.log('Active subscription confirmed!');
      } catch (error) {
        console.error('Error checking subscription:', error);
        toast?.error('Unable to verify subscription. Please try again.');
        navigate('/pricing');
      } finally {
        setChecking(false);
      }
    };
    
    verifySubscription();
  }, []); // Empty dependency array - run once on mount

  // Also check when hasSubscription changes (in case it updates after initial check)
  useEffect(() => {
    if (!checking && !subLoading) {
      console.log('Subscription state changed:', { hasSubscription, checking, subLoading });
      if (!hasSubscription) {
        console.log('No subscription detected, redirecting to pricing');
        navigate('/pricing');
      }
    }
  }, [hasSubscription, checking, subLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + formData.images.length > 5) {
      toast?.warning('You can only upload up to 5 images');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast?.error(`${file.name} is too large. Max size is 10MB`);
        return false;
      }
      return true;
    });

    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
    
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Double-check subscription before submitting
    const isActive = await checkSubscription();
    if (!isActive) {
      toast?.error('Your subscription has expired. Please renew to continue.');
      navigate('/pricing');
      return;
    }
    
    // Validate form
    if (!formData.title.trim()) {
      toast?.error('Please enter product title');
      return;
    }
    if (!formData.category_id) {
      toast?.error('Please select a category');
      return;
    }
    if (!formData.actual_price && formData.ask_for_price === '0') {
      toast?.error('Please enter price');
      return;
    }
    if (!formData.condition) {
      toast?.error('Please select condition');
      return;
    }
    if (!formData.description.trim()) {
      toast?.error('Please enter description');
      return;
    }
    if (!formData.location.trim()) {
      toast?.error('Please enter location');
      return;
    }
    if (formData.images.length === 0) {
      toast?.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      const user = userService.getUser();
      const token = userService.getToken();
      
      if (!token) {
        toast?.error('Please login again');
        navigate('/login');
        return;
      }
      
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('quantity', formData.quantity || '1');
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('ask_for_price', formData.ask_for_price);
      
      if (user) {
        formDataToSend.append('user_id', user.id);
        formDataToSend.append('username', user.username || user.name || '');
      }
      
      if (formData.ask_for_price === '0') {
        formDataToSend.append('actual_price', formData.actual_price);
      }
      
      if (formData.promo_price) {
        formDataToSend.append('promo_price', formData.promo_price);
      }
      
      formData.images.forEach((image) => {
        formDataToSend.append('image_url', image);
      });

      console.log('Submitting product...');
      
      const response = await ApiService.post('/api/v1/product', formDataToSend, true);
      
      if (response.status) {
        toast?.success('Product listed successfully!');
        // Reset form
        setFormData({
          title: '',
          category_id: '',
          actual_price: '',
          condition: '',
          description: '',
          location: '',
          quantity: '1',
          ask_for_price: '0',
          promo_price: '',
          images: []
        });
        setImagePreviews([]);
        navigate('/selling-success');
      } else {
        throw new Error(response.message || 'Failed to list product');
      }
    } catch (error) {
      console.error('Error listing product:', error);
      toast?.error(error.message || 'Failed to list product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (checking || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-12 h-12 text-yellow-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  // If no subscription, show message instead of redirecting immediately
  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-lg p-8">
          <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Subscription Required</h2>
          <p className="text-gray-600 mb-6">
            You need an active subscription to list products. Please subscribe to a plan to continue.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
          >
            View Pricing Plans
          </button>
        </div>
      </div>
    );
  }

  // User has subscription - show the selling form
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Loopmart" className="h-8 sm:h-10 w-auto" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Start Selling</h1>
            </div>
            <div className="bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2">
              <Shield size={14} className="sm:size-4" />
              <span>Active Subscription</span>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Product Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    placeholder="e.g., iPhone 12 Pro Max"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition *
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select Condition</option>
                    {conditions.map(cond => (
                      <option key={cond.value} value={cond.value}>{cond.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    placeholder="Describe your product in detail..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    name="actual_price"
                    value={formData.actual_price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    placeholder="e.g., 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promo Price (Optional)
                  </label>
                  <input
                    type="number"
                    name="promo_price"
                    value={formData.promo_price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    placeholder="e.g., 45000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none"
                    placeholder="e.g., Lagos, Nigeria"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ask for Price?
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="ask_for_price"
                        value="0"
                        checked={formData.ask_for_price === '0'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No, show price</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="ask_for_price"
                        value="1"
                        checked={formData.ask_for_price === '1'}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-yellow-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes, contact for price</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Images * (Max 5 images, 10MB each)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="imageUpload"
                      onChange={handleImageUpload}
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-medium text-sm sm:text-base"
                    >
                      <ImageIcon size={18} className="sm:size-5" />
                      Click to upload images
                    </label>
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">
                      PNG, JPG, GIF up to 10MB each
                    </p>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-16 sm:h-20 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Listing Product...
                </>
              ) : (
                <>
                  <Store size={18} />
                  List Product
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">10k+ Buyers</p>
                <p className="text-xs text-gray-500">Daily active users</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">3x Visibility</p>
                <p className="text-xs text-gray-500">Priority placement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm sm:text-base">Verified Badge</p>
                <p className="text-xs text-gray-500">Build trust</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
