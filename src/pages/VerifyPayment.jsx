// src/pages/VerifyPayment.jsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'https://loopmart.ng/api';

export default function VerifyPayment() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const toast = useToast();
  const reference = searchParams.get('reference');

  const handleManualVerify = async () => {
    const ref = reference || prompt('Enter your Paystack transaction reference:');
    if (!ref) return;

    setVerifying(true);
    const token = localStorage.getItem('loopmart_token') || localStorage.getItem('auth_token');

    try {
      const response = await fetch(`${API_URL}/v1/subscription/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reference: ref })
      });

      const data = await response.json();
      console.log('Verification result:', data);

      if (data.status) {
        toast.success('Subscription verified! You can now sell.');
        window.location.href = '/start-selling';
      } else {
        toast.error(data.message || 'Verification failed. Contact support.');
      }
    } catch (error) {
      toast.error('Error verifying payment');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Verify Your Payment</h2>
        <p className="text-gray-600 mb-4">
          If you've paid but your subscription isn't active, click below to verify.
        </p>
        <button
          onClick={handleManualVerify}
          disabled={verifying}
          className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold"
        >
          {verifying ? 'Verifying...' : 'Verify My Payment'}
        </button>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="w-full mt-3 border py-3 rounded-lg"
        >
          Back to Pricing
        </button>
      </div>
    </div>
  );
}