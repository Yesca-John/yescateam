// Get Donation Details API
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const donationId = searchParams.get('donation_id');

    if (!donationId) {
      return NextResponse.json(
        { error: 'Donation ID required' },
        { status: 400 }
      );
    }

    const donationDoc = await adminDb.collection('donations').doc(donationId).get();

    if (!donationDoc.exists) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    const donationData = donationDoc.data()!;

    return NextResponse.json({
      success: true,
      donation: {
        donation_id: donationId,
        donor_name: donationData.donor_name,
        donor_phone: donationData.donor_phone,
        number_of_tickets: donationData.number_of_tickets,
        total_amount: donationData.total_amount,
        payment_status: donationData.payment_status,
        status: donationData.status,
        tickets_issued: donationData.tickets_issued || 0,
        tickets_remaining: donationData.tickets_remaining || donationData.number_of_tickets,
        created_at: donationData.created_at,
      },
    });

  } catch (error) {
    console.error('Get donation details error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get donation details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
