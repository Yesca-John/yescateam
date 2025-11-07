// Donation Payment Initiation API
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { getPhonePeAuthToken, createPhonePeDonationOrder } from '@/lib/payment/phonepe';

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(idToken);

    const body = await request.json();
    const { donation_id, amount, phone_number, name } = body;

    // Validate input
    if (!donation_id || !amount || !phone_number || !name) {
      return NextResponse.json(
        { error: 'Missing required donation fields' },
        { status: 400 }
      );
    }

    // Verify donation exists
    const donationRef = adminDb.collection('donations').doc(donation_id);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    const donationData = donationDoc.data();
    
    // Verify amount matches
    if (donationData!.total_amount !== amount) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Generate unique donation transaction ID with DONATE prefix
    const merchantOrderId = `DONATE_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    console.log('Creating donation payment with transaction ID:', merchantOrderId);

    // Update donation with payment order ID
    await donationRef.update({
      merchant_order_id: merchantOrderId,
      payment_initiated_at: Date.now(),
      payment_status: 'pending',
    });

    // Get PhonePe auth token
    console.log('Getting PhonePe auth token for donation...');
    const authToken = await getPhonePeAuthToken();

    // Create payment order with donation-specific callback URL
    console.log('Creating PhonePe order for donation...');
    const orderResponse = await createPhonePeDonationOrder(authToken, {
      merchantOrderId,
      amount: amount * 100, // Convert to paise
    });

    console.log('PhonePe Donation Order Response:', JSON.stringify(orderResponse, null, 2));

    // Update donation with PhonePe order details
    await donationRef.update({
      phonepe_order_id: orderResponse.orderId,
      payment_state: orderResponse.state,
    });

    // Return redirect URL
    return NextResponse.json({
      success: true,
      donation_id: donation_id,
      merchant_order_id: merchantOrderId,
      order_id: orderResponse.orderId,
      payment_url: orderResponse.redirectUrl,
      message: 'Donation payment initiated successfully',
    });

  } catch (error) {
    console.error('Donation payment initiation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate donation payment', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
