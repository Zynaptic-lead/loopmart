// src/components/PWAInstallButton.jsx
import { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaCheck } from 'react-icons/fa';

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showBounce, setShowBounce] = useState(true);

  useEffect(() => {
    // Hide button only if already installed as app
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isAppInstalled) return;

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Stop bouncing after 10 seconds
    setTimeout(() => setShowBounce(false), 10000);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => setShowModal(true);
  
  const handleConfirmInstall = async () => {
    setShowModal(false);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  const handleCancelInstall = () => setShowModal(false);

  // Hide if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) return null;

  return (
    <>
      {/* Download Button - Always visible */}
      <div className="fixed bottom-40 right-4 z-50 md:right-8">
        <button
          onClick={handleInstallClick}
          className={`bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-3 md:p-4 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 group relative ${
            showBounce ? 'animate-bounce' : ''
          }`}
          aria-label="Install LoopMart App"
        >
          <FaDownload className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs md:text-sm px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Install App
          </span>
          <span className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-75"></span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 md:p-6 border-b">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Install LoopMart On Your Device</h2>
              <button onClick={handleCancelInstall} className="text-gray-400 hover:text-gray-600">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-4 md:p-6">
          
              <p className="text-sm text-gray-500">To get faster access, better support and a better experience.</p>
             
            </div>
            <div className="flex gap-3 p-4 md:p-6 border-t bg-gray-50 rounded-b-xl">
              <button onClick={handleCancelInstall} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">
                No, Cancel
              </button>
              <button onClick={handleConfirmInstall} className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2">
                <FaCheck size={16} />
                Yes, Install
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}