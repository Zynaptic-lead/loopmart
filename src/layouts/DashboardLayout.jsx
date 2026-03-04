// src/layouts/DashboardLayout.jsx
import React from 'react';

export default function DashboardLayout({ children }) {
  return (
    <main className="min-h-screen bg-gray-50">
      {children}
    </main>
  );
}