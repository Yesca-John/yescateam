// Create Donation Record API
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

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
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const body = await request.json();
    const { name, phone_number, number_of_tickets, total_amount } = body;

    // Validate input
    if (!name || !phone_number || !number_of_tickets || !total_amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate ticket count
    if (number_of_tickets < 1 || number_of_tickets > 100) {
      return NextResponse.json(
        { error: 'Number of tickets must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Validate amount (should be number_of_tickets * 300)
    const expectedAmount = number_of_tickets * 300;
    if (total_amount !== expectedAmount) {
      return NextResponse.json(
        { error: 'Invalid amount calculation' },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const donationId = `DON-${timestamp}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create donation record
    const donationData = {
      donation_id: donationId,
      donor_uid: uid,
      donor_name: name,
      donor_phone: phone_number,
      number_of_tickets: number_of_tickets,
      total_amount: total_amount,
      status: 'pending_payment', // pending_payment, completed, failed
      payment_status: 'pending',
      tickets_issued: 0, // Track how many tickets have been issued
      tickets_remaining: number_of_tickets, // Track remaining tickets
      created_at: timestamp,
      updated_at: timestamp,
    };

    await adminDb.collection('donations').doc(donationId).set(donationData);

    console.log('✅ Donation record created:', donationId);

    return NextResponse.json({
      success: true,
      donation_id: donationId,
      message: 'Donation record created successfully',
    });

  } catch (error) {
    console.error('Create donation error:', error);
    
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create donation record',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
