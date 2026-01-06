'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const merchantOrderId = searchParams.get('merchantOrderId') || 
                           searchParams.get('merchant_order_id') ||
                           searchParams.get('orderId') ||
                           sessionStorage.getItem('volunteer_merchant_order_id');

    if (!merchantOrderId) {
      console.error('Volunteer payment callback: No order ID found');
      setTimeout(() => {
        router.push('/volunteer?error=no_order_id');
      }, 3000);
      return;
    }

    console.log('Verifying volunteer payment for order:', merchantOrderId);

    // Call our API to verify payment status
    fetch(`/api/volunteer/verify?merchant_order_id=${merchantOrderId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Volunteer payment verification result:', data);
        
        if (data.success && data.state === 'COMPLETED') {
          router.push(
            `/volunteer/payment-success?volunteer_id=${data.volunteer_id}&transaction=${merchantOrderId}`
          );
        } else {
          router.push(
            `/volunteer/payment-failed?transaction=${merchantOrderId}&status=${data.state || 'UNKNOWN'}`
          );
        }
      })
      .catch((error) => {
        console.error('Volunteer verification error:', error);
        router.push(`/volunteer/payment-failed?error=verification_failed&transaction=${merchantOrderId}`);
      });
  }, [mounted, searchParams, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
        <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
        <p className="text-gray-600 mb-4">Please wait while we confirm your volunteer registration payment...</p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 font-medium">⚠️ Please wait, do not refresh this page</p>
          <p className="text-xs text-yellow-700 mt-1">We are confirming your payment with the gateway</p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
        <Loader2 className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
        <p className="text-gray-600">Please wait</p>
      </div>
    </div>
  );
}

export default function VolunteerPaymentCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
