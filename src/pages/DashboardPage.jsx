// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import ShopSection from '../components/dashboard/ShopSection';
import ProfileSection from '../components/dashboard/ProfileSection';
import LearnSection from '../components/dashboard/LearnSection';
import ReviewSection from '../components/dashboard/ReviewSection';
import PrivacyPolicySection from '../components/dashboard/PrivacyPolicySection';
import ReferFriendsSection from '../components/dashboard/ReferFriendsSection';
import { MdOutlineWatchLater } from "react-icons/md";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('Shop');

  useEffect(() => {
    const savedSection = localStorage.getItem('dashboard_active_section');
    if (savedSection) setActiveSection(savedSection);
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard_active_section', activeSection);
  }, [activeSection]);

  const handleMenuClick = () => setSidebarOpen(true);
  const handleSidebarClose = () => setSidebarOpen(false);

  const handleLinkClick = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Shop':
        return <ShopSection />;
      case 'Profile':
        return <ProfileSection />;
      case 'Learn':
        return <LearnSection />;
      case 'Review':
        return <ReviewSection />;
      case 'Refer Friends':
        return <ReferFriendsSection />;
      case 'Privacy Policy':
        return <PrivacyPolicySection />;
      default:
        return <ComingSoonSection sectionName={activeSection} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader onMenuClick={handleMenuClick} />

      <div className="flex-1 flex">
        <DashboardSidebar
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          activeLink={activeSection}
          onLinkClick={handleLinkClick}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}

function ComingSoonSection({ sectionName }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center text-6xl mb-6 text-yellow-500">
          <MdOutlineWatchLater />
        </div>
        <h1 className="text-2xl font-bold text-black mb-3">
          {sectionName}
        </h1>
        <p className="text-gray-600 mb-8">
          This section is coming soon. We're working hard to bring you the best experience.
        </p>
        <div className="w-24 h-1 bg-yellow-500 mx-auto mb-6"></div>
        <p className="text-sm text-gray-500">
          Stay tuned for updates
        </p>
      </div>
    </div>
  );
}