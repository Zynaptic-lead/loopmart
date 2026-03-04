// src/utils/helpers.js
export const getRandomColor = () => {
  const colors = ['#FFD700', '#FF6347', '#4CAF50', '#1E90FF', '#FF69B4', '#FF8C00', '#9C27B0'];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getInitials = (email, name, username) => {
  if (username) return username.slice(0, 2).toUpperCase();
  if (name) return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  if (!email) return 'U';
  const prefix = email.split('@')[0];
  const chars = prefix.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
  return chars || 'U';
};