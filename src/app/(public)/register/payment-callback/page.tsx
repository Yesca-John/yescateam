// Payment Callback Page - User is redirected here after PhonePe payment
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
                           searchParams.get('orderId');
    
    if (!merchantOrderId) {
      console.error('Payment callback: No order ID found');
      setTimeout(() => {
        router.push('/register?type=normal');
      }, 3000);
      return;
    }

    // Call our API to verify payment status
    fetch(`/api/payment/verify?merchant_order_id=${merchantOrderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.state === 'COMPLETED') {
          router.push(
            `/register/payment-success?member_id=${data.member_id}&registration_id=${data.registration_id}&transaction=${merchantOrderId}`
          );
        } else {
          router.push(
            `/register/payment-failed?transaction=${merchantOrderId}&status=${data.state || 'UNKNOWN'}`
          );
        }
      })
      .catch((error) => {
        console.error('Verification error:', error);
        router.push(`/register/payment-failed?error=verification_failed&transaction=${merchantOrderId}`);
      });
  }, [mounted, searchParams, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying Payment</h2>
        <p className="text-gray-600 mb-4">Please wait while we confirm your payment...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h2>
        <p className="text-gray-600">Please wait</p>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PaymentCallbackContent />
    </Suspense>
  );
}
