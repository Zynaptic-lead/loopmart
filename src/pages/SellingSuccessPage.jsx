import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Share2 } from 'lucide-react';
import logo from '../assets/logo.png';

export default function SellingSuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <img 
            src={logo} 
            alt="Loopmart" 
            className="h-12 w-auto"
          />
        </div>
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Listed Successfully!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your product has been listed and is now visible to buyers. 
          You'll be notified when someone shows interest.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition font-medium flex items-center justify-center gap-2"
          >
            Continue Shopping
            <ArrowRight size={20} />
          </button>
          
          <button
            onClick={() => navigate('/start-selling')}
            className="w-full bg-white text-gray-700 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
          >
            <Share2 size={20} />
            List Another Item
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-6">
          Redirecting to homepage in 10 seconds...
        </p>
      </div>
    </div>
  );
}