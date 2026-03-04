import React, { useState, useEffect } from 'react';
import { FaPlay, FaExternalLinkAlt, FaYoutube, FaVideo, FaFacebook } from 'react-icons/fa';

export default function LearnSection() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Your Facebook video URL
  const facebookVideoUrl = "https://www.facebook.com/100070204551738/videos/pcb.647613964255416/586742597644030";
  
  // Clean URL for embedding
  const cleanVideoUrl = facebookVideoUrl.split('?')[0];
  
  // Create Facebook embed URL
  const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanVideoUrl)}&show_text=0&width=560`;
  
  // Create direct watch URL
  const watchUrl = cleanVideoUrl.includes('/videos/') 
    ? cleanVideoUrl 
    : `https://www.facebook.com/watch/?v=${extractVideoId(cleanVideoUrl)}`;

  // Extract video ID from URL
  function extractVideoId(url) {
    const match = url.match(/\/videos\/(?:pcb\.\d+\/)?(\d+)/);
    return match ? match[1] : null;
  }

  const videoId = extractVideoId(cleanVideoUrl);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle opening Facebook video
  const openFacebookVideo = () => {
    window.open(watchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">Learn</h1>
        <p className="text-gray-600">Get started with Loopmart</p>
      </div>

      {/* Main Video Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        
        {/* Video Player Area */}
        <div className="relative bg-gradient-to-br from-gray-900 to-black aspect-video">
          
          {isLoading ? (
            // Loading state
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading video player...</p>
              </div>
            </div>
          ) : (
            // Try Facebook embed first, fallback to button
            <div className="w-full h-full">
              {/* Facebook Embed Container */}
              <div className="w-full h-full relative">
                <iframe
                  src={embedUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  title="Facebook video player"
                  loading="lazy"
                  onError={(e) => {
                    console.error('Embed failed, showing fallback');
                    e.currentTarget.style.display = 'none';
                    document.getElementById('facebook-fallback')?.classList.remove('hidden');
                  }}
                />
                
                {/* Fallback if embed fails */}
                <div id="facebook-fallback" className="hidden absolute inset-0">
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1877F2] to-[#0D5DB9]">
                    <div className="text-center max-w-md">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaFacebook size={40} className="text-white" />
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                        Watch on Facebook
                      </h3>
                      
                      <p className="text-gray-200 mb-6">
                        For the best viewing experience, we recommend watching this video directly on Facebook.
                      </p>

                      <button
                        onClick={openFacebookVideo}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#1877F2] rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold text-lg shadow-lg"
                        aria-label="Watch on Facebook"
                      >
                        <FaExternalLinkAlt className="text-xl" />
                        <span>Open on Facebook</span>
                      </button>
                      
                      <p className="text-gray-300 text-sm mt-4">
                        Note: Some videos require you to be logged into Facebook
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Overlay controls */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={openFacebookVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-black/70 text-white rounded-lg hover:bg-black/90 transition-colors text-sm font-medium"
                    aria-label="Open in Facebook"
                  >
                    <FaExternalLinkAlt className="text-sm" />
                    <span>Open in Facebook</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Below Video */}
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-black mb-4">
            How to Get Started on Loopmart
          </h2>
          
          <div className="space-y-6">
            {/* Main Description */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🚀</span>
                </div>
              </div>
              <div>
                <p className="text-gray-700 text-lg mb-3">
                  Ready to take your business online for FREE? This tutorial video shows you how to easily create your shop on LoopMart – Nigeria&apos;s fastest-growing online marketplace!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}