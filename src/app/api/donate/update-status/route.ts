// Update Donation Payment Status API
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
    await adminAuth.verifyIdToken(idToken);

    const body = await request.json();
    const { donation_id, payment_status, payment_id, payment_details } = body;

    if (!donation_id || !payment_status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const donationRef = adminDb.collection('donations').doc(donation_id);
    const donationDoc = await donationRef.get();

    if (!donationDoc.exists) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    const timestamp = Date.now();

    // Update donation status
    const updateData: Record<string, unknown> = {
      payment_status,
      updated_at: timestamp,
    };

    if (payment_status === 'completed') {
      updateData.status = 'completed';
      updateData.payment_completed_at = timestamp;
    } else if (payment_status === 'failed') {
      updateData.status = 'failed';
    }

    if (payment_id) {
      updateData.payment_id = payment_id;
    }

    if (payment_details) {
      updateData.payment_details = payment_details;
    }

    await donationRef.update(updateData);

    console.log('✅ Donation payment status updated:', donation_id, payment_status);

    return NextResponse.json({
      success: true,
      message: 'Donation status updated successfully',
    });

  } catch (error) {
    console.error('Update donation status error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update donation status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
