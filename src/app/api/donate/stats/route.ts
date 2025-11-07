// Get Donation Statistics API
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    // Get counters from settings/counters document
    const countersDoc = await adminDb.collection('settings').doc('counters').get();
    
    if (!countersDoc.exists) {
      // Initialize counters if they don't exist
      await adminDb.collection('settings').doc('counters').set({
        total_donated_amount: 0,
        total_tickets_donated: 0,
        total_tickets_availed: 0,
        last_updated: Date.now(),
      });
      
      return NextResponse.json({
        success: true,
        stats: {
          total_donated: 0,
          total_tickets_donated: 0,
          total_tickets_availed: 0,
          available_tickets: 0,
          timestamp: Date.now(),
        },
      });
    }

    const counters = countersDoc.data();
    const availableTickets = Math.max(0, 
      (counters?.total_tickets_donated || 0) - (counters?.total_tickets_availed || 0)
    );

    return NextResponse.json({
      success: true,
      stats: {
        total_donated: counters?.total_donated_amount || 0,
        total_tickets_donated: counters?.total_tickets_donated || 0,
        total_tickets_availed: counters?.total_tickets_availed || 0,
        available_tickets: availableTickets,
        timestamp: counters?.last_updated || Date.now(),
      },
    });

  } catch (error) {
    console.error('Get donation stats error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get donation statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Real-time stats cache (optional optimization)
export const revalidate = 30; // Revalidate every 30 seconds
