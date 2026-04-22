// src/services/api.js
import { userService } from './userService';

const BASE_URL = 'https://loopmart.ng';

class ApiService {
  static async request(endpoint, options = {}) {
    const token = userService.getToken();
    
    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData, let browser set it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
      credentials: 'include',
    };

    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    try {
      console.log(`Making API request to: ${url}`, config);
      const response = await fetch(url, config);
      
      if (response.status === 401) {
        userService.clearUser();
        // Don't throw immediately, let the caller handle it
        const error = new Error('Session expired. Please log in again.');
        error.status = 401;
        throw error;
      }

      // Handle empty response (like for DELETE)
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      
      console.log('API Response:', data);
      
      if (!response.ok) {
        const error = new Error(data.message || `Request failed: ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: 'GET' });
  }

  static async post(endpoint, data, requiresAuth = true, isFormData = false) {
    const options = {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    };
    return this.request(endpoint, options);
  }

  static async put(endpoint, data, requiresAuth = true, isFormData = false) {
    const options = {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    };
    return this.request(endpoint, options);
  }

  static async patch(endpoint, data, requiresAuth = true) {
    const options = {
      method: 'PATCH',
      body: JSON.stringify(data),
    };
    return this.request(endpoint, options);
  }

  static async delete(endpoint, data = null, requiresAuth = true) {
    const options = {
      method: 'DELETE',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    return this.request(endpoint, options);
  }
}

export default ApiService;