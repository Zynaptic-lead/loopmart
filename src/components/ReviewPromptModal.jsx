import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaStar, 
  FaTimes, 
  FaCheckCircle,
  FaRegStar,
  FaComment,
  FaShoppingBag,
  FaClock
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const ReviewPromptModal = ({ isOpen, onClose, product }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: prompt, 2: review form, 3: thank you
  const navigate = useNavigate();
  const toast = useToast();

  if (!isOpen || !product) return null;

  const handleRatingClick = (rating) => {
    setSelectedRating(rating);
  };

  const handleSubmitReview = async () => {
    if (selectedRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would submit the review to your API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep(3);
      toast.success('Thank you for your review!');
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemindLater = () => {
    toast.info('We\'ll remind you later to leave a review');
    onClose();
  };

  const handleWriteReview = () => {
    setStep(2);
  };

  const handleViewProduct = () => {
    onClose();
    navigate(`/products/${product.id}`);
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isFilled = interactive 
        ? (hoverRating || selectedRating) >= starValue
        : rating >= starValue;

      return (
        <button
          key={index}
          type="button"
          onClick={() => interactive && handleRatingClick(starValue)}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''} focus:outline-none`}
          disabled={!interactive}
        >
          {isFilled ? (
            <FaStar className="text-yellow-500 text-2xl md:text-3xl" />
          ) : (
            <FaRegStar className="text-gray-300 text-2xl md:text-3xl" />
          )}
        </button>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FaStar className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {step === 1 ? 'Share Your Experience' : 
                       step === 2 ? 'Write a Review' : 
                       'Thank You!'}
                    </h3>
                    <p className="text-sm text-white/80">
                      {step === 1 ? 'Help other buyers make informed decisions' :
                       step === 2 ? `Review ${product.name}` :
                       'Your feedback helps the community'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-white text-sm" />
                </button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 py-3 bg-gray-50 border-b border-gray-200">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step ? 'w-8 bg-yellow-500' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Prompt */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaShoppingBag className="text-yellow-500 text-3xl" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      How was your experience?
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">
                      You recently showed interest in <span className="font-semibold">{product.name}</span>. 
                      Once you complete your purchase, please share your experience with the community.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-xl p-5 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <FaStar className="text-yellow-500 text-xl mt-1" />
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">Why leave a review?</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Help other buyers make informed decisions</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Build trust in the LoopMart community</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500">✓</span>
                            <span>Earn reputation points and badges</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleWriteReview}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg"
                    >
                      Write a Review
                    </button>
                    <button
                      onClick={handleViewProduct}
                      className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                    >
                      View Product Details
                    </button>
                    <button
                      onClick={handleRemindLater}
                      className="text-sm text-gray-500 hover:text-gray-700 py-2"
                    >
                      Remind me later
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Review Form */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {renderStars(selectedRating, true)}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Tap a star to rate your experience
                    </p>
                    {selectedRating > 0 && (
                      <p className="text-sm font-medium text-gray-700">
                        {selectedRating === 1 && 'Poor - Not satisfied'}
                        {selectedRating === 2 && 'Fair - Could be better'}
                        {selectedRating === 3 && 'Good - Satisfied'}
                        {selectedRating === 4 && 'Very Good - Happy with purchase'}
                        {selectedRating === 5 && 'Excellent - Absolutely love it!'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Share your experience (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you like or dislike? Would you recommend this product?"
                      rows="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <FaClock className="text-blue-500 text-lg mt-1" />
                      <p className="text-sm text-blue-700">
                        Your review helps the seller improve and helps other buyers make better choices. 
                        Thank you for contributing to the LoopMart community!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmitReview}
                      disabled={isSubmitting}
                      className={`flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                        isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle size={16} />
                          <span>Submit Review</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Thank You */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                  >
                    <FaCheckCircle className="text-green-500 text-3xl" />
                  </motion.div>

                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      Thank You for Your Review!
                    </h4>
                    <p className="text-gray-600">
                      Your feedback helps the LoopMart community grow and improve.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
                    <p className="text-sm text-gray-700">
                      Your review has been submitted and will be visible to other buyers once approved.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleViewProduct}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg"
                    >
                      View Product
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewPromptModal;