import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaExclamationTriangle, 
  FaTimes, 
  FaSpinner,
  FaTrash,
  FaArrowRight
} from 'react-icons/fa';
import { useToast } from '../../contexts/ToastContext';
import { userService } from '../../services/userService';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();

  const reasons = [
    { id: 'not_using', label: "I'm not using LoopMart anymore" },
    { id: 'too_complex', label: 'The platform is too complicated' },
    { id: 'privacy', label: 'Privacy concerns' },
    { id: 'alternative', label: 'Found a better alternative' },
    { id: 'technical', label: 'Technical issues' },
    { id: 'other', label: 'Other reason' }
  ];

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Format the deletion reason properly
      let deletionReason = '';
      
      if (reason === 'other') {
        deletionReason = customReason.trim() || 'Other reason';
      } else {
        const selectedReason = reasons.find(r => r.id === reason);
        deletionReason = selectedReason ? selectedReason.label : 'No reason provided';
      }

      console.log('Sending deletion reason:', deletionReason);

      // Make API call with proper payload - using the updated delete method
      const response = await ApiService.delete('/api/v1/user', { 
        deletion_reason: deletionReason 
      });

      console.log('Delete response:', response);

      if (response.status) {
        // Clear user data
        userService.clearUser();
        
        toast.success('Your account has been successfully deleted.');
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(response.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setStep(1);
      setReason('');
      setCustomReason('');
      setConfirmText('');
      onClose();
    }
  };

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (!reason) return false;
      if (reason === 'other' && !customReason.trim()) return false;
      return true;
    }
    if (step === 3) return confirmText === 'DELETE';
    return false;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaExclamationTriangle className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Delete Account</h3>
                    <p className="text-xs text-white/80">Step {step} of 3</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <FaTimes className="text-white text-sm" />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-gray-100">
              <motion.div 
                className="h-full bg-red-500"
                initial={{ width: '0%' }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Step 1: Warning */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <p className="text-sm text-gray-700">
                      This action <span className="font-semibold text-red-600">cannot be undone</span>. This will permanently delete your account and remove all your data from our servers.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">When you delete your account:</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>All your listings and products will be removed</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Your profile and personal information will be erased</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>Any active subscriptions will be cancelled</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Reason - Required */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <p className="text-sm font-medium text-gray-700">
                    Please tell us why you're leaving <span className="text-red-500">*</span>
                  </p>

                  <div className="space-y-2">
                    {reasons.map((r) => (
                      <label
                        key={r.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          reason === r.id 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r.id}
                          checked={reason === r.id}
                          onChange={(e) => setReason(e.target.value)}
                          className="w-4 h-4 text-red-500"
                          required
                        />
                        <span className="ml-3 text-sm text-gray-700">{r.label}</span>
                      </label>
                    ))}
                  </div>

                  {reason === 'other' && (
                    <textarea
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Please tell us your reason..."
                      className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
                      rows="3"
                      required
                    />
                  )}
                </motion.div>
              )}

              {/* Step 3: Final Confirmation */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaExclamationTriangle className="text-red-500 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Type <span className="font-bold text-red-500">DELETE</span> to confirm
                    </p>
                  </div>

                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type DELETE here"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-center"
                    autoFocus
                  />
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                  >
                    Back
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed() || isDeleting}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      canProceed()
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue
                    <FaArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleDelete}
                    disabled={!canProceed() || isDeleting}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                      canProceed() && !isDeleting
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isDeleting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash size={14} />
                        Delete Account
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-center text-gray-500 mt-4">
                Need help?{' '}
                <a 
                  href="mailto:support@loopmart.ng" 
                  className="text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteAccountModal;