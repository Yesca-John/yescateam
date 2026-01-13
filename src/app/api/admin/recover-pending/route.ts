// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */

// Admin API - Recover Stuck Pending Registrations
// Finds pending registrations with successful payments and completes them
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { generateMemberId } from '@/lib/firebase/utils';
import { generateRegId } from '@/lib/registration/types';
import { checkPhonePeOrderStatus } from '@/lib/payment/phonepe';
import { sendRegistrationConfirmation } from '@/lib/whatsapp/send-confirmation';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action'); // 'scan' or 'process'
    const transactionId = searchParams.get('transaction_id'); // Process specific transaction
    const autoProcess = searchParams.get('auto_process') === 'true'; // Auto-process successful payments
    const forceProcess = searchParams.get('force_process') === 'true'; // Force process without PhonePe verification

    console.log('🔍 Recovery request:', { action, transactionId, autoProcess, forceProcess });

    // Get all pending registrations
    const pendingRegsRef = adminDb.collection('camps').doc('YC26').collection('pending_registrations');
    const pendingSnapshot = await pendingRegsRef.get();

    console.log(`Found ${pendingSnapshot.size} pending registrations`);

    const results = {
      total_pending: pendingSnapshot.size,
      checked: 0,
      successful_payments: [] as any[],
      failed_payments: [] as any[],
      already_completed: [] as any[],
      processed: [] as any[],
      errors: [] as any[],
    };

    // If specific transaction ID, process only that one
    if (transactionId) {
      console.log('🔍 Processing specific transaction:', transactionId);
      
      const pendingDoc = await pendingRegsRef.doc(transactionId).get();
      
      if (!pendingDoc.exists) {
        console.error('❌ Pending registration not found:', transactionId);
        return NextResponse.json({
          error: 'Pending registration not found',
          transaction_id: transactionId,
        }, { status: 404 });
      }

      const pendingData = pendingDoc.data()!;
      console.log('📄 Pending data:', { 
        phone: pendingData.phone_number,
        name: pendingData.full_name,
        status: pendingData.status,
        payment_status: pendingData.payment_status
      });
      
      // Check if already completed
      if (pendingData.status === 'completed' || pendingData.payment_status === 'completed') {
        console.log('✅ Already completed:', transactionId);
        return NextResponse.json({
          message: 'Already completed',
          transaction_id: transactionId,
          member_id: pendingData.member_id,
          registration_id: pendingData.registration_id,
        });
      }

      // Check payment status with PhonePe
      try {
        console.log('🔍 Checking PhonePe payment status...');
        const orderStatus = await checkPhonePeOrderStatus(transactionId);
        console.log('📦 PhonePe response:', JSON.stringify(orderStatus, null, 2));
        
        // Handle error responses from PhonePe
        if (!orderStatus || orderStatus.code === 'EMPTY_RESPONSE' || orderStatus.code === 'INVALID_RESPONSE' || orderStatus.code === 'NETWORK_ERROR') {
          console.log('⚠️ Cannot verify with PhonePe (old/expired transaction):', orderStatus.code);
          
          // If force_process is true, skip PhonePe verification and process anyway
          if (forceProcess) {
            console.log('⚡ Force processing without PhonePe verification...');
            const result = await processRegistration(transactionId, pendingData, { 
              success: true,
              code: 'FORCE_PROCESSED',
              message: 'Manually processed without PhonePe verification',
              data: { state: 'FORCE_COMPLETED' }
            });
            console.log('✅ Registration force-processed successfully:', result);
            
            return NextResponse.json({
              success: true,
              message: 'Registration recovered successfully (force processed)',
              warning: 'Processed without PhonePe verification',
              ...result,
            });
          }
          
          // For old transactions, we can't verify with PhonePe anymore
          // Return detailed info for manual verification
          return NextResponse.json({
            warning: 'Cannot verify with PhonePe - transaction may be old or expired',
            transaction_id: transactionId,
            phonepe_code: orderStatus.code,
            phonepe_message: orderStatus.message,
            suggestion: 'If you have proof of payment, add &force_process=true to the URL',
            force_url: `/api/admin/recover-pending?transaction_id=${transactionId}&force_process=true`,
            data: {
              phone: pendingData.phone_number,
              name: pendingData.full_name,
              amount: pendingData.amount,
              created_at: pendingData.created_at,
              registration_type: pendingData.registration_type,
            },
          }, { status: 422 });
        }
        
        const paymentSuccess = orderStatus.success && orderStatus.code === 'PAYMENT_SUCCESS';
        const paymentState = orderStatus.data?.state;

        if (!paymentSuccess || paymentState !== 'COMPLETED') {
          console.log('❌ Payment not successful:', { code: orderStatus.code, state: paymentState });
          
          // Allow force processing for failed payments too if explicitly requested
          if (forceProcess) {
            console.log('⚡ Force processing despite failed payment status...');
            const result = await processRegistration(transactionId, pendingData, { 
              success: true,
              code: 'FORCE_PROCESSED',
              message: 'Manually processed despite failed status',
              data: { state: 'FORCE_COMPLETED' }
            });
            
            return NextResponse.json({
              success: true,
              message: 'Registration recovered successfully (force processed)',
              warning: 'Payment status was not successful but force processed',
              ...result,
            });
          }
          
          return NextResponse.json({
            message: 'Payment not successful',
            transaction_id: transactionId,
            payment_status: orderStatus.code,
            payment_state: paymentState,
            suggestion: 'If you have proof of payment, add &force_process=true to the URL',
            force_url: `/api/admin/recover-pending?transaction_id=${transactionId}&force_process=true`,
            data: {
              phone: pendingData.phone_number,
              name: pendingData.full_name,
              amount: pendingData.amount,
            },
          }, { status: 400 });
        }

        console.log('✅ Payment verified, processing registration...');
        // Process this registration
        const result = await processRegistration(transactionId, pendingData, orderStatus);
        console.log('✅ Registration processed successfully:', result);
        
        return NextResponse.json({
          success: true,
          message: 'Registration recovered successfully',
          ...result,
        });
      } catch (error) {
        console.error('❌ Error processing registration:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
        return NextResponse.json({
          error: 'Failed to process registration',
          transaction_id: transactionId,
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
      }
    }

    // Scan all pending registrations
    for (const doc of pendingSnapshot.docs) {
      const transactionId = doc.id;
      const pendingData = doc.data();
      
      results.checked++;

      // Skip if already completed
      if (pendingData.status === 'completed' || pendingData.payment_status === 'completed') {
        results.already_completed.push({
          transaction_id: transactionId,
          member_id: pendingData.member_id,
          phone_number: pendingData.phone_number,
          full_name: pendingData.full_name,
          completed_at: pendingData.completed_at,
        });
        continue;
      }

      // Check payment status with PhonePe
      try {
        console.log(`Checking payment status for: ${transactionId}`);
        const orderStatus = await checkPhonePeOrderStatus(transactionId);
        const paymentSuccess = orderStatus.success && orderStatus.code === 'PAYMENT_SUCCESS';
        const paymentState = orderStatus.data?.state;

        console.log(`Payment status for ${transactionId}: ${orderStatus.code}, State: ${paymentState}`);

        if (paymentSuccess && paymentState === 'COMPLETED') {
          // Payment was successful but registration wasn't completed
          const stuckRecord = {
            transaction_id: transactionId,
            phone_number: pendingData.phone_number,
            full_name: pendingData.full_name,
            amount: pendingData.amount,
            registration_type: pendingData.registration_type,
            payment_state: paymentState,
            created_at: pendingData.created_at,
          };

          results.successful_payments.push(stuckRecord);

          // Auto-process if requested
          if (autoProcess) {
            try {
              const result = await processRegistration(transactionId, pendingData, orderStatus);
              results.processed.push({
                transaction_id: transactionId,
                ...result,
              });
              console.log(`✅ Processed: ${transactionId} -> ${result.member_id}`);
            } catch (processError) {
              results.errors.push({
                transaction_id: transactionId,
                error: processError instanceof Error ? processError.message : 'Unknown error',
              });
              console.error(`❌ Error processing ${transactionId}:`, processError);
            }
          }
        } else {
          // Payment failed or pending
          results.failed_payments.push({
            transaction_id: transactionId,
            phone_number: pendingData.phone_number,
            full_name: pendingData.full_name,
            payment_code: orderStatus.code,
            payment_state: paymentState,
            created_at: pendingData.created_at,
          });
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.errors.push({
          transaction_id: transactionId,
          error: error instanceof Error ? error.message : 'Unknown error',
          phone_number: pendingData.phone_number,
        });
        console.error(`Error checking ${transactionId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_pending: results.total_pending,
        checked: results.checked,
        successful_payments_count: results.successful_payments.length,
        failed_payments_count: results.failed_payments.length,
        already_completed_count: results.already_completed.length,
        processed_count: results.processed.length,
        errors_count: results.errors.length,
      },
      results,
    });
  } catch (error) {
    console.error('Recovery error:', error);
    return NextResponse.json(
      {
        error: 'Failed to recover pending registrations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to process a registration
async function processRegistration(transactionId: string, pendingData: any, orderStatus: any) {
  console.log('🔄 Starting processRegistration for:', transactionId);
  
  const timestamp = new Date().toISOString();

  try {
    // Get counters and generate IDs
    console.log('📊 Fetching counters...');
    const counterRef = adminDb.collection('settings').doc('counters');
    const counterDoc = await counterRef.get();
    const counters = counterDoc.data() || {};
    const currentMemberCounter = counters.memberCounter || 0;
    const currentYC26Counter = counters.yc26RegistrationCounter || 0;
    const newMemberCounter = currentMemberCounter + 1;
    const newYC26Counter = currentYC26Counter + 1;

    console.log('🔢 Counters:', { currentMemberCounter, currentYC26Counter, newMemberCounter, newYC26Counter });

    const memberId = generateMemberId(newMemberCounter);
    const regId = generateRegId('YC26');
    const registrationType = pendingData.registration_type || 'normal';

    console.log('🆔 Generated IDs:', { memberId, regId, registrationType });
    console.log(`✨ Creating member ${memberId} and registration ${regId} from pending ${transactionId}`);

  // Create member document
  const memberData = {
    member_id: memberId,
    full_name: pendingData.full_name,
    phone_number: pendingData.phone_number,
    gender: pendingData.gender,
    age: pendingData.age,
    dob: pendingData.dob || null,
    believer: pendingData.believer,
    church_name: pendingData.church_name,
    address: pendingData.address,
    fathername: pendingData.fathername || null,
    marriage_status: pendingData.marriage_status || null,
    baptism_date: pendingData.baptism_date || null,
    camp_participated_since: pendingData.camp_participated_since || null,
    education: pendingData.education || null,
    occupation: pendingData.occupation || null,
    future_goals: pendingData.future_goals || null,
    current_skills: pendingData.current_skills || null,
    desired_skills: pendingData.desired_skills || null,
    registered_camps: ['YC26'],
    last_registered_camp: 'YC26',
    created_at: timestamp,
    updated_at: timestamp,
    recovered: true, // Flag to indicate this was recovered
    recovered_at: timestamp,
    original_pending_created: pendingData.created_at,
  };

  // Create camp registration document
  const campRegData = {
    registration_id: regId,
    member_id: memberId,
    camp_id: 'YC26',
    full_name: pendingData.full_name,
    phone_number: pendingData.phone_number,
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
    recovered: true, // Flag to indicate this was recovered
    recovered_at: timestamp,
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
    phone_number: pendingData.phone_number,
    payment_date: timestamp,
    phonepe_response: orderStatus,
    created_at: timestamp,
    recovered: true, // Flag to indicate this was recovered
    recovered_at: timestamp,
  };

  // Batch write to Firestore
  console.log('📦 Starting batch write...');
  const batch = adminDb.batch();

  // Add member document
  const memberRef = adminDb.collection('members').doc(memberId);
  batch.set(memberRef, memberData);
  console.log('✅ Added member to batch:', memberId);

  // Add camp registration document
  const campRegRef = adminDb.collection('camps').doc('YC26').collection('registrations').doc(regId);
  batch.set(campRegRef, campRegData);
  console.log('✅ Added registration to batch:', regId);

  // Add payment document
  const paymentRef = adminDb.collection('payments').doc(transactionId);
  batch.set(paymentRef, paymentData);
  console.log('✅ Added payment to batch:', transactionId);

  // Update counters
  batch.update(counterRef, {
    memberCounter: newMemberCounter,
    yc26RegistrationCounter: newYC26Counter,
    lastUpdated: timestamp,
  });
  console.log('✅ Added counter update to batch');

  // Update pending registration status to completed
  const pendingRegRef = adminDb.collection('camps').doc('YC26').collection('pending_registrations').doc(transactionId);
  batch.update(pendingRegRef, {
    payment_status: 'completed',
    status: 'completed',
    member_id: memberId,
    registration_id: regId,
    completed_at: timestamp,
    recovered: true,
    recovered_at: timestamp,
  });
  console.log('✅ Added pending update to batch');

  // Commit batch
  console.log('💾 Committing batch...');
  await batch.commit();
  console.log('✅ Batch committed successfully');

  // Send WhatsApp confirmation message
  try {
    console.log('📱 Sending WhatsApp confirmation to:', pendingData.phone_number);
    await sendRegistrationConfirmation(
      pendingData.phone_number,
      pendingData.full_name,
      memberId
    );
    console.log('✅ WhatsApp confirmation sent to:', pendingData.phone_number);
  } catch (whatsappError) {
    console.error('⚠️ Failed to send WhatsApp confirmation:', whatsappError);
    // Don't fail the recovery if WhatsApp fails
  }

  // Create audit log
  console.log('📝 Creating audit log...');
  await adminDb.collection('audit_logs').add({
    action: 'registration_recovered',
    resource_type: 'registration',
    resource_id: regId,
    actor_type: 'system',
    actor_id: 'admin_recovery',
    details: {
      member_id: memberId,
      registration_type: registrationType,
      transaction_id: transactionId,
      amount: pendingData.amount,
      original_created_at: pendingData.created_at,
    },
    timestamp,
  });
  console.log('✅ Audit log created');

  console.log('🎉 Recovery complete!');
  
  return {
    member_id: memberId,
    registration_id: regId,
    yc26_registration_number: newYC26Counter,
    phone_number: pendingData.phone_number,
    full_name: pendingData.full_name,
    amount: pendingData.amount,
  };
  } catch (error) {
    console.error('❌ Error in processRegistration:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    throw error;
  }
}
