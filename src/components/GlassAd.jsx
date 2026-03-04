import React, { useState, useEffect, memo, useCallback } from "react";
import { X, CheckCircle, TrendingUp, Star, Users } from "lucide-react";
import logo from '../assets/logo.png';

// Benefit items
const BENEFIT_ITEMS = [
  { 
    icon: CheckCircle, 
    color: "text-green-300", 
    bgColor: "bg-green-500/30", 
    title: "Trust Badge", 
    desc: "Build customer confidence" 
  },
  { 
    icon: TrendingUp, 
    color: "text-blue-300", 
    bgColor: "bg-blue-500/30", 
    title: "Higher Visibility", 
    desc: "Priority placement" 
  },
  { 
    icon: Star, 
    color: "text-yellow-300", 
    bgColor: "bg-yellow-500/30", 
    title: "Premium Features", 
    desc: "Advanced tools & analytics" 
  },
  { 
    icon: Users, 
    color: "text-purple-300", 
    bgColor: "bg-purple-500/30", 
    title: "More Customers", 
    desc: "Attract verified buyers" 
  }
];

const BenefitItem = memo(({ item }) => (
  <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors">
    <div className={`p-2 ${item.bgColor} rounded-lg flex-shrink-0`}>
      <item.icon className={`${item.color} w-4 h-4`} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-white font-semibold mb-1 text-sm leading-tight">
        {item.title}
      </h3>
      <p className="text-white/70 text-xs leading-tight">
        {item.desc}
      </p>
    </div>
  </div>
));

BenefitItem.displayName = 'BenefitItem';

const GlassAd = memo(({ showAd, onClose, isAnyOtherModalActive }) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  useEffect(() => {
    if (showAd && !isAnyOtherModalActive) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [showAd, isAnyOtherModalActive]);

  if (!showAd || isAnyOtherModalActive) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Main Card */}
      <div 
        className={`relative w-full max-w-md bg-black/70 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 p-2 text-white/70 hover:text-white transition-colors bg-black/40 rounded-full backdrop-blur-sm hover:bg-black/60"
          aria-label="Close advertisement"
        >
          <X size={18} />
        </button>

        <div className="relative p-6">
          {/* Header with LoopMart Logo */}
          <header className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src={logo} 
                alt="Loopmart" 
                className="h-12 w-auto filter brightness-0 invert"
              />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              Become a Verified Seller
            </h2>
            <p className="text-white/80 text-sm">
              Stand out and boost your sales
            </p>
          </header>

          {/* Benefits Grid */}
          <section className="grid grid-cols-2 gap-3 mb-6">
            {BENEFIT_ITEMS.map((item, index) => (
              <BenefitItem key={index} item={item} />
            ))}
          </section>

          {/* Stats */}
          <section className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-white mb-1">3x</div>
                <div className="text-white/70 text-xs">More Sales</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white mb-1">89%</div>
                <div className="text-white/70 text-xs">Trust Rate</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white mb-1">2.5x</div>
                <div className="text-white/70 text-xs">More Views</div>
              </div>
            </div>
          </section>

          {/* CTA Buttons */}
          <section className="flex gap-3">
            <button className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg border border-yellow-400/30 text-sm">
              Get Verified
            </button>
            <button 
              onClick={handleClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl border border-white/30 transition-all duration-200 backdrop-blur-sm text-sm"
            >
              Close
            </button>
          </section>

          {/* Footer */}
          <footer className="text-center text-white/50 text-xs mt-4">
            Join 5,000+ trusted sellers
          </footer>
        </div>

        {/* Subtle decorative elements */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-purple-500/5 rounded-full blur-xl translate-x-1/2 translate-y-1/2"></div>
      </div>
    </div>
  );
});

GlassAd.displayName = 'GlassAd';

// Optimized hook with cleanup
export const useAdTiming = (isAnyOtherModalActive = false) => {
  const [showAd, setShowAd] = useState(false);
  const [adShown, setAdShown] = useState(false);

  useEffect(() => {
    if (adShown || isAnyOtherModalActive) return;

    const timings = [30000, 75000, 180000];
    const timeouts = [];
    
    const showAdIfPossible = () => {
      if (!isAnyOtherModalActive && !adShown) {
        setShowAd(true);
        setAdShown(true);
      }
    };

    timings.forEach(timing => {
      timeouts.push(setTimeout(showAdIfPossible, timing));
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isAnyOtherModalActive, adShown]);

  const handleCloseAd = useCallback(() => setShowAd(false), []);

  return { showAd, handleCloseAd };
};

export default GlassAd;