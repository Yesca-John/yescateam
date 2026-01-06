// Volunteer Payment Verification API - Verifies payment status and saves to Firebase
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { checkPhonePeOrderStatus } from '@/lib/payment/phonepe';
import { sendRegistrationConfirmation } from '@/lib/whatsapp/send-confirmation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const merchantOrderId = searchParams.get('merchant_order_id');

    if (!merchantOrderId) {
      return NextResponse.json(
        { error: 'Merchant order ID required' },
        { status: 400 }
      );
    }

    console.log('Verifying volunteer payment for order:', merchantOrderId);

    // Get pending volunteer data
    const pendingVolunteerRef = adminDb.collection('camps').doc('YC26').collection('pending_volunteers').doc(merchantOrderId);
    const pendingVolunteerDoc = await pendingVolunteerRef.get();

    if (!pendingVolunteerDoc.exists) {
      console.error('Pending volunteer registration not found');
      return NextResponse.json(
        { error: 'Pending volunteer registration not found', success: false },
        { status: 404 }
      );
    }

    const pendingData = pendingVolunteerDoc.data()!;

    // Check if already processed
    if (pendingData.payment_status === 'completed' || pendingData.status === 'completed') {
      console.log('Volunteer payment already processed');
      return NextResponse.json({
        success: true,
        state: 'COMPLETED',
        volunteer_id: pendingData.volunteer_id,
        message: 'Payment already processed',
      });
    }

    // Check payment status with PhonePe
    console.log('Checking volunteer order status...');
    const orderStatus = await checkPhonePeOrderStatus(merchantOrderId);
    console.log('Volunteer order status:', JSON.stringify(orderStatus, null, 2));

    // Check if payment was successful
    const paymentSuccess = orderStatus.success && orderStatus.code === 'PAYMENT_SUCCESS';
    const paymentState = orderStatus.data?.state;

    // If payment not completed, update status to failed and return
    if (!paymentSuccess || paymentState !== 'COMPLETED') {
      await pendingVolunteerRef.update({
        payment_status: 'failed',
        status: 'failed',
        payment_state: paymentState || 'UNKNOWN',
        failed_at: new Date().toISOString(),
      });
      return NextResponse.json({
        success: false,
        state: paymentState || 'UNKNOWN',
        message: `Payment ${paymentState?.toLowerCase() || 'failed'}`,
      });
    }

    // Payment completed - save volunteer to Firebase
    const timestamp = new Date().toISOString();

    // Get volunteer counter
    const counterRef = adminDb.collection('settings').doc('counters');
    const counterDoc = await counterRef.get();
    const counters = counterDoc.data() || {};
    const currentVolunteerCounter = counters.yc26VolunteerCounter || 0;
    const newVolunteerCounter = currentVolunteerCounter + 1;

    const volunteerId = `VOL${String(newVolunteerCounter).padStart(2, '0')}`;

    console.log('Creating volunteer record...', volunteerId);

    // Create volunteer document
    const volunteerData = {
      volunteer_id: volunteerId,
      volunteer_number: newVolunteerCounter,
      full_name: pendingData.full_name,
      phone_number: pendingData.phone_number,
      age: pendingData.age,
      church_name: pendingData.church_name,
      address: pendingData.address,
      payment_status: 'completed',
      payment_amount: pendingData.amount,
      payment_transaction_id: merchantOrderId,
      payment_method: 'phonepe',
      payment_completed_at: timestamp,
      status: 'registered',
      registered_by: 'online',
      created_at: timestamp,
      updated_at: timestamp,
    };

    // Create payment record
    const paymentData = {
      payment_id: orderStatus.data?.transactionId || merchantOrderId,
      merchant_order_id: merchantOrderId,
      volunteer_id: volunteerId,
      amount: pendingData.amount,
      payment_method: 'phonepe',
      payment_status: 'completed',
      phone_number: pendingData.phone_number,
      payment_date: timestamp,
      phonepe_response: orderStatus,
      type: 'volunteer',
      created_at: timestamp,
    };

    // Batch write to Firestore
    const batch = adminDb.batch();

    // Add volunteer document
    const volunteerRef = adminDb.collection('camps').doc('YC26').collection('volunteers').doc(volunteerId);
    batch.set(volunteerRef, volunteerData);

    // Add payment document
    const paymentRef = adminDb.collection('payments').doc(merchantOrderId);
    batch.set(paymentRef, paymentData);

    // Update counters
    batch.update(counterRef, {
      yc26VolunteerCounter: newVolunteerCounter,
      lastUpdated: timestamp,
    });

    // Update pending volunteer status to completed
    batch.update(pendingVolunteerRef, {
      payment_status: 'completed',
      status: 'completed',
      volunteer_id: volunteerId,
      completed_at: timestamp,
    });

    // Commit batch
    await batch.commit();
    console.log('✅ Successfully saved volunteer to Firebase:', volunteerId);

    // Send WhatsApp confirmation message
    try {
      await sendRegistrationConfirmation(
        pendingData.phone_number,
        pendingData.full_name,
        volunteerId
      );
      console.log('✅ WhatsApp confirmation sent to:', pendingData.phone_number);
    } catch (whatsappError) {
      // Don't fail the registration if WhatsApp fails
      console.error('⚠️ Failed to send WhatsApp confirmation:', whatsappError);
    }

    // Create audit log
    await adminDb.collection('audit_logs').add({
      action: 'volunteer_registered_with_payment',
      resource_type: 'volunteer',
      resource_id: volunteerId,
      actor_type: 'system',
      actor_id: 'payment_verification',
      details: {
        volunteer_id: volunteerId,
        merchant_order_id: merchantOrderId,
        transaction_id: orderStatus.data?.transactionId,
        amount: pendingData.amount,
      },
      timestamp,
    });

    return NextResponse.json({
      success: true,
      state: 'COMPLETED',
      volunteer_id: volunteerId,
      message: 'Payment verified and volunteer registration completed',
    });
  } catch (error) {
    console.error('Volunteer payment verification error:', error);
    return NextResponse.json(
      {
        error: 'Failed to verify volunteer payment',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}
