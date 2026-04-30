// components/ReviewPromptModal.jsx - FIXED WITH PROPER API INTEGRATION
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaTimes, FaSpinner } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';

const API_URL = 'https://loopmart.ng/api';

export default function ReviewPromptModal({ isOpen, onClose, product }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast?.warning('Please select a rating before submitting');
      return;
    }

    if (!comment.trim()) {
      toast?.warning('Please write a review comment');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('loopmart_token');
      const userStr = localStorage.getItem('loopmart_user');
      
      if (!token || !userStr) {
        toast?.error('Please login to submit a review');
        onClose();
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id || user.user_id;

      // Create FormData as required by the API
      const formData = new FormData();
      formData.append('user_id', userId.toString());
      formData.append('product_id', product.id.toString());
      formData.append('comment', comment.trim());
      formData.append('rate', rating.toString());

      console.log('Submitting review:', {
        user_id: userId,
        product_id: product.id,
        comment: comment.trim(),
        rate: rating
      });

      const response = await fetch(`${API_URL}/v1/user/rating-details`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        toast?.success('Thank you for your review!');
        setRating(0);
        setComment('');
        onClose();
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast?.error('Failed to submit review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast?.error('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-lg" onClick={handleSkip} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <button 
            onClick={handleSkip} 
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-full"
            disabled={isSubmitting}
          >
            <FaTimes size={20} />
          </button>

          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaStar className="text-yellow-500 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Rate Your Experience</h2>
              <p className="text-gray-600 text-sm">
                How was your experience with "{product?.name || 'this product'}"?
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                  disabled={isSubmitting}
                >
                  <FaStar
                    size={32}
                    className={`${
                      (hoverRating || rating) >= star
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {/* Rating Labels */}
            <div className="flex justify-between text-xs text-gray-500 mb-6 px-2">
              <span>Very Poor</span>
              <span>Poor</span>
              <span>Average</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>

            {/* Comment Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 transition resize-none"
                placeholder="Share your experience with this product..."
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-400 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaStar size={16} />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Your feedback helps other buyers make informed decisions
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
