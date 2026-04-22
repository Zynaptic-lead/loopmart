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
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `Request failed: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  static async post(endpoint, data, isFormData = false) {
    const options = {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    };
    return this.request(endpoint, options);
  }

  static async put(endpoint, data, isFormData = false) {
    const options = {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    };
    return this.request(endpoint, options);
  }

  static async delete(endpoint, data = null) {
    const options = {
      method: 'DELETE',
    };
    
    // If data is provided, add it to the request body
    if (data) {
      options.body = JSON.stringify(data);
      options.headers = {
        'Content-Type': 'application/json',
      };
    }
    
    return this.request(endpoint, options);
  }
}

export default ApiService;