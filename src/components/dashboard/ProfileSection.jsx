// ProfileSection.jsx - FIXED with correct file size validation (1MB max)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCamera, FaSave, FaTimes, FaCheckCircle, FaTimesCircle, FaSpinner, FaCrown } from 'react-icons/fa';
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

// Compress image before upload
const compressImage = (file, maxSizeKB = 1024) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 800;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Start with 0.8 quality
        let quality = 0.8;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Function to check size and compress more if needed
        const checkAndCompress = () => {
          // Convert data URL to blob size estimation (roughly dataURL length * 0.75)
          const estimatedSizeKB = (compressedDataUrl.length * 0.75) / 1024;
          
          if (estimatedSizeKB > maxSizeKB && quality > 0.3) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            checkAndCompress();
          } else {
            // Convert data URL to blob
            fetch(compressedDataUrl)
              .then(res => res.blob())
              .then(blob => {
                const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              })
              .catch(reject);
          }
        };
        
        checkAndCompress();
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function ProfileSection() {
  const [user, setUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showProfileImageOptions, setShowProfileImageOptions] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [badgeType, setBadgeType] = useState(null);
  const [checkingBadge, setCheckingBadge] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch badge status from API
  const fetchBadgeStatus = useCallback(async () => {
    try {
      setCheckingBadge(true);
      const response = await ApiService.get('/api/v1/user/badge');
      console.log('Profile - Badge API Response:', response);
      
      if (response && response.status === true && response.badge) {
        const expiryDate = response.badge.expiry_date;
        const isExpired = expiryDate ? new Date(expiryDate) < new Date() : false;
        
        if (!isExpired) {
          setIsVerified(true);
          setBadgeType(response.badge.badge_type || 'monthly');
          console.log('Profile - User is verified with badge type:', response.badge.badge_type);
        } else {
          setIsVerified(false);
          setBadgeType(null);
        }
      } else {
        setIsVerified(false);
        setBadgeType(null);
      }
    } catch (error) {
      console.error('Profile - Error fetching badge:', error);
      setIsVerified(false);
      setBadgeType(null);
    } finally {
      setCheckingBadge(false);
    }
  }, []);

  // Convert User to UserProfile
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
    verify_status: userData.verify_status,
    badge_status: userData.badge_status
  }), []);

  // Subscribe to user changes and fetch badge
  useEffect(() => {
    const loadUserAndBadge = async () => {
      setIsLoading(true);
      const currentUser = userService.getUser();
      
      if (currentUser) {
        console.log('Profile - User from storage:', currentUser);
        await fetchBadgeStatus();
        const profile = userToProfile(currentUser);
        console.log('Profile - Created profile:', profile);
        setUser(profile);
        setOriginalUser(profile);
      } else {
        setUser(null);
        setOriginalUser(null);
        setIsVerified(false);
        setBadgeType(null);
      }
      setIsLoading(false);
    };
    
    loadUserAndBadge();

    const unsubscribe = userService.subscribe(async (currentUser) => {
      console.log('Profile - User service subscription triggered:', currentUser);
      if (currentUser) {
        await fetchBadgeStatus();
        const profile = userToProfile(currentUser);
        setUser(profile);
        setOriginalUser(profile);
      } else {
        setUser(null);
        setOriginalUser(null);
        setIsVerified(false);
        setBadgeType(null);
      }
    });

    return unsubscribe;
  }, [userToProfile, fetchBadgeStatus]);

  // Update profile
  const updateProfile = async (profileData, imageFile) => {
    const formData = new FormData();
    
    if (profileData.username && profileData.username.trim() !== '') {
      formData.append('username', profileData.username);
    }
    
    if (profileData.phone_number && profileData.phone_number.trim() !== '') {
      formData.append('phone_number', profileData.phone_number);
    }
    
    if (profileData.bio && profileData.bio.trim() !== '') {
      formData.append('bio', profileData.bio);
    }
    
    if (profileData.shop_address && profileData.shop_address.trim() !== '') {
      formData.append('shop_address', profileData.shop_address);
    }
    
    if (profileData.business_location && profileData.business_location.trim() !== '') {
      formData.append('business_location', profileData.business_location);
    }

    if (imageFile) {
      formData.append('photo_url', imageFile);
    }

    console.log('Sending form data:', {
      username: profileData.username,
      phone_number: profileData.phone_number,
      bio: profileData.bio,
      shop_address: profileData.shop_address,
      business_location: profileData.business_location,
      hasPhoto: !!imageFile,
      photoSize: imageFile ? `${(imageFile.size / 1024).toFixed(2)}KB` : 'none'
    });

    return await ApiService.post('/api/v1/auth/update', formData, true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Check original file size
    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > 1024) {
      // Show compression message
      setIsCompressing(true);
      setSaveMessage('Compressing image... (this may take a moment)');
      
      try {
        // Compress the image
        const compressedFile = await compressImage(file, 1024);
        const compressedSizeKB = compressedFile.size / 1024;
        console.log(`Original: ${fileSizeKB.toFixed(2)}KB, Compressed: ${compressedSizeKB.toFixed(2)}KB`);
        
        setUploadedFile(compressedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          if (user) {
            setUser({ ...user, profilePicture: reader.result });
          }
        };
        reader.readAsDataURL(compressedFile);
        
        setSaveMessage(`Image compressed from ${fileSizeKB.toFixed(0)}KB to ${compressedSizeKB.toFixed(0)}KB`);
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Compression error:', error);
        alert('Failed to compress image. Please try a smaller image.');
      } finally {
        setIsCompressing(false);
      }
    } else {
      // File is already within size limit
      setUploadedFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        if (user) {
          setUser({ ...user, profilePicture: reader.result });
        }
      };
      reader.readAsDataURL(file);
      
      setSaveMessage(`Image selected (${fileSizeKB.toFixed(0)}KB)`);
      setTimeout(() => setSaveMessage(''), 2000);
    }

    if (e.target) e.target.value = '';
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveMessage('');

    try {
      const profileData = {
        username: user.username || '',
        phone_number: user.phoneNumber || '',
        shop_address: user.shopAddress || '',
        business_location: user.businessLocation || '',
        bio: user.businessDescription || ''
      };

      const result = await updateProfile(profileData, uploadedFile || undefined);
      console.log('Profile - Update response:', result);

      if (result.status) {
        await userService.fetchFreshUserData();
        await fetchBadgeStatus();
        setUploadedFile(null);
        setSaveMessage('Profile saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
        
        const updatedUser = userService.getUser();
        if (updatedUser) {
          const profile = userToProfile(updatedUser);
          setUser(profile);
          setOriginalUser(profile);
        }
      } else {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(', ');
          setSaveMessage(errorMessages || result.message || 'Failed to save profile');
        } else {
          setSaveMessage(result.message || 'Failed to save profile');
        }
        setTimeout(() => setSaveMessage(''), 5000);
      }
    } catch (error) {
      console.error('Profile - Error saving:', error);
      setSaveMessage(error.message || 'Error saving profile');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (user) setUser({ ...user, [field]: value });
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  
  const clearProfilePicture = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append('remove_photo', 'true');
      
      const currentUser = userService.getUser();
      if (currentUser) {
        if (currentUser.username) formData.append('username', currentUser.username);
        if (currentUser.email) formData.append('email', currentUser.email);
        if (currentUser.phone_number) formData.append('phone_number', currentUser.phone_number);
        if (currentUser.shop_address) formData.append('shop_address', currentUser.shop_address);
        if (currentUser.business_location) formData.append('business_location', currentUser.business_location);
        if (currentUser.bio) formData.append('bio', currentUser.bio);
      }
      
      const result = await ApiService.post('/api/v1/shop/update', formData, true);
      
      if (result.status) {
        await userService.fetchFreshUserData();
        const updatedUser = userService.getUser();
        if (updatedUser) {
          const profile = userToProfile(updatedUser);
          setUser(profile);
          setOriginalUser(profile);
        }
        setUploadedFile(null);
        setSaveMessage('Profile picture removed!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      setSaveMessage('Failed to remove profile picture');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
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

  const handleVerificationModalClose = async () => {
    setIsVerificationModalOpen(false);
    await fetchBadgeStatus();
    const currentUser = userService.getUser();
    if (currentUser) {
      const profile = userToProfile(currentUser);
      setUser(profile);
      setOriginalUser(profile);
    }
  };

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
              disabled={isCompressing}
            >
              <FaCamera size={12} className="text-white" />
            </button>
          </div>

          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Upload a clear photo to build trust with customers. (Max 1MB)</p>
            <button 
              onClick={() => setShowProfileImageOptions(true)} 
              className="text-black hover:text-yellow-600 text-sm font-medium transition-colors"
            >
              Change photo
            </button>
            {uploadedFile && (
              <p className="text-green-600 text-sm mt-1">✅ Image ready for upload: {(uploadedFile.size / 1024).toFixed(0)}KB</p>
            )}
            {isCompressing && (
              <p className="text-yellow-600 text-sm mt-1">⏳ Compressing image...</p>
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
            saveMessage.includes('successfully') || saveMessage.includes('compressed')
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : saveMessage.includes('selected')
              ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <p className="text-sm font-medium">
              {saveMessage.includes('successfully') ? '✅ ' : saveMessage.includes('compressed') ? '📦 ' : saveMessage.includes('selected') ? '📷 ' : '❌ '}
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input 
            type="email" 
            value={user.email || ''} 
            disabled
            className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" 
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
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
            disabled={!hasUnsavedChanges || isSaving || isCompressing} 
            className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FaSave />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Verification Status */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            {!checkingBadge && isVerified ? (
              <FaCheckCircle className="text-green-500" size={24} />
            ) : (
              <FaTimesCircle className="text-red-500" size={24} />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {!checkingBadge && isVerified ? 'Verified Seller' : 'Unverified Seller'}
              </h3>
              <p className="text-sm text-gray-600">
                {!checkingBadge && isVerified 
                  ? `${badgeType === 'yearly' ? 'Annual Premium' : 'Monthly'} verified account - trusted by customers.`
                  : 'Verify your account to build trust and unlock premium features.'
                }
              </p>
            </div>
          </div>
          {!checkingBadge && !isVerified && (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="bg-black text-white px-6 py-2 rounded-lg font-semibold shadow-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <MdVerified size={20} />
              <span>Verify Now</span>
            </button>
          )}
          {!checkingBadge && isVerified && (
            <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 text-sm" />
                <span className="text-green-700 text-sm font-medium">Verification Active</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal 
        isOpen={isVerificationModalOpen} 
        onClose={handleVerificationModalClose} 
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
                disabled={isCompressing}
              >
                <FaCamera /> 
                <span>Upload Photo (Max 1MB)</span>
              </button>
              {user.photo_url && (
                <button 
                  onClick={clearProfilePicture} 
                  className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FaTimes /> 
                  <span rounded-lg hover:bg-red-600 font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FaTimes /> 
                  <span>Remove>Remove Photo</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Images larger than 1MB will be Photo</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Images larger than 1MB will be automatically compressed
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
