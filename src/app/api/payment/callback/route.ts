// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

// Payment Callback API - Step 2: Handle PhonePe Response
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateMemberId } from '@/lib/firebase/utils';
import { generateRegId } from '@/lib/registration/types';
import { verifyPhonePeCallback, checkPhonePePaymentStatus } from '@/lib/payment/phonepe';

export async function POST(request: NextRequest) {
  try {
    console.log('Payment callback received');
    
    // PhonePe sends data as form-urlencoded
    const phonePeFormData = await request.formData();
    const response = phonePeFormData.get('response') as string;
    
    console.log('PhonePe callback response:', response);
    
    if (!response) {
      console.error('No response data from PhonePe');
      return NextResponse.redirect(
        new URL('/register/payment-failed?error=no_response', request.url)
      );
    }

    // Decode the base64 response
    const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString('utf-8'));
    console.log('Decoded PhonePe response:', decodedResponse);
    
    const transactionId = decodedResponse.data?.merchantTransactionId;
    const paymentStatus = decodedResponse.code;
    
    if (!transactionId) {
      console.error('Transaction ID missing from response');
      return NextResponse.redirect(
        new URL('/register/payment-failed?error=no_transaction_id', request.url)
      );
    }

    console.log(`Payment status for ${transactionId}: ${paymentStatus}`);

    // Check if this is a donation payment (by transaction ID prefix)
    const isDonation = transactionId.startsWith('DONATE_');
    console.log(`Transaction type: ${isDonation ? 'Donation' : 'Registration'}`);

    // Handle donation payment
    if (isDonation) {
      console.log('Processing donation payment...');
      
      const donationQuery = await adminDb.collection('donations')
        .where('merchant_order_id', '==', transactionId)
        .limit(1)
        .get();

      if (donationQuery.empty) {
        console.error('Donation not found for transaction:', transactionId);
        return NextResponse.redirect(
          new URL(`/donate/payment-failed?error=donation_not_found&transaction=${transactionId}`, request.url)
        );
      }

      const donationDoc = donationQuery.docs[0];
      const donationId = donationDoc.id;

      // Check payment status
      if (paymentStatus !== 'PAYMENT_SUCCESS') {
        console.log('Donation payment not successful, status:', paymentStatus);
        
        // Update donation status to failed
        await donationDoc.ref.update({
          payment_status: 'failed',
          status: 'failed',
          updated_at: Date.now(),
          failure_reason: paymentStatus,
        });
        
        return NextResponse.redirect(
          new URL(`/donate/payment-failed?transaction=${transactionId}&status=${paymentStatus}`, request.url)
        );
      }

      // Payment successful - update donation
      console.log('Donation payment successful!');
      await donationDoc.ref.update({
        payment_status: 'completed',
        status: 'completed',
        payment_completed_at: Date.now(),
        updated_at: Date.now(),
        payment_details: decodedResponse.data,
      });

      console.log('✅ Donation payment completed:', donationId);
      
      return NextResponse.redirect(
        new URL(`/donate/success?donation_id=${donationId}`, request.url)
      );
    }

    // Handle registration payment
    console.log('Processing registration payment...');

    // Check payment status for registration
    if (paymentStatus !== 'PAYMENT_SUCCESS') {
      console.log('Registration payment not successful, status:', paymentStatus);
      return NextResponse.redirect(
        new URL(`/register/payment-failed?transaction=${transactionId}&status=${paymentStatus}`, request.url)
      );
    }

    // Continue with registration payment processing

    // Get pending payment data
    console.log('Fetching pending payment data for:', transactionId);
    const pendingPaymentRef = adminDb.collection('pending_payments').doc(transactionId);
    const pendingPaymentDoc = await pendingPaymentRef.get();

    if (!pendingPaymentDoc.exists) {
      console.error('Pending payment not found for:', transactionId);
      return NextResponse.redirect(
        new URL(`/register/payment-failed?error=pending_not_found&transaction=${transactionId}`, request.url)
      );
    }

    const pendingData = pendingPaymentDoc.data()!;
    console.log('Pending payment found, creating member and registration...');
    const registrationFormData = pendingData.form_data;
    const registrationType = pendingData.registration_type;

    // Get counters and generate IDs
    const counterRef = adminDb.collection('settings').doc('counters');
    const counterDoc = await counterRef.get();
    const counters = counterDoc.data() || {};
    const currentMemberCounter = counters.memberCounter || 0;
    const currentYC26Counter = counters.yc26RegistrationCounter || 0;
    const newMemberCounter = currentMemberCounter + 1;
    const newYC26Counter = currentYC26Counter + 1;

    const memberId = generateMemberId(newMemberCounter);
    const regId = generateRegId('YC26');
    const timestamp = new Date().toISOString();

    // Create member document
    const memberData = {
      member_id: memberId,
      full_name: registrationFormData.full_name,
      phone_number: registrationFormData.phone_number,
      gender: registrationFormData.gender,
      age: registrationFormData.age,
      dob: registrationFormData.dob || null,
      believer: registrationFormData.believer === 'yes',
      church_name: registrationFormData.church_name,
      address: registrationFormData.address,
      fathername: registrationFormData.fathername || null,
      marriage_status: registrationFormData.marriage_status || null,
      baptism_date: registrationFormData.baptism_date || null,
      camp_participated_since: registrationFormData.camp_participated_since || null,
      education: registrationFormData.education || null,
      occupation: registrationFormData.occupation || null,
      future_goals: registrationFormData.future_goals || null,
      current_skills: registrationFormData.current_skills || null,
      desired_skills: registrationFormData.desired_skills || null,
      registered_camps: ['YC26'], // Initialize with current camp
      last_registered_camp: 'YC26',
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Create camp registration document
    const campRegData = {
      registration_id: regId,
      member_id: memberId,
      camp_id: 'YC26',
      full_name: registrationFormData.full_name,
      phone_number: registrationFormData.phone_number,
      registration_type: registrationType,
      registration_date: timestamp,
      payment_status: 'completed',
      payment_amount: pendingData.amount,
      payment_transaction_id: transactionId,
      payment_method: 'phonepe',
      payment_completed_at: timestamp,
      attendance_status: 'registered',
      group_name: null,
      yc26_registration_number: newYC26Counter,
      yc26_attended_number: null,
      collected_faithbox: registrationType === 'faithbox' ? false : null,
      registered_by: 'online',
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Create payment record
    const paymentData = {
      payment_id: transactionId,
      registration_id: regId,
      member_id: memberId,
      amount: pendingData.amount,
      payment_method: 'phonepe',
      payment_status: 'completed',
      transaction_id: transactionId,
      phone_number: registrationFormData.phone_number,
      payment_date: timestamp,
      phonepe_response: decodedResponse,
      created_at: timestamp,
    };

    // Batch write to Firestore
    const batch = adminDb.batch();

    // Add member document
    const memberRef = adminDb.collection('members').doc(memberId);
    batch.set(memberRef, memberData);

    // Add camp registration document
    const campRegRef = adminDb.collection('camps').doc('YC26').collection('registrations').doc(regId);
    batch.set(campRegRef, campRegData);

    // Add payment document
    const paymentRef = adminDb.collection('payments').doc(transactionId);
    batch.set(paymentRef, paymentData);

    // Update counters
    batch.update(counterRef, {
      memberCounter: newMemberCounter,
      yc26RegistrationCounter: newYC26Counter,
      lastUpdated: timestamp,
    });

    // Update pending payment status
    batch.update(pendingPaymentRef, {
      payment_status: 'COMPLETED',
      member_id: memberId,
      registration_id: regId,
      completed_at: timestamp,
    });

    // Commit batch
    await batch.commit();
    console.log('Successfully created member:', memberId, 'and registration:', regId);

    // Create audit log
    await adminDb.collection('audit_logs').add({
      action: 'registration_created_with_payment',
      resource_type: 'registration',
      resource_id: regId,
      actor_type: 'system',
      actor_id: 'payment_callback',
      details: {
        member_id: memberId,
        registration_type: registrationType,
        transaction_id: transactionId,
        amount: pendingData.amount,
      },
      timestamp,
    });

    console.log('Redirecting to success page');
    // Redirect to success page with registration details
    return NextResponse.redirect(
      new URL(
        `/register/payment-success?member_id=${memberId}&registration_id=${regId}&transaction=${transactionId}`,
        request.url
      )
    );
  } catch (error) {
    console.error('Payment callback error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.redirect(
      new URL('/register/payment-failed?error=processing_failed', request.url)
    );
  }
}

// Handle GET request for status check
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const transactionId = searchParams.get('transaction_id');

  if (!transactionId) {
    return NextResponse.json(
      { error: 'Transaction ID required' },
      { status: 400 }
    );
  }

  try {
    const statusResponse = await checkPhonePePaymentStatus(transactionId);
    return NextResponse.json(statusResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}
