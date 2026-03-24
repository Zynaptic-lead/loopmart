// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Add this to ensure token is processed even if HTML script doesn't run
const processTokenFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token && !localStorage.getItem('loopmart_token')) {
    console.log('🔑 Processing token from main.jsx');
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
    .then(response => response.json())
    .then(data => {
      const userData = data.data || data.user || data;
      localStorage.setItem('loopmart_user', JSON.stringify(userData));
      window.location.reload();
    })
    .catch(err => console.error('Error fetching user:', err));
  }
};

// Run token processor
processTokenFromUrl();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
