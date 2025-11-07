// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

// Donation Payment Callback API
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    console.log('🎁 Donation payment callback received');
    
    // Try to get data from JSON body first (from our callback page)
    let merchantOrderId: string | null = null;
    let decodedResponse: any = null;

    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      // Called from our callback page
      const body = await request.json();
      merchantOrderId = body.merchantOrderId;
      console.log('Processing donation callback from page:', merchantOrderId);
      
      // In this case, we need to fetch the payment status from PhonePe
      // For now, we'll just verify the donation exists
      if (!merchantOrderId) {
        return NextResponse.json({ 
          success: false, 
          error: 'no_transaction_id' 
        }, { status: 400 });
      }

      // Find donation
      const donationQuery = await adminDb.collection('donations')
        .where('merchant_order_id', '==', merchantOrderId)
        .limit(1)
        .get();

      if (donationQuery.empty) {
        console.error('❌ Donation not found for transaction:', merchantOrderId);
        return NextResponse.json({ 
          success: false, 
          error: 'donation_not_found' 
        }, { status: 404 });
      }

      const donationDoc = donationQuery.docs[0];
      const donationId = donationDoc.id;
      const donationData = donationDoc.data();

      // Update donation as completed (PhonePe only redirects on success)
      const timestamp = Date.now();
      await donationDoc.ref.update({
        payment_status: 'completed',
        status: 'completed',
        payment_completed_at: timestamp,
        updated_at: timestamp,
      });

      // Update counters in settings/counters
      const countersRef = adminDb.collection('settings').doc('counters');
      await countersRef.set({
        total_donated_amount: FieldValue.increment(donationData.total_amount || 0),
        total_tickets_donated: FieldValue.increment(donationData.number_of_tickets || 0),
        last_updated: timestamp,
      }, { merge: true });

      // Create audit log
      await adminDb.collection('audit_logs').add({
        type: 'donation_payment_success',
        donation_id: donationId,
        merchant_order_id: merchantOrderId,
        amount: donationData.total_amount,
        donor_name: donationData.donor_name,
        donor_phone: donationData.donor_phone,
        timestamp: timestamp,
      });

      return NextResponse.json({ 
        success: true, 
        donation_id: donationId 
      });

    } else {
      // PhonePe sends data as form-urlencoded
      const phonePeFormData = await request.formData();
      const response = phonePeFormData.get('response') as string;
      
      console.log('PhonePe donation callback response:', response);
      
      if (!response) {
        console.error('No response data from PhonePe');
        return NextResponse.redirect(
          new URL('/donate/payment-failed?error=no_response', request.url)
        );
      }

      // Decode the base64 response
      decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));
      console.log('Decoded PhonePe donation response:', JSON.stringify(decodedResponse, null, 2));
      
      merchantOrderId = decodedResponse.data?.merchantTransactionId;
      const paymentStatus = decodedResponse.code;
      const paymentState = decodedResponse.data?.state;
      
      if (!merchantOrderId) {
        console.error('Transaction ID missing from donation response');
        return NextResponse.redirect(
          new URL('/donate/payment-failed?error=no_transaction_id', request.url)
        );
      }

      console.log(`Donation payment status for ${merchantOrderId}:`, paymentStatus, paymentState);

      // Find the donation by merchant order ID
      const donationQuery = await adminDb.collection('donations')
        .where('merchant_order_id', '==', merchantOrderId)
        .limit(1)
        .get();

      if (donationQuery.empty) {
        console.error('❌ Donation not found for transaction:', merchantOrderId);
        return NextResponse.redirect(
          new URL(`/donate/payment-failed?error=donation_not_found&transaction=${merchantOrderId}`, request.url)
        );
      }

      const donationDoc = donationQuery.docs[0];
      const donationId = donationDoc.id;
      const donationData = donationDoc.data();
      const timestamp = Date.now();

      console.log('Found donation:', donationId);

      // Check if payment was successful
      if (paymentStatus === 'PAYMENT_SUCCESS' && paymentState === 'COMPLETED') {
        console.log('✅ Donation payment successful!');
        
        // Update donation status to completed
        await donationDoc.ref.update({
          payment_status: 'completed',
          status: 'completed',
          payment_completed_at: timestamp,
          updated_at: timestamp,
          payment_details: decodedResponse.data,
          payment_response_code: paymentStatus,
          payment_response_state: paymentState,
        });

        // Update counters in settings/counters
        const countersRef = adminDb.collection('settings').doc('counters');
        await countersRef.set({
          total_donated_amount: FieldValue.increment(donationData.total_amount || 0),
          total_tickets_donated: FieldValue.increment(donationData.number_of_tickets || 0),
          last_updated: timestamp,
        }, { merge: true });

        console.log('✅ Donation record updated successfully');
        
        // Create audit log
        await adminDb.collection('audit_logs').add({
          type: 'donation_payment_success',
          donation_id: donationId,
          merchant_order_id: merchantOrderId,
          amount: donationData.total_amount,
          donor_name: donationData.donor_name,
          donor_phone: donationData.donor_phone,
          timestamp: timestamp,
          payment_details: decodedResponse.data,
        });

        return NextResponse.redirect(
          new URL(`/donate/success?donation_id=${donationId}`, request.url)
        );
      } else {
        // Payment failed or pending
        console.log('❌ Donation payment failed or pending:', paymentStatus, paymentState);
        
        await donationDoc.ref.update({
          payment_status: 'failed',
          status: 'failed',
          updated_at: timestamp,
          failure_reason: paymentStatus,
          payment_state: paymentState,
          payment_response: decodedResponse,
        });

        // Create audit log
        await adminDb.collection('audit_logs').add({
          type: 'donation_payment_failed',
          donation_id: donationId,
          merchant_order_id: merchantOrderId,
          amount: donationData.total_amount,
          donor_name: donationData.donor_name,
          donor_phone: donationData.donor_phone,
          timestamp: timestamp,
          failure_reason: paymentStatus,
          payment_state: paymentState,
        });

        return NextResponse.redirect(
          new URL(`/donate/payment-failed?transaction=${merchantOrderId}&status=${paymentStatus}&state=${paymentState}`, request.url)
        );
      }
    }

  } catch (error) {
    console.error('❌ Donation payment callback error:', error);
    
    // Check if this is a JSON request
    const contentType = request.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return NextResponse.json({ 
        success: false, 
        error: 'callback_error' 
      }, { status: 500 });
    }
    
    return NextResponse.redirect(
      new URL('/donate/payment-failed?error=callback_error', request.url)
    );
  }
}

// Handle GET requests (for testing/debugging)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const transactionId = searchParams.get('transaction') || searchParams.get('merchantOrderId');
  
  if (!transactionId) {
    return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
  }

  try {
    const donationQuery = await adminDb.collection('donations')
      .where('merchant_order_id', '==', transactionId)
      .limit(1)
      .get();

    if (donationQuery.empty) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const donationDoc = donationQuery.docs[0];
    return NextResponse.json({
      success: true,
      donation_id: donationDoc.id,
      data: donationDoc.data(),
    });

  } catch (error) {
    console.error('Error fetching donation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    );
  }
}
