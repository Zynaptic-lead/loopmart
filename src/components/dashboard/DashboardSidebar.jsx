import React, { useState } from 'react';
import { 
  FaWhatsapp, 
  FaTwitter, 
  FaFacebook, 
  FaEnvelope,
  FaStore,
  FaGraduationCap,
  FaAd,
  FaWallet,
  FaShieldAlt,
  FaUserFriends,
  FaTrash,
  FaChevronRight,
  FaTimes,
  FaStar,
  FaUser
} from 'react-icons/fa';
import DeleteAccountModal from './DeleteAccountModal';

export default function DashboardSidebar({ isOpen, onClose, onLinkClick, activeLink }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuItems = [
    { name: 'Shop', icon: FaStore },
    { name: 'Profile', icon: FaUser },
    { name: 'Learn', icon: FaGraduationCap },
    { name: 'Ads', icon: FaAd },
    { name: 'Wallet', icon: FaWallet },
    { name: 'Review', icon: FaStar },
    { name: 'Privacy Policy', icon: FaShieldAlt },
    { name: 'Refer Friends', icon: FaUserFriends },
    { name: 'Delete Account', icon: FaTrash },
  ];

  const socialIcons = [
    { 
      icon: FaWhatsapp, 
      color: 'text-green-500', 
      label: 'WhatsApp', 
      url: 'https://wa.me/?text=Check%20out%20LoopMart%20-%20Nigeria%27s%20fastest%20growing%20marketplace!' 
    },
    { 
      icon: FaTwitter, 
      color: 'text-blue-400', 
      label: 'Twitter', 
      url: 'https://twitter.com/intent/tweet?text=Check%20out%20LoopMart%20-%20Nigeria%27s%20fastest%20growing%20marketplace!' 
    },
    { 
      icon: FaFacebook, 
      color: 'text-blue-600', 
      label: 'Facebook', 
      url: 'https://www.facebook.com/sharer/sharer.php?u=https://loopmart.ng' 
    },
    { 
      icon: FaEnvelope, 
      color: 'text-red-500', 
      label: 'Email', 
      url: 'mailto:?subject=Check out LoopMart&body=Hi! I wanted to share LoopMart with you - Nigeria\'s fastest growing marketplace for buying and selling.' 
    },
  ];

  const handleLinkClick = (sectionName) => {
    if (sectionName === 'Delete Account') {
      setShowDeleteModal(true);
      if (window.innerWidth < 1024) {
        onClose();
      }
      return;
    }
    
    onLinkClick(sectionName);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static top-0 left-0 z-50
        w-64 bg-white text-black h-full flex flex-col border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close Button - Mobile Only */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 text-black hover:text-yellow-600 z-10 transition-colors"
          aria-label="Close sidebar"
        >
          <FaTimes size={20} />
        </button>

        {/* Navigation Menu */}
        <div className="flex-1 p-4 overflow-y-auto mt-4 lg:mt-0">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeLink === item.name;
              
              return (
                <button
                  key={item.name}
                  onClick={() => handleLinkClick(item.name)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-yellow-500 text-black shadow-md' 
                      : 'bg-white hover:bg-gray-50 text-black border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent 
                      size={18} 
                      className={isActive ? 'text-black' : 'text-gray-600'} 
                    />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {isActive && (
                    <FaChevronRight 
                      size={14} 
                      className="text-black" 
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Section */}
        <div className="p-6 border-t border-gray-200 bg-white space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-600 uppercase tracking-wide text-center">
              Follow Us
            </h3>
            <div className="flex justify-center space-x-3">
              {socialIcons.map((social, index) => {
                const SocialIcon = social.icon;
                return (
                  <button
                    key={index}
                    onClick={() => handleSocialClick(social.url)}
                    className={`p-3 rounded-full hover:bg-yellow-500 transition-all duration-200 ${social.color} hover:text-black border border-gray-300 hover:border-yellow-500 hover:scale-110`}
                    title={`Share on ${social.label}`}
                    aria-label={`Share on ${social.label}`}
                  >
                    <SocialIcon size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Have questions?</p>
            <a 
              href="mailto:info@loopmart.ng" 
              className="text-xs text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              info@loopmart.ng
            </a>
          </div>
          
          <div className="text-center pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              © 2024 Loopmart. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}