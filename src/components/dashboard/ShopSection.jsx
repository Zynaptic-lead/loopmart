// ShopSection.jsx - CORRECTED WITH BADGE API INTEGRATION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, FaTimesCircle, FaCheck, FaTimes, 
  FaStore, FaPhone, FaMapMarkerAlt, FaSave, FaPlus,
  FaShare, FaEdit, FaRocket, FaTrash, FaEllipsisV,
  FaDollarSign, FaTag, FaCopy, FaLink, FaCamera,
  FaUpload, FaImage, FaStar, FaShieldAlt, FaCrown
} from 'react-icons/fa';
import { userService } from '../../services/userService';
import ApiService from '../../services/api';
import { getInitials } from '../../utils/helpers';
import VerificationModal from './VerificationModal';

const CATEGORIES = [
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

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "fairly_used", label: "Fairly Used" },
  { value: "used", label: "Used" }
];

const NIGERIAN_STATES = [
  "Lagos", "Abuja", "Rivers", "Delta", "Oyo", "Kano", "Kaduna", "Edo", "Ogun", "Enugu",
  "Anambra", "Abia", "Imo", "Plateau", "Sokoto", "Bornu", "Bauchi", "Akwa Ibom", "Bayelsa", "Cross River"
];

// Helper functions for image URLs
const getProfileUrl = (photoFilename) => {
  if (!photoFilename) return null;
  if (photoFilename.startsWith('http')) return photoFilename;
  return `https://loopmart.ng/uploads/users/${photoFilename}`;
};

const getBannerUrl = (bannerFilename) => {
  if (!bannerFilename) return null;
  if (bannerFilename.startsWith('http')) return bannerFilename;
  return `https://loopmart.ng/uploads/users/${bannerFilename}`;
};

const getProductImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `https://loopmart.ng/uploads/products/${imagePath}`;
};

// Share Modal Component
const ShareModal = ({ isOpen, onClose, productId, productTitle }) => {
  const [copied, setCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [productLink, setProductLink] = useState('');
  const [error, setError] = useState('');

  const generateShareLink = async () => {
    try {
      setGeneratingLink(true);
      setError('');
      
      console.log(`Generating share link for product ID: ${productId}`);
      
      const response = await ApiService.get(`/api/v1/product/link?productId=${productId}`);
      console.log('Share link API response:', response);
      
      let shareUrl = '';
      if (response.status && response.data) {
        shareUrl = response.data.url || response.data.link || `https://loopmart.ng/product/${productId}`;
      } else if (response.url) {
        shareUrl = response.url;
      } else if (response.link) {
        shareUrl = response.link;
      } else {
        shareUrl = `https://loopmart.ng/product/${productId}`;
      }
      
      if (!shareUrl.startsWith('http')) {
        shareUrl = `https://loopmart.ng${shareUrl.startsWith('/') ? shareUrl : `/${shareUrl}`}`;
      }
      
      console.log('Generated share URL:', shareUrl);
      setProductLink(shareUrl);
    } catch (error) {
      console.error('Error generating share link:', error);
      const fallbackUrl = `https://loopmart.ng/product/${productId}`;
      setProductLink(fallbackUrl);
      setError('Failed to generate special link. Using default product URL.');
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (!productLink) {
      await generateShareLink();
    }
    
    try {
      await navigator.clipboard.writeText(productLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      const textArea = document.createElement('textarea');
      textArea.value = productLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!productLink) {
      await generateShareLink();
    }
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: `Check out "${productTitle}" on LoopMart`,
          url: productLink,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateShareLink();
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Share Product</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product: <span className="font-semibold">{productTitle}</span>
              </label>
              
              {error && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  {error}
                </div>
              )}
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <FaLink className="text-gray-400 mr-2" size={14} />
                  <input
                    type="text"
                    value={generatingLink ? 'Generating link...' : productLink}
                    readOnly
                    className="flex-1 bg-transparent outline-none text-sm truncate"
                    placeholder={generatingLink ? 'Generating link...' : 'Click Generate Link'}
                  />
                </div>
                <button
                  onClick={generateShareLink}
                  disabled={generatingLink}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {generatingLink ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaLink size={14} />
                      Generate Link
                    </>
                  )}
                </button>
              </div>
            </div>

            {productLink && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaCopy size={14} />
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <FaShare size={14} />
                  Share
                </button>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
            
            {productLink && (
              <div className="text-xs text-gray-500 mt-2">
                <p>This link will open the product page when shared.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Product Dropdown Component
const ProductDropdown = ({ product, onEdit, onDelete, onShare, onBoost, isMobile = false }) => {
  const [isOpen, setIsOpen] = useState(isMobile);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action) => {
    setIsOpen(false);
    switch (action) {
      case 'share':
        onShare(product);
        break;
      case 'edit':
        onEdit(product);
        break;
      case 'boost':
        onBoost(product);
        break;
      case 'delete':
        onDelete(product.product_id);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Product options"
      >
        <FaEllipsisV className="text-gray-500" size={16} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1"
          >
            <button
              onClick={() => handleAction('share')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaShare className="mr-3 text-blue-500" size={14} />
              Share
            </button>
            
            <button
              onClick={() => handleAction('edit')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaEdit className="mr-3 text-green-500" size={14} />
              Edit
            </button>
            
            <button
              onClick={() => handleAction('boost')}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaRocket className="mr-3 text-purple-500" size={14} />
              Boost
            </button>
            
            <div className="border-t border-gray-200 my-1"></div>
            
            <button
              onClick={() => handleAction('delete')}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <FaTrash className="mr-3" size={14} />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Edit Product Modal Component
const EditProductModal = ({ product, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    actual_price: '',
    promo_price: '',
    location: '',
    quantity: '1',
    ask_for_price: false,
    images: [],
    existing_images: []
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        title: product.title,
        description: product.description,
        category: product.category_id || '',
        condition: product.condition,
        actual_price: product.actual_price || '',
        promo_price: product.promo_price || '',
        location: product.location,
        quantity: product.quantity,
        ask_for_price: product.ask_for_price,
        images: [],
        existing_images: product.image ? [product.image] : []
      });
    }
  }, [product, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5 - formData.images.length);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index, type) => {
    if (type === 'existing') {
      setFormData(prev => ({
        ...prev,
        existing_images: prev.existing_images.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    if (!product) return;
    
    setIsSubmitting(true);
    try {
      await onSave(product.product_id, formData);
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(2);
  const prevStep = () => setCurrentStep(1);

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Edit Product</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-4 md:p-6 overflow-y-auto max-h-[70vh]">
            <div className="flex justify-center mb-6">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 1 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-8 md:w-16 h-1 ${currentStep === 2 ? 'bg-yellow-500' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === 2 ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4 md:space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm md:text-base"
                    placeholder="Enter product title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm md:text-base"
                  >
                    <option value="">Select location</option>
                    {NIGERIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    min="1"
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition resize-none text-sm md:text-base"
                    placeholder="Describe your product"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm md:text-base"
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm md:text-base"
                    >
                      <option value="">Select condition</option>
                      {CONDITIONS.map(condition => (
                        <option key={condition.value} value={condition.value}>{condition.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={nextStep}
                    className="bg-yellow-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold text-sm md:text-base"
                  >
                    Continue to Pricing & Images
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="flex items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm md:text-base">Ask for Price</h3>
                    <p className="text-xs md:text-sm text-gray-600">Let buyers contact you for pricing</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ask_for_price}
                      onChange={(e) => handleInputChange('ask_for_price', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-10 md:w-12 h-5 md:h-6 bg-gray-300 peer-focus:outline-none rounded-full peer transition-all duration-300 peer-checked:bg-yellow-500">
                      <div className={`absolute top-0.5 md:top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                        formData.ask_for_price ? 'translate-x-5 md:translate-x-7' : 'translate-x-0.5 md:translate-x-1'
                      }`} />
                    </div>
                  </label>
                </div>

                {!formData.ask_for_price && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Price (₦) *
                      </label>
                      <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="number"
                          value={formData.actual_price}
                          onChange={(e) => handleInputChange('actual_price', e.target.value)}
                          className="w-full pl-9 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm md:text-base"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Promo Price (₦)
                      </label>
                      <div className="relative">
                        <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <input
                          type="number"
                          value={formData.promo_price}
                          onChange={(e) => handleInputChange('promo_price', e.target.value)}
                          className="w-full pl-9 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition text-sm md:text-base"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Upload Images (You can upload multiple images)
                  </label>
                  
                  {formData.existing_images.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Current Images:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {formData.existing_images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-20 md:h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index, 'existing')}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`New ${index + 1}`}
                          className="w-full h-20 md:h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index, 'new')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 5 && (
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="w-full h-20 md:h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                      >
                        <FaUpload size={20} />
                        <span className="text-xs mt-1">Upload Image</span>
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={prevStep}
                    className="px-4 md:px-6 py-2 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave size={14} />
                        Update Product
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Success Modal Component
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-md p-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FaCheckCircle className="text-green-500 text-2xl" />
          </motion.div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
          >
            Continue
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Image Options Modal Component
const ImageOptionsModal = ({ isOpen, onClose, onTakePhoto, onUploadPhoto, onRemovePhoto, hasImage, title }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onTakePhoto}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 font-semibold flex items-center justify-center space-x-2"
            >
              <FaCamera /><span>Take Photo</span>
            </button>
            
            <button
              onClick={onUploadPhoto}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-semibold flex items-center justify-center space-x-2"
            >
              <FaCamera /><span>Upload Photo</span>
            </button>

            {hasImage && (
              <button
                onClick={onRemovePhoto}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-semibold flex items-center justify-center space-x-2"
              >
                <FaTrash /><span>Remove Photo</span>
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Camera Capture Modal Component
const CameraCaptureModal = ({ isOpen, onClose, onCapture, title, isCapturing }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <FaTimes />
            </button>
          </div>
          
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-96 object-contain" 
            />
          </div>
          
          <div className="flex justify-center space-x-4 mt-4">
            <button 
              onClick={onCapture}
              disabled={isCapturing}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 font-semibold flex items-center space-x-2 disabled:opacity-50"
            >
              <FaCheck /><span>{isCapturing ? 'Capturing...' : 'Capture'}</span>
            </button>
            <button 
              onClick={onClose}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function ShopSection() {
  const navigate = useNavigate();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ 
    show: false, 
    productId: null, 
    productTitle: '' 
  });
  const [editModal, setEditModal] = useState({ 
    show: false, 
    product: null 
  });
  const [shareModal, setShareModal] = useState({ 
    show: false, 
    product: null 
  });
  const [successModal, setSuccessModal] = useState({ 
    show: false, 
    message: '' 
  });
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [currentImageType, setCurrentImageType] = useState('banner');
  const [badgeStatus, setBadgeStatus] = useState({ isVerified: false, badgeType: null, expiryDate: null });
  const [checkingBadge, setCheckingBadge] = useState(true);
  
  const fileInputRef = useRef(null);

  // Check mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch badge status from API
  const fetchBadgeStatus = useCallback(async () => {
    try {
      setCheckingBadge(true);
      console.log('Fetching badge status from /api/v1/user/badge');
      
      const response = await ApiService.get('/api/v1/user/badge');
      console.log('Badge API Response:', response);
      
      // Check if badge is active based on API response
      // According to the API doc: status true means badge is active, false means expired or no badge
      if (response && response.status === true) {
        setBadgeStatus({
          isVerified: true,
          badgeType: response.badge?.badge_type || response.badge_type || 'verified',
          expiryDate: response.badge?.expires_at || response.expires_at,
          message: response.message || 'Badge Active'
        });
      } else {
        setBadgeStatus({
          isVerified: false,
          badgeType: null,
          expiryDate: null,
          message: response?.message || 'No active badge'
        });
      }
    } catch (error) {
      console.error('Error fetching badge status:', error);
      setBadgeStatus({
        isVerified: false,
        badgeType: null,
        expiryDate: null,
        message: 'Failed to fetch badge status'
      });
    } finally {
      setCheckingBadge(false);
    }
  }, []);

  // Convert User to UserProfile - UPDATED to use badge status
  const userToProfile = useCallback((userData, badgeData) => ({
    id: userData.id || 0,
    name: userData.name || userData.username || userData.email?.split('@')[0] || 'User',
    email: userData.email || '',
    username: userData.username || userData.name || userData.email?.split('@')[0] || 'user',
    isVerified: badgeData.isVerified, // Use API badge status
    verificationMessage: badgeData.message,
    badgeType: badgeData.badgeType,
    profilePicture: userData.photo_url ? getProfileUrl(userData.photo_url) : null,
    coverImage: userData.banner ? getBannerUrl(userData.banner) : null,
    photo_url: userData.photo_url,
    banner: userData.banner,
    phoneNumber: userData.phone_number || '',
    shopAddress: userData.shop_address || '',
    businessLocation: userData.business_location || '',
    businessDescription: userData.bio || ''
  }), []);

  // Subscribe to user changes and fetch badge
  useEffect(() => {
    const unsubscribe = userService.subscribe(async (currentUser) => {
      console.log('ShopSection - User updated:', currentUser);
      if (currentUser) {
        // Fetch fresh badge status when user changes
        await fetchBadgeStatus();
        const profile = userToProfile(currentUser, badgeStatus);
        setUser(profile);
      } else {
        setUser(null);
        setBadgeStatus({ isVerified: false, badgeType: null, expiryDate: null });
      }
    });

    // Load user from localStorage on mount and fetch badge
    const loadUser = async () => {
      const currentUser = userService.getUser();
      if (currentUser) {
        console.log('ShopSection - User from storage:', currentUser);
        await fetchBadgeStatus();
        const profile = userToProfile(currentUser, badgeStatus);
        setUser(profile);
      }
    };
    
    loadUser();

    return unsubscribe;
  }, [userToProfile, fetchBadgeStatus, badgeStatus]);

  // Fetch user products
  const fetchUserProducts = useCallback(async () => {
    try {
      console.log('Fetching user products...');
      const response = await ApiService.get('/api/v1/user/products');
      console.log('Products API response:', response);
      
      let productsData = [];
      
      if (response.status && response.data) {
        productsData = response.data;
      } else if (Array.isArray(response)) {
        productsData = response;
      } else if (response.products) {
        productsData = response.products;
      }

      const transformedProducts = productsData.map((product, index) => {
        let imageUrl = '';
        try {
          if (product.image_url) {
            if (typeof product.image_url === 'string' && product.image_url.startsWith('[')) {
              const images = JSON.parse(product.image_url);
              imageUrl = images && images.length > 0 
                ? getProductImageUrl(images[0])
                : '';
            } else {
              imageUrl = getProductImageUrl(product.image_url);
            }
          }
        } catch (e) {
          imageUrl = product.image_url && product.image_url !== '[]' 
            ? getProductImageUrl(product.image_url.replace(/[\[\]"]/g, ''))
            : '';
        }
        
        let price = 'Ask for price';
        if (product.promo_price) {
          price = `₦${parseFloat(product.promo_price).toLocaleString()}`;
        } else if (product.actual_price) {
          price = `₦${parseFloat(product.actual_price).toLocaleString()}`;
        } else if (product.ask_for_price) {
          price = 'Ask for price';
        }
        
        const productId = product.product_id || product.id;
        
        return {
          id: productId?.toString() || `temp-${index}`,
          product_id: productId?.toString() || `temp-${index}`,
          title: product.title || 'Untitled Product',
          price: price,
          image: imageUrl,
          condition: product.condition || 'Unknown',
          location: product.location || 'Unknown location',
          description: product.description || '',
          quantity: product.quantity || '0',
          sold: product.sold || '0',
          avg_rating: product.avg_rating || '0',
          ask_for_price: product.ask_for_price || false,
          actual_price: product.actual_price,
          promo_price: product.promo_price,
          category_id: product.category_id || product.category
        };
      });
      
      console.log('Transformed products:', transformedProducts);
      return transformedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }, []);

  // Update shop image
  const updateShopImage = async (imageFile, imageType) => {
    if (!user) return;

    try {
      setIsSaving(true);
      setSaveMessage(`Uploading ${imageType} image...`);

      const formData = new FormData();
      const fieldName = imageType === 'banner' ? 'banner' : 'photo_url';
      formData.append(fieldName, imageFile);

      const currentUser = userService.getUser();
      
      formData.append('username', currentUser.username || '');
      formData.append('email', currentUser.email || '');
      formData.append('phone_number', currentUser.phone_number || '');
      formData.append('shop_address', currentUser.shop_address || '');
      formData.append('business_location', currentUser.business_location || '');
      formData.append('bio', currentUser.bio || '');

      console.log(`Updating ${imageType} image...`);
      const result = await ApiService.post('/api/v1/shop/update', formData, true);
      
      if (result.status) {
        setSaveMessage(`${imageType === 'banner' ? 'Banner' : 'Profile'} image updated successfully!`);
        await userService.fetchFreshUserData();
        // Refresh badge status after profile update
        await fetchBadgeStatus();
      } else {
        throw new Error(result.message || `Failed to update ${imageType} image`);
      }
    } catch (error) {
      console.error(`Error updating ${imageType} image:`, error);
      setSaveMessage(error.message || `Error updating ${imageType} image`);
    } finally {
      setIsSaving(false);
      setShowCameraModal(false);
      setShowProfileModal(false);
      setShowBannerModal(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Remove shop image
  const removeShopImage = async (imageType) => {
    if (!user) return;

    try {
      setIsSaving(true);
      setSaveMessage(`Removing ${imageType} image...`);

      const formData = new FormData();
      formData.append(imageType === 'banner' ? 'remove_banner' : 'remove_photo', 'true');
      
      const currentUser = userService.getUser();
      formData.append('username', currentUser.username || '');
      formData.append('email', currentUser.email || '');
      formData.append('phone_number', currentUser.phone_number || '');
      formData.append('shop_address', currentUser.shop_address || '');
      formData.append('business_location', currentUser.business_location || '');
      formData.append('bio', currentUser.bio || '');

      const result = await ApiService.post('/api/v1/shop/update', formData, true);
      
      if (result.status) {
        setSaveMessage(`${imageType === 'banner' ? 'Banner' : 'Profile'} image removed successfully!`);
        await userService.fetchFreshUserData();
        await fetchBadgeStatus();
      } else {
        throw new Error(result.message || `Failed to remove ${imageType} image`);
      }
    } catch (error) {
      console.error(`Error removing ${imageType} image:`, error);
      setSaveMessage(error.message || `Error removing ${imageType} image`);
    } finally {
      setIsSaving(false);
      setShowProfileModal(false);
      setShowBannerModal(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    const type = event.currentTarget.getAttribute('data-type');
    
    if (file && file.type.startsWith('image/')) {
      await updateShopImage(file, type);
    }
    if (event.target) event.target.value = '';
  };

  // Camera capture handler
  const handleCaptureImage = async () => {
    const video = document.querySelector('video');
    if (video && video.videoWidth > 0) {
      try {
        setIsSaving(true);
        setSaveMessage('Processing image...');
        
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `${currentImageType}-image.jpg`, { type: 'image/jpeg' });
              await updateShopImage(file, currentImageType);
            }
          }, 'image/jpeg', 0.8);
        }
      } catch (error) {
        console.error('Error processing captured image:', error);
        setSaveMessage(error.message || 'Error processing image');
        setIsSaving(false);
      }
    }
  };

  // Trigger file input
  const triggerFileInput = (type) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-type', type);
      fileInputRef.current.click();
    }
  };

  // Open camera for specific type
  const openCamera = (type) => {
    setCurrentImageType(type);
    setShowCameraModal(true);
    setShowProfileModal(false);
    setShowBannerModal(false);
  };

  const handleAddProduct = () => {
    navigate('/start-selling');
  };

  const refreshProducts = async () => {
    try {
      setLoading(true);
      const userProducts = await fetchUserProducts();
      setProducts(userProducts);
    } catch (error) {
      console.error('Error refreshing products:', error);
      setProducts([]);
      setSaveMessage(error.message || 'Failed to refresh products');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProduct = (product) => {
    setShareModal({ 
      show: true, 
      product 
    });
  };

  const handleEditProduct = (product) => {
    setEditModal({ show: true, product });
  };

  const handleSaveProduct = async (productId, data) => {
    try {
      setIsSaving(true);
      
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('condition', data.condition);
      formData.append('location', data.location);
      formData.append('quantity', data.quantity);
      
      if (data.ask_for_price) {
        formData.append('ask_for_price', '1');
      } else {
        formData.append('ask_for_price', '0');
        formData.append('actual_price', data.actual_price);
        if (data.promo_price) {
          formData.append('promo_price', data.promo_price);
        }
      }
      
      data.images.forEach((image) => {
        formData.append('image_url[]', image);
      });

      data.existing_images.forEach((image) => {
        formData.append('existing_images[]', image);
      });

      console.log(`Updating product ${productId}...`);
      const response = await ApiService.post(`/api/v1/product/edit/${productId}`, formData, true);
      
      if (response.status) {
        setEditModal({ show: false, product: null });
        setSuccessModal({ show: true, message: 'Product updated successfully!' });
        refreshProducts();
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setSaveMessage(error.message || 'Failed to update product');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBoostProduct = (product) => {
    setSaveMessage(`Boost functionality for "${product.title}" would open here`);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p.product_id === productId);
    if (product) {
      setDeleteConfirm({
        show: true,
        productId,
        productTitle: product.title
      });
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirm.productId) return;

    try {
      setIsSaving(true);
      const response = await ApiService.delete(`/api/v1/product/delete/${deleteConfirm.productId}`);
      
      if (response.status) {
        setSuccessModal({ show: true, message: 'Product deleted successfully!' });
        setProducts(prev => prev.filter(p => p.product_id !== deleteConfirm.productId));
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setSaveMessage(error.message || 'Failed to delete product');
    } finally {
      setIsSaving(false);
      setDeleteConfirm({ show: false, productId: null, productTitle: '' });
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    const loadUserProducts = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Loading products for user:', user.id);
        const userProducts = await fetchUserProducts();
        setProducts(userProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
        setSaveMessage(error.message || 'Failed to load products');
        setTimeout(() => setSaveMessage(''), 5000);
      } finally {
        setLoading(false);
      }
    };

    loadUserProducts();
  }, [user, fetchUserProducts]);

  // Refresh badge when verification modal closes
  const handleVerificationModalClose = async () => {
    setIsVerificationModalOpen(false);
    // Refresh badge status after verification
    await fetchBadgeStatus();
    // Refresh user data
    const currentUser = userService.getUser();
    if (currentUser) {
      const profile = userToProfile(currentUser, badgeStatus);
      setUser(profile);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  // Get banner and profile URLs
  const bannerUrl = user.coverImage;
  const profileUrl = user.profilePicture;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Save Message */}
      <AnimatePresence>
        {saveMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`p-3 m-4 rounded-lg ${
              saveMessage.includes('successfully') || saveMessage.includes('success')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            <p className="text-sm font-medium flex items-center">
              {saveMessage.includes('successfully') || saveMessage.includes('success') ? '✅ ' : '❌ '}
              {saveMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.show}
        onClose={() => setSuccessModal({ show: false, message: '' })}
        message={successModal.message}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
            >
              <div className="text-center">
                <FaTrash className="text-red-500 text-4xl mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Delete Product</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "<strong>{deleteConfirm.productTitle}</strong>"? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, productId: null, productTitle: '' })}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center space-x-2"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <FaTrash size={14} />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <EditProductModal
        product={editModal.product}
        isOpen={editModal.show}
        onClose={() => setEditModal({ show: false, product: null })}
        onSave={handleSaveProduct}
      />

      {/* Share Modal */}
      {shareModal.product && (
        <ShareModal
          isOpen={shareModal.show}
          onClose={() => setShareModal({ show: false, product: null })}
          productId={shareModal.product.product_id}
          productTitle={shareModal.product.title}
        />
      )}

      {/* Image Options Modals */}
      <ImageOptionsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onTakePhoto={() => openCamera('profile')}
        onUploadPhoto={() => triggerFileInput('profile')}
        onRemovePhoto={() => removeShopImage('profile')}
        hasImage={!!profileUrl}
        title="Profile Picture"
      />

      <ImageOptionsModal
        isOpen={showBannerModal}
        onClose={() => setShowBannerModal(false)}
        onTakePhoto={() => openCamera('banner')}
        onUploadPhoto={() => triggerFileInput('banner')}
        onRemovePhoto={() => removeShopImage('banner')}
        hasImage={!!bannerUrl}
        title="Shop Banner"
      />

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCaptureImage}
        title={`Capture ${currentImageType === 'banner' ? 'Banner' : 'Profile Picture'}`}
        isCapturing={isSaving}
      />

      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload}
      />

      {/* Profile Header */}
      <div className="relative">
        {/* Banner Image */}
        <div className="h-32 md:h-48 lg:h-56 relative bg-black border-b border-gray-300">
          {bannerUrl ? (
            <>
              <img 
                src={bannerUrl} 
                alt="Shop Banner" 
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setShowBannerModal(true)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                disabled={isSaving}
              >
                <FaCamera size={16} />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white p-4">
              <button 
                onClick={() => setShowBannerModal(true)}
                className="bg-white bg-opacity-20 text-white p-3 md:p-4 rounded-full hover:bg-opacity-30 transition-all flex flex-col items-center"
                disabled={isSaving}
              >
                <FaCamera className="text-xl md:text-2xl mb-1 md:mb-2" />
                <span className="text-xs md:text-sm">Add Banner</span>
              </button>
              <p className="text-xs md:text-sm opacity-80 mt-2 md:mt-3 text-center">
                Recommended size: 1584 × 396 pixels
              </p>
            </div>
          )}
          
          {isSaving && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-white mx-auto mb-1 md:mb-2"></div>
                <p className="text-xs md:text-sm">Uploading...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="px-4 md:px-6 pb-4 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:-mt-16 mb-4">
            {/* Profile Picture */}
            <div className="relative group -mt-12 md:-mt-0 mx-auto md:mx-0">
              {profileUrl ? (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg relative">
                  <img 
                    src={profileUrl} 
                    alt="Profile" 
                    className="object-cover w-full h-full" 
                  />
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="absolute bottom-1 right-1 bg-black border-2 border-white p-1 md:p-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
                    disabled={isSaving}
                  >
                    <FaCamera size={12} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-4 border-white flex items-center justify-center text-white text-xl md:text-3xl font-bold shadow-lg relative">
                  {getInitials(user.email, user.name, user.username)}
                  <button 
                    onClick={() => setShowProfileModal(true)}
                    className="absolute bottom-1 right-1 bg-white bg-opacity-20 text-white p-1 md:p-2 rounded-full hover:bg-opacity-30 transition-colors shadow-lg"
                    disabled={isSaving}
                  >
                    <FaCamera size={12} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Buttons */}
            <div className="mt-4 md:mt-0 md:ml-auto md:mb-2 flex flex-col sm:flex-row gap-2 justify-center md:justify-end">
              {!checkingBadge && !user.isVerified && (
                <button 
                  onClick={() => setIsVerificationModalOpen(true)} 
                  className="bg-black text-white px-4 py-2 md:px-6 md:py-3 rounded-lg transition-all duration-300 font-semibold shadow-sm flex items-center justify-center gap-2 animate-pulse hover:animate-none hover:bg-gray-800 text-sm md:text-base"
                >
                  <FaShieldAlt size={16} />
                  <span>Get Verified</span>
                </button>
              )}
              {user.isVerified && (
                <div className="bg-green-100 text-green-800 px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold flex items-center gap-2 text-sm md:text-base">
                  <FaCrown className="text-yellow-500" />
                  <span>Verified {user.badgeType === 'yearly' ? 'Annual' : 'Monthly'} Seller</span>
                </div>
              )}
              <button 
                onClick={handleAddProduct}
                className="bg-yellow-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg transition-all duration-300 font-semibold shadow-sm flex items-center justify-center gap-2 hover:bg-yellow-600 text-sm md:text-base"
              >
                <FaPlus size={14} />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{user.username}</h1>
            </div>
            
            <p className="text-gray-600 mb-3 text-sm md:text-base">{user.email}</p>
            
            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-3 justify-center md:justify-start">
              {user.phoneNumber && (
                <div className="flex items-center gap-1">
                  <FaPhone size={12} className="text-gray-400" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              {user.businessLocation && (
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt size={12} className="text-gray-400" />
                  <span>{user.businessLocation}</span>
                </div>
              )}
              {user.shopAddress && (
                <div className="flex items-center gap-1">
                  <FaStore size={12} className="text-gray-400" />
                  <span>Has Shop</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {!checkingBadge && (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                  user.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isVerified ? '✅ Verified Seller' : '❌ Unverified Seller'}
                </span>
              )}
              {user.isVerified && user.badgeType === 'yearly' && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-yellow-100 text-yellow-800">
                  <FaCrown className="mr-1" size={12} />
                  Premium Annual Plan
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Shop Content */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">Your Shop</h2>
        
        <div className="mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
            Your Products ({products.length})
          </h3>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
                ))}
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <motion.div 
                  key={product.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow relative group"
                >
                  {/* Dropdown Menu */}
                  <div className={`absolute top-2 right-2 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity z-10`}>
                    <ProductDropdown
                      product={product}
                      onShare={handleShareProduct}
                      onEdit={handleEditProduct}
                      onBoost={handleBoostProduct}
                      onDelete={handleDeleteProduct}
                      isMobile={isMobile}
                    />
                  </div>

                  {/* Product Image */}
                  <div className="bg-gray-100 h-40 md:h-48 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="object-cover h-full w-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <FaStore className="text-gray-400 text-2xl" />
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-2">{product.title}</h4>
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
                  Start selling by listing your first product
                </p>
                <button 
                  onClick={handleAddProduct}
                  className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors font-semibold flex items-center gap-2 mx-auto"
                >
                  <FaPlus size={14} /> Add Product
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={handleVerificationModalClose}
        user={user}
      />    
    </div>
  );
}
