// Issue Donated Ticket API (Front Desk Use)
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase authentication (admin/front desk only)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // TODO: Add admin role check here
    // if (decodedToken.role !== 'admin') {
    //   return NextResponse.json(
    //     { error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const { recipient_name, recipient_phone, recipient_id_proof } = body;

    if (!recipient_name || !recipient_phone) {
      return NextResponse.json(
        { error: 'Missing recipient details' },
        { status: 400 }
      );
    }

    // Find a donation with available tickets (FIFO - First In First Out)
    const availableDonationsSnapshot = await adminDb
      .collection('donations')
      .where('payment_status', '==', 'completed')
      .where('tickets_remaining', '>', 0)
      .orderBy('created_at', 'asc')
      .limit(1)
      .get();

    if (availableDonationsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No donated tickets available at this time' },
        { status: 404 }
      );
    }

    const donationDoc = availableDonationsSnapshot.docs[0];
    const donationData = donationDoc.data();
    const donationId = donationDoc.id;

    const timestamp = Date.now();
    const issuedTicketId = `ISSUED-${timestamp}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create issued ticket record
    const issuedTicketData = {
      issued_ticket_id: issuedTicketId,
      source_donation_id: donationId,
      donor_name: donationData.donor_name,
      recipient_name,
      recipient_phone,
      recipient_id_proof: recipient_id_proof || null,
      issued_by: decodedToken.uid,
      issued_at: timestamp,
      status: 'issued', // issued, used, cancelled
    };

    await adminDb.collection('issued_tickets').doc(issuedTicketId).set(issuedTicketData);

    // Update donation record
    const newTicketsIssued = (donationData.tickets_issued || 0) + 1;
    const newTicketsRemaining = (donationData.tickets_remaining || 0) - 1;

    await adminDb.collection('donations').doc(donationId).update({
      tickets_issued: newTicketsIssued,
      tickets_remaining: newTicketsRemaining,
      updated_at: timestamp,
    });

    console.log('✅ Ticket issued:', issuedTicketId);

    return NextResponse.json({
      success: true,
      issued_ticket_id: issuedTicketId,
      message: 'Ticket issued successfully',
      recipient_name,
      donor_name: donationData.donor_name,
    });

  } catch (error) {
    console.error('Issue ticket error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to issue ticket',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get issued tickets list
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split('Bearer ')[1];
    await adminAuth.verifyIdToken(idToken);

    // Get all issued tickets
    const issuedTicketsSnapshot = await adminDb
      .collection('issued_tickets')
      .orderBy('issued_at', 'desc')
      .limit(100)
      .get();

    const issuedTickets = issuedTicketsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      issued_tickets: issuedTickets,
      count: issuedTickets.length,
    });

  } catch (error) {
    console.error('Get issued tickets error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get issued tickets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
