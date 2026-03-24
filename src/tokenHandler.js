// src/tokenHandler.js
export function initTokenHandler() {
  console.log('🔍 Token handler initializing');
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    console.log('✅ Token found:', token.substring(0, 20) + '...');
    
    // Store token
    localStorage.setItem('loopmart_token', token);
    
    // Clear URL
    const newUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, newUrl);
    
    // Fetch user data
    const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';
    
    fetch(`${API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      const userData = data.data || data.user || data;
      localStorage.setItem('loopmart_user', JSON.stringify(userData));
      console.log('💾 User stored, reloading...');
      window.location.reload();
    })
    .catch(error => {
      console.error('Error fetching user:', error);
    });
  }
}

// Run immediately
initTokenHandler();
