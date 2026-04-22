import { AuthService } from './auth';

const BASE_URL = 'https://loopmart.ng';

export const userService = {
  setUser: (user, token) => {
    // Store user data
    localStorage.setItem('loopmart_user', JSON.stringify(user));
    if (token) {
      AuthService.setToken(token);
    }
    userService.notifySubscribers(user);
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('loopmart_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  getToken: () => {
    return AuthService.getToken();
  },
  
  clearUser: () => {
    localStorage.removeItem('loopmart_user');
    AuthService.clearToken();
    userService.notifySubscribers(null);
  },
  
  // Get full profile picture URL from photo_url field
  getProfilePictureUrl: (photoFilename) => {
    if (!photoFilename) return null;
    if (photoFilename.startsWith('http')) return photoFilename;
    if (photoFilename.startsWith('/uploads')) return `https://loopmart.ng${photoFilename}`;
    return `https://loopmart.ng/uploads/profile/${photoFilename}`;
  },
  
  // Get full banner URL from banner field
  getBannerUrl: (bannerFilename) => {
    if (!bannerFilename) return null;
    if (bannerFilename.startsWith('http')) return bannerFilename;
    if (bannerFilename.startsWith('/uploads')) return `https://loopmart.ng${bannerFilename}`;
    return `https://loopmart.ng/uploads/banners/${bannerFilename}`;
  },
  
  // Get full product image URL
  getProductImageUrl: (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `https://loopmart.ng${imagePath}`;
    return `https://loopmart.ng/uploads/products/${imagePath}`;
  },
  
  fetchFreshUserData: async () => {
    try {
      const token = AuthService.getToken();
      if (!token) return null;
      
      const response = await fetch(`${BASE_URL}/api/v1/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status && data.data) {
        const userData = data.data.user || data.data;
        userService.setUser(userData, token);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching fresh user data:', error);
      return null;
    }
  },
  
  subscribers: [],
  
  subscribe: (callback) => {
    userService.subscribers.push(callback);
    return () => {
      userService.subscribers = userService.subscribers.filter(cb => cb !== callback);
    };
  },
  
  notifySubscribers: (user) => {
    userService.subscribers.forEach(callback => callback(user));
  }
};