import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoIosContact } from "react-icons/io";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Shield, 
  MessageCircle, 
  Phone, 
  ChevronLeft,
  ChevronRight,
  Store,
  X
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

// API Base URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

// Helper functions
const getConditionBadgeColor = (condition) => {
  switch (condition?.toLowerCase()) {
    case "new": return "bg-green-100 text-green-800";
    case "fairly used": return "bg-blue-100 text-blue-800";
    case "used": return "bg-orange-100 text-orange-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Unknown date';
  }
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
  if (imagePath.startsWith('http')) return imagePath;
  if (imagePath.startsWith('/uploads')) return `https://loopmart.ng${imagePath}`;
  return `https://loopmart.ng/uploads/products/${imagePath}`;
};

// WhatsApp Modal Component
const WhatsAppModal = ({ isOpen, onClose, sellerName, sellerPhone, productName, location }) => {
  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    if (!sellerPhone) {
      alert('Seller phone number not available');
      return;
    }
    
    const message = `Hello! I'm interested in your product "${productName}" on LoopMart.`;
    const whatsappUrl = `https://wa.me/${sellerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full">
          <X size={24} />
        </button>

        <div className="p-4 md:p-8">
          <div className="text-center mb-4 md:mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-lg">
              <IoIosContact size={24} className="text-white md:w-8 md:h-8" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2">Contact Seller</h2>
            <p className="text-gray-600 text-sm md:text-base">Connect with the seller via WhatsApp</p>
          </div>

          <div className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 border border-gray-200">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm md:text-base">Seller Name:</span>
                <span className="font-semibold text-gray-800 text-sm md:text-base">{sellerName || "Anonymous Seller"}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm md:text-base">Phone:</span>
                <span className="font-semibold text-green-600 text-sm md:text-base">
                  {sellerPhone || "Phone not available"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium text-sm md:text-base">Location:</span>
                <span className="font-semibold text-gray-800 text-sm md:text-base">{location || "Unknown"}</span>
              </div>
            </div>
          </div>

          {sellerPhone ? (
            <button onClick={handleWhatsAppClick} className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl flex items-center justify-center gap-2 md:gap-3 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-base md:text-lg">
              <MessageCircle size={20} className="md:w-6 md:h-6" />
              <span>Open WhatsApp</span>
            </button>
          ) : (
            <div className="w-full bg-gray-100 text-gray-500 font-bold py-3 md:py-4 px-4 md:px-6 rounded-xl flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg">
              <Phone size={20} className="md:w-6 md:h-6" />
              <span>Phone Number Not Available</span>
            </div>
          )}

          <button onClick={onClose} className="w-full mt-3 md:mt-4 text-gray-600 hover:text-gray-800 font-medium py-2 md:py-3 px-4 md:px-6 rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-300 text-sm md:text-base">
            Continue Browsing
          </button>

          <p className="text-center text-gray-500 text-xs md:text-sm mt-3 md:mt-4">
            {sellerPhone ? "WhatsApp will open in a new tab." : "The seller's phone number is not available."}
          </p>
        </div>
      </div>
    </div>
  );
};

// Shared notification logic
const getUserDataFromStorage = () => {
  try {
    const userDataString = localStorage.getItem('loopmart_user');
    const token = localStorage.getItem('loopmart_token');
    if (!userDataString || !token) return null;
    const userData = JSON.parse(userDataString);
    return {
      userId: userData.id,
      token: token,
      name: userData.name || userData.username,
      email: userData.email
    };
  } catch (e) {
    console.error('Error parsing user data:', e);
    return null;
  }
};

const triggerConnectionNotification = async (product, navigate, setIsLoading, toast) => {
  const userData = getUserDataFromStorage();
  
  if (!userData?.token) {
    toast?.warning('Please login to connect with seller');
    navigate('/login');
    return false;
  }

  if (setIsLoading) setIsLoading(true);

  try {
    try {
      const response = await fetch(`https://loopmart.ng/api/v1/product/engagement`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          product_id: product.id,
          user_id: userData.userId
        })
      });
      
      await response.json();
    } catch (error) {
      console.log('Engagement endpoint failed, continuing anyway');
    }
    
    toast?.success('Interest sent! Seller will contact you.');
    
    const notificationId = `connect-${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = {
      id: notificationId,
      userId: userData.userId,
      productId: product.id,
      productName: product.name,
      title: 'Interest Sent! ✅',
      message: `Your interest in "${product.name}" has been sent. Seller will contact you soon.`,
      type: 'success',
      read: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      product: {
        id: product.id,
        name: product.name,
        image: product.image || '',
        price: product.price || 'N/A'
      },
      isRealNotification: true,
      source: 'user-action',
      action: 'connect'
    };

    window.dispatchEvent(new CustomEvent('add-notification', {
      detail: notification
    }));

    try {
      const existing = JSON.parse(localStorage.getItem('loopmart_notifications') || '[]');
      const updated = [notification, ...existing];
      localStorage.setItem('loopmart_notifications', JSON.stringify(updated.slice(0, 100)));
    } catch (error) {
      console.error('localStorage error:', error);
    }
    
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    toast?.error('Network error. Please check your connection.');
    return false;
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [images, setImages] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [sellerPhone, setSellerPhone] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});

  const AUTO_SLIDE_INTERVAL = 5000;
  
  const isMounted = useRef(true);
  const fetchAttempted = useRef(false);
  const initialId = useRef(id);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    console.log('ProductDetails mounted/updated with id:', id);
    
    const fetchProduct = async () => {
      // Prevent multiple fetches for the same ID
      if (fetchAttempted.current && initialId.current === id) {
        console.log('Fetch already attempted for this ID, skipping');
        return;
      }
      
      fetchAttempted.current = true;
      initialId.current = id;
      
      if (!id) {
        if (isMounted.current) {
          setError('No product ID provided');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted.current) setLoading(true);
        
        console.log(`Fetching product with ID: ${id} from allproducts`);
        
        const response = await fetch(`${API_URL}/allproduct`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const allProducts = await response.json();
        
        if (!Array.isArray(allProducts)) {
          throw new Error('Invalid response format');
        }
        
        console.log(`Total products received: ${allProducts.length}`);
        
        const foundProduct = allProducts.find(item => {
          const itemId = item.id?.toString();
          const itemProductId = item.product_id?.toString();
          const searchId = id.toString();
          
          const match = itemId === searchId || itemProductId === searchId;
          if (match) {
            console.log(`Found match: id=${itemId}, product_id=${itemProductId}`);
          }
          return match;
        });
        
        if (!foundProduct) {
          console.log('Product not found in the list');
          if (isMounted.current) {
            setError('Product not found');
            setLoading(false);
          }
          return;
        }
        
        console.log('Product found:', foundProduct);
        
        let productImages = [];
        try {
          if (foundProduct.image_url) {
            if (typeof foundProduct.image_url === 'string' && foundProduct.image_url.startsWith('[')) {
              const parsed = JSON.parse(foundProduct.image_url);
              if (Array.isArray(parsed)) {
                productImages = parsed.map(img => getImageUrl(img));
              }
            } else {
              productImages = [getImageUrl(foundProduct.image_url)];
            }
          } else if (foundProduct.image) {
            productImages = [getImageUrl(foundProduct.image)];
          } else if (foundProduct.photo) {
            productImages = [getImageUrl(foundProduct.photo)];
          }
        } catch (error) {
          console.log('Error parsing images:', error);
        }

        if (productImages.length === 0) {
          productImages = ['https://via.placeholder.com/600x400?text=No+Image'];
        }

        const actualPrice = foundProduct.actual_price ? parseFloat(foundProduct.actual_price) : 0;
        const promoPrice = foundProduct.promo_price ? parseFloat(foundProduct.promo_price) : null;
        const hasPromo = promoPrice && promoPrice < actualPrice;

        const transformedProduct = {
          id: foundProduct.id || foundProduct.product_id || parseInt(id),
          name: foundProduct.title || foundProduct.name || foundProduct.product_name || "Unnamed Product",
          price: foundProduct.ask_for_price ? "Contact Seller" : (hasPromo ? `₦${promoPrice?.toLocaleString()}` : `₦${actualPrice.toLocaleString()}`),
          actual_price: actualPrice > 0 ? `₦${actualPrice.toLocaleString()}` : "",
          promo_price: promoPrice ? `₦${promoPrice?.toLocaleString()}` : "",
          condition: foundProduct.condition || "Unknown",
          category: foundProduct.category || foundProduct.product_category || "Others",
          seller_verified: foundProduct.badge_status === "1" || foundProduct.verify_status === "1" || false,
          location: foundProduct.location || foundProduct.product_location || "Unknown",
          ask_for_price: foundProduct.ask_for_price || false,
          description: foundProduct.description || foundProduct.product_description || "No description available.",
          seller_id: foundProduct.seller_id || foundProduct.user_id || 0,
          created_at: foundProduct.created_at || new Date().toISOString(),
          updated_at: foundProduct.updated_at || new Date().toISOString(),
          seller_name: foundProduct.seller_name || "Anonymous Seller",
          seller_phone: foundProduct.phone_number || foundProduct.phone || '',
          image: productImages[0]
        };

        console.log('Setting product state:', transformedProduct);
        
        if (isMounted.current) {
          setProduct(transformedProduct);
          setImages(productImages);
          setSellerPhone(foundProduct.phone_number || foundProduct.phone || '');
          setError(null);
          setLoading(false);
          console.log('Loading set to false');
        }
        
        const currentCategory = foundProduct.category || foundProduct.product_category;
        const currentId = foundProduct.id || foundProduct.product_id;
        
        const related = allProducts
          .filter(item => {
            const itemCategory = item.category || item.product_category;
            const itemId = item.id || item.product_id;
            return itemCategory === currentCategory && 
                   itemId && itemId.toString() !== currentId?.toString();
          })
          .slice(0, 4)
          .map(item => {
            let img = '';
            try {
              if (item.image_url) {
                if (typeof item.image_url === 'string' && item.image_url.startsWith('[')) {
                  const parsed = JSON.parse(item.image_url);
                  if (Array.isArray(parsed) && parsed[0]) {
                    img = getImageUrl(parsed[0]);
                  }
                } else {
                  img = getImageUrl(item.image_url);
                }
              } else if (item.image) {
                img = getImageUrl(item.image);
              }
            } catch (error) {
              img = 'https://via.placeholder.com/200x150?text=No+Image';
            }
            
            return {
              id: item.id || item.product_id,
              name: item.title || item.name || item.product_name || "Unnamed Product",
              price: item.ask_for_price ? "Contact Seller" : `₦${(item.actual_price ? parseFloat(item.actual_price) : 0).toLocaleString()}`,
              image: img || 'https://via.placeholder.com/200x150?text=No+Image',
              condition: item.condition || "Unknown",
              location: item.location || item.product_location || "Unknown"
            };
          })
          .filter(p => p.id);
          
        if (isMounted.current) {
          setRelatedProducts(related);
        }
        console.log('Related products set:', related.length);
        
      } catch (error) {
        console.error('Error fetching product:', error);
        if (isMounted.current) {
          setError('Failed to load product');
          setLoading(false);
        }
      }
    };

    fetchProduct();

    // Safety timeout
    const timeoutId = setTimeout(() => {
      if (isMounted.current && loading) {
        console.log('Safety timeout triggered');
        setLoading(false);
        if (!product) {
          setError('Product took too long to load. Please try again.');
        }
      }
    }, 15000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [id]); // Only depend on id

  useEffect(() => {
    console.log('State updated - loading:', loading, 'product:', product ? 'exists' : 'null', 'error:', error);
  }, [loading, product, error]);

  const nextImage = useCallback(() => {
    if (images.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedImage((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 300);
  }, [images.length, isTransitioning]);

  const prevImage = useCallback(() => {
    if (images.length <= 1 || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 300);
  }, [images.length, isTransitioning]);

  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;
    const interval = setInterval(nextImage, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length, nextImage]);

  const handleConnectClick = async () => {
    if (!product) return;
    setIsConnecting(true);
    const success = await triggerConnectionNotification(product, navigate, setIsConnecting, toast);
    if (success) {
      setShowWhatsAppModal(true);
    }
  };

  const handleViewShop = () => {
    if (product && product.seller_id) {
      navigate(`/shop/${product.seller_id}`);
    } else {
      toast?.info('Shop information not available');
    }
  };

  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  const handleImageError = (index) => {
    const newImages = [...images];
    newImages[index] = 'https://via.placeholder.com/600x400?text=Image+Not+Found';
    setImages(newImages);
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  const handleRetry = () => {
    fetchAttempted.current = false;
    setError(null);
    setLoading(true);
    setProduct(null);
    // Trigger re-fetch by forcing a re-render with same id
    initialId.current = null;
  };

  console.log('Rendering with state - loading:', loading, 'product:', !!product, 'error:', error);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
          <p className="text-xs text-gray-400 mt-2">Please wait while we fetch the product</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <X size={32} className="text-red-600 md:w-10 md:h-10" />
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              Product ID: {id} could not be found.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              The product might have been removed or the ID is incorrect.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={handleRetry}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm md:text-base"
              >
                Try Again
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-lg transition-colors text-sm md:text-base"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasPromo = product.actual_price && product.promo_price && product.actual_price !== product.promo_price;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm md:text-base"
            >
              <ArrowLeft size={18} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </header>

      <div className="px-3 md:px-4 py-4 md:py-8 max-w-7xl mx-auto">
        <div className="sm:hidden mb-4 bg-white rounded-lg shadow-sm border p-4">
          <h1 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h1>
          <div className="flex items-center justify-between mb-3">
            <span className={`px-2 py-1 text-xs rounded-full ${getConditionBadgeColor(product.condition)}`}>
              {product.condition}
            </span>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {hasPromo && (
                  <span className="text-gray-400 text-xs line-through">{product.actual_price}</span>
                )}
                <span className="text-lg font-bold text-red-600">{product.price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-3 md:space-y-4">
            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border p-2 md:p-4 relative group">
              <div className="relative overflow-hidden rounded-lg bg-gray-100 h-64 md:h-80 lg:h-96">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
                      selectedImage === index ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    {!loadedImages[index] && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                      </div>
                    )}
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onLoad={() => handleImageLoad(index)}
                      onError={() => handleImageError(index)}
                      style={{ display: loadedImages[index] ? 'block' : 'none' }}
                    />
                  </div>
                ))}
                
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 md:p-3 rounded-full">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-14 h-14 md:w-20 md:h-20 border rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(index)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="hidden sm:block bg-white rounded-lg md:rounded-xl shadow-sm border p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-3 md:mb-4 gap-3">
                <div className="flex-1">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm ${getConditionBadgeColor(product.condition)}`}>
                      {product.condition}
                    </span>
                    {product.seller_verified && (
                      <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                        <Shield size={12} />
                        Verified Seller
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                    {hasPromo && <span className="text-gray-400 line-through">{product.actual_price}</span>}
                    <span className="text-2xl md:text-3xl font-bold text-red-600">{product.price}</span>
                  </div>
                  {hasPromo && <span className="text-sm text-green-600 font-medium">Special Offer!</span>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 md:gap-6 text-sm text-gray-600 mb-3 md:mb-4">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{product.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Posted {formatDate(product.created_at)}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border p-4 md:p-6">
              <h3 className="font-semibold text-gray-800 mb-3 md:mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Condition:</span>
                  <p className="font-medium">{product.condition}</p>
                </div>
                <div>
                  <span className="text-gray-600">Location:</span>
                  <p className="font-medium">{product.location}</p>
                </div>
                <div>
                  <span className="text-gray-600">Seller:</span>
                  <p className="font-medium">{product.seller_name}</p>
                </div>
              </div>
            </div>

            <div className="sm:hidden bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>

            <div className="bg-white rounded-lg md:rounded-xl shadow-sm border p-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <button
                  onClick={handleConnectClick}
                  disabled={isConnecting}
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-3 md:px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  <MessageCircle size={16} />
                  <span>{isConnecting ? 'Sending...' : 'Connect'}</span>
                </button>
                
                <button
                  onClick={handleViewShop}
                  className="bg-black text-white font-semibold py-3 px-3 md:px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                >
                  <Store size={16} />
                  <span>View Shop</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-6 md:mt-12">
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">Related Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  onClick={() => navigate(`/products/${relatedProduct.id}`)}
                  className="bg-white rounded-lg md:rounded-xl shadow-sm border hover:shadow-md transition-all duration-300 cursor-pointer group"
                >
                  <div className="p-3 md:p-4">
                    <div className="relative h-32 md:h-48 mb-3 md:mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x150?text=No+Image';
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-xs md:text-sm">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base md:text-lg font-bold text-red-600">{relatedProduct.price}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getConditionBadgeColor(relatedProduct.condition)}`}>
                        {relatedProduct.condition}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 mt-2">
                      <MapPin size={10} />
                      <span>{relatedProduct.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        sellerName={product?.seller_name}
        sellerPhone={sellerPhone || product?.seller_phone}
        productName={product?.name}
        location={product?.location}
      />
    </div>
  );
}