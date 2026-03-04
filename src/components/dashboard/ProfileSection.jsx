import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCamera, FaSave, FaTimes, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import { userService } from '../../services/userService';
import ApiService from '../../services/api';
import { getInitials } from '../../utils/helpers';
import VerificationModal from './VerificationModal';

// Helper for profile image URL
const getProfileImageUrl = (photoFilename) => {
  if (!photoFilename) return null;
  if (photoFilename.startsWith('http')) return photoFilename;
  if (photoFilename.startsWith('/uploads')) return `https://loopmart.ng${photoFilename}`;
  return `https://loopmart.ng/uploads/users/${photoFilename}`;
};

export default function ProfileSection() {
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showProfileImageOptions, setShowProfileImageOptions] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Convert User to UserProfile - UPDATED to match actual user data structure
  const userToProfile = useCallback((userData) => ({
    id: userData.id || 0,
    name: userData.name || userData.username || userData.email?.split('@')[0] || 'User',
    email: userData.email || '',
    username: userData.username || '',
    phoneNumber: userData.phone_number || '',
    shopAddress: userData.shop_address || '',
    businessLocation: userData.business_location || '',
    businessDescription: userData.bio || '',
    photo_url: userData.photo_url || null,
    profilePicture: userData.photo_url ? getProfileImageUrl(userData.photo_url) : null,
    isVerified: userData.verify_status === "1" || userData.badge_status === "1"
  }), []);

  // Subscribe to user changes
  useEffect(() => {
    const unsubscribe = userService.subscribe((currentUser) => {
      if (currentUser) {
        const profile = userToProfile(currentUser);
        setUser(profile);
        setOriginalUser(profile);
        setIsLoading(false);
      } else {
        setUser(null);
        setOriginalUser(null);
        setIsLoading(false);
      }
    });

    const currentUser = userService.getUser();
    if (currentUser) {
      const profile = userToProfile(currentUser);
      setUser(profile);
      setOriginalUser(profile);
    }
    setIsLoading(false);

    return unsubscribe;
  }, [userToProfile]);

  // Update profile
  const updateProfile = async (profileData, imageFile) => {
    const formData = new FormData();
    
    // Append all fields - using the exact field names expected by the API
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.phone_number) formData.append('phone_number', profileData.phone_number);
    if (profileData.shop_address) formData.append('shop_address', profileData.shop_address);
    if (profileData.business_location) formData.append('business_location', profileData.business_location);
    if (profileData.bio) formData.append('bio', profileData.bio);

    if (imageFile) {
      formData.append('photo_url', imageFile);
    }

    return await ApiService.post('/api/v1/auth/update', formData, true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);

    // Create preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      if (user) {
        setUser({ ...user, profilePicture: reader.result });
      }
    };
    reader.readAsDataURL(file);

    if (e.target) e.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage('');

    try {
      const profileData = {
        username: user.username,
        phone_number: user.phoneNumber,
        shop_address: user.shopAddress,
        business_location: user.businessLocation,
        bio: user.businessDescription
      };

      const result = await updateProfile(profileData, uploadedFile || undefined);
      console.log('Update profile response:', result);

      if (result.status) {
        await userService.fetchFreshUserData();
        setUploadedFile(null);
        setSaveMessage('Profile saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage(result.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage(error.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (user) setUser({ ...user, [field]: value });
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  
  const clearProfilePicture = () => {
    if (user) {
      setUser({ ...user, profilePicture: null, photo_url: null });
      setUploadedFile(null);
      setShowProfileImageOptions(false);
    }
  };

  const hasUnsavedChanges = user && originalUser && (
    user.username !== originalUser.username ||
    user.phoneNumber !== originalUser.phoneNumber ||
    user.shopAddress !== originalUser.shopAddress ||
    user.businessLocation !== originalUser.businessLocation ||
    user.businessDescription !== originalUser.businessDescription ||
    uploadedFile !== null
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-yellow-500 text-2xl mr-3" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Please log in to view your profile</p>
          <button className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Get the correct profile image URL
  const profileImageUrl = user.photo_url ? getProfileImageUrl(user.photo_url) : user.profilePicture;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      {/* Profile Picture Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            {profileImageUrl ? (
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg">
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.log('Profile image failed to load');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-white flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {getInitials(user.email, user.name, user.username)}
              </div>
            )}
            <button 
              onClick={() => setShowProfileImageOptions(true)} 
              className="absolute bottom-0 right-0 bg-black border-2 border-white p-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg"
            >
              <FaCamera size={12} className="text-white" />
            </button>
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Upload a clear photo to build trust with customers.</p>
            <button 
              onClick={() => setShowProfileImageOptions(true)} 
              className="text-black hover:text-yellow-600 text-sm font-medium transition-colors"
            >
              Change photo
            </button>
            {uploadedFile && (
              <p className="text-green-600 text-sm mt-1">✅ Image ready for upload: {uploadedFile.name}</p>
            )}
          </div>
        </div>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload} 
      />

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        {saveMessage && (
          <div className={`p-3 rounded-lg ${
            saveMessage.includes('successfully') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-sm font-medium">
              {saveMessage.includes('successfully') ? '✅ ' : '❌ '}
              {saveMessage}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
          <input 
            type="text" 
            value={user.username || ''} 
            onChange={(e) => handleInputChange('username', e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors" 
            placeholder="Enter username" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
          <input 
            type="tel" 
            value={user.phoneNumber || ''} 
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors" 
            placeholder="Enter phone number" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Shop Address</label>
          <textarea 
            value={user.shopAddress || ''} 
            onChange={(e) => handleInputChange('shopAddress', e.target.value)} 
            rows={3} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none transition-colors" 
            placeholder="Enter shop address" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Business Location</label>
          <input 
            type="text" 
            value={user.businessLocation || ''} 
            onChange={(e) => handleInputChange('businessLocation', e.target.value)} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-colors" 
            placeholder="Enter business location" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Business Description</label>
          <textarea 
            value={user.businessDescription || ''} 
            onChange={(e) => handleInputChange('businessDescription', e.target.value)} 
            rows={4} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 resize-none transition-colors" 
            placeholder="Describe your business" 
          />
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
          <div>
            {hasUnsavedChanges && (
              <p className="text-yellow-600 text-sm">You have unsaved changes</p>
            )}
          </div>
          <button 
            onClick={handleSaveProfile} 
            disabled={!hasUnsavedChanges || isSaving} 
            className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FaSave />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {user.isVerified ? (
              <FaCheckCircle className="text-green-500" size={24} />
            ) : (
              <FaTimesCircle className="text-red-500" size={24} />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {user.isVerified ? 'Verified Seller' : 'Unverified Seller'}
              </h3>
              <p className="text-sm text-gray-600">
                {user.isVerified 
                  ? 'Your account is verified and trusted by customers.'
                  : 'Verify your account to build trust and unlock features.'
                }
              </p>
            </div>
          </div>
          {!user.isVerified && (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <MdVerified size={20} />
              <span>Verify Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal 
        isOpen={isVerificationModalOpen} 
        onClose={() => setIsVerificationModalOpen(false)} 
        user={user} 
      />

      {/* Profile Image Options Modal */}
      {showProfileImageOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Change Profile Picture</h3>
              <button 
                onClick={() => setShowProfileImageOptions(false)} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-3">
              <button 
                onClick={triggerFileInput} 
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <FaCamera /> 
                <span>Upload Photo</span>
              </button>
              {user.photo_url && (
                <button 
                  onClick={clearProfilePicture} 
                  className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FaTimes /> 
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}