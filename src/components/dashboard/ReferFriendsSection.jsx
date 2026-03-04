import React, { useState } from 'react';
import { 
  FaWhatsapp, 
  FaTwitter, 
  FaFacebook, 
  FaEnvelope, 
  FaCopy,
  FaUserFriends,
  FaCheck
} from 'react-icons/fa';

export default function ReferFriendsSection() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://loopmart.ng";

  const shareMethods = [
    {
      icon: FaWhatsapp,
      label: 'WhatsApp',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => {
        const text = `Join me on LoopMart - Nigeria's fastest growing marketplace! ${referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      icon: FaTwitter,
      label: 'Twitter',
      color: 'bg-black hover:bg-gray-800',
      onClick: () => {
        const text = `Join me on LoopMart - Nigeria's fastest growing marketplace! ${referralLink}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      icon: FaFacebook,
      label: 'Facebook',
      color: 'bg-blue-600 hover:bg-blue-700',
      onClick: () => {
        const text = `Join me on LoopMart - Nigeria's fastest growing marketplace! ${referralLink}`;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      icon: FaEnvelope,
      label: 'Email',
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => {
        const subject = "Join me on LoopMart";
        const body = `Hi! I'm using LoopMart, Nigeria's fastest growing marketplace for buying and selling. It's really easy to use and has great features.\n\nJoin me using this link: ${referralLink}\n\nLooking forward to seeing you there!`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }
    }
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black mb-2">Refer Friends</h1>
        <p className="text-gray-600">Share LoopMart with your friends and grow together</p>
      </div>

      {/* Referral Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-yellow-500 px-6 py-4 border-b border-yellow-600">
          <div className="flex items-center space-x-3">
            <FaUserFriends className="text-black text-2xl" />
            <div>
              <h2 className="text-xl font-bold text-black">Share the LoopMart Experience</h2>
              <p className="text-black/80 text-sm">Earn rewards when your friends join</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Introduction */}
          <div className="text-center">
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Use the link below to refer a friend
              </h3>
              <p className="text-gray-700 leading-relaxed">
                LoopMart marketplace is a user-friendly platform that makes buying and selling goods and services easy. Your friend should be able to navigate the website and start using it with ease.
              </p>
            </div>
          </div>

          {/* Referral Link Section */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Your unique referral link
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 overflow-hidden">
                <p className="text-gray-700 truncate text-sm">{referralLink}</p>
              </div>
              <button
                onClick={copyToClipboard}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center space-x-2 min-w-[120px] justify-center"
              >
                {copied ? (
                  <>
                    <FaCheck size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FaCopy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {copied && (
              <p className="text-green-600 text-sm mt-2 flex items-center space-x-1">
                <FaCheck size={12} />
                <span>Link copied to clipboard!</span>
              </p>
            )}
          </div>

          {/* Share Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Share via social media
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shareMethods.map((method, index) => {
                const IconComponent = method.icon;
                return (
                  <button
                    key={index}
                    onClick={method.onClick}
                    className={`${method.color} text-white p-4 rounded-lg transition-all duration-200 font-semibold flex flex-col items-center space-y-2 hover:scale-105`}
                  >
                    <IconComponent size={24} />
                    <span className="text-sm">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}