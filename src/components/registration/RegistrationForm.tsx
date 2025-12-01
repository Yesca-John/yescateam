// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Registration Form Component - Clean Structure with Field Configuration
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { RegistrationType, REGISTRATION_CONFIGS } from '@/lib/registration/types';
import { DynamicFormSection } from './DynamicFormSection';
import { PriceSelector } from './PriceSelector';
import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

// Zod Schema - Defined in Form Component
const registrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone_number: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number'),
  gender: z.enum(['M', 'F'], { message: 'Please select gender' }),
  age: z.number().min(15, 'Age must be at least 15 years').max(40, 'Age must not exceed 40 years'),
  dob: z.string().optional(),
  believer: z.enum(['yes', 'no'], { message: 'Please select believer status' }),
  church_name: z.string().min(2, 'Church name is required'),
  address: z.string().min(3, 'Address is required'),
  fathername: z.string().optional(),
  marriage_status: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  baptism_date: z.string().optional(),
  camp_participated_since: z.string().optional(),
  education: z.string().optional(),
  occupation: z.string().optional(),
  future_goals: z.string().optional(),
  current_skills: z.string().optional(),
  desired_skills: z.string().optional(),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  registrationType: RegistrationType;
  onSubmit: (data: RegistrationFormData, amount: number) => Promise<void>;
  isLoading?: boolean;
}

// Field Configuration - Clean JSON-like structure (Single Section)
const formSections = [
  {
    title: "Registration Details",
    titleTe: "నమోదు వివరాలు",
    description: "Please fill in all required fields",
    descriptionTe: "దయచేసి అన్ని అవసరమైన ఫీల్డ్‌లను పూరించండి",
    fields: [
      { name: "full_name", type: "input" as const, label: "Full Name - పూర్తి పేరు", required: true, placeholder: "Enter your full name" },
      { name: "phone_number", type: "input" as const, label: "Phone Number - ఫోన్ నంబర్", required: true, placeholder: "10-digit mobile number" },
      { name: "gender", type: "radio" as const, label: "Gender - లింగం", required: true, options: [
        { value: "M", label: "Male (పురుషుడు)" },
        { value: "F", label: "Female (స్త్రీ)" },
      ]},
      { name: "age", type: "number" as const, label: "Age - వయస్సు", required: true, placeholder: "Enter your age" },
      { name: "dob", type: "date" as const, label: "Date of Birth - పుట్టిన తేదీ" },
      { name: "fathername", type: "input" as const, label: "Father Name", placeholder: "Enter father's name" },
      { name: "believer", type: "radio" as const, label: "Believer?", required: true, options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ]},
      { name: "church_name", type: "input" as const, label: "Church - సంఘము", required: true, placeholder: "Enter your church name" },
      { name: "address", type: "input" as const, label: "Address - అడ్రస్", required: true, placeholder: "Enter your full address" },
      { name: "marriage_status", type: "select" as const, label: "Marriage Status - వైవాహిక స్థితి", options: [
        { value: "single", label: "Single" },
        { value: "married", label: "Married" },
        { value: "divorced", label: "Divorced" },
        { value: "widowed", label: "Widowed" },
      ]},
      { name: "baptism_date", type: "date" as const, label: "Date of Baptism - రక్షింపబడిన తేదీ" },
      { name: "camp_participated_since", type: "input" as const, label: "Camp Participated Since", placeholder: "e.g., YC25, YC24" },
      { name: "education", type: "input" as const, label: "Education - మీ చదువు", placeholder: "Your education level" },
      { name: "occupation", type: "input" as const, label: "Occupation - వృత్తి", placeholder: "Your occupation" },
      { name: "future_goals", type: "input" as const, label: "Future Goals - భవిష్యత్తు లక్ష్యాలు", placeholder: "Your future goals" },
      { name: "current_skills", type: "input" as const, label: "Current Skills - ప్రస్తుత నైపుణ్యాలు", placeholder: "Skills you currently have" },
      { name: "desired_skills", type: "input" as const, label: "Desired Skills", placeholder: "Skills you want to learn" },
    ],
  },
];

export function RegistrationForm({ 
  registrationType, 
  onSubmit,
  isLoading = false 
}: RegistrationFormProps) {
  const config = REGISTRATION_CONFIGS[registrationType];
  
  // Price state - default based on registration type
  const getDefaultPrice = () => {
    switch (registrationType) {
      case 'normal': return 300;
      case 'faithbox': return 50;
      case 'kids': return 300;
      default: return 300;
    }
  };
  
  const [selectedAmount, setSelectedAmount] = useState(getDefaultPrice());
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<RegistrationFormData | null>(null);
  
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phone_number: '',
      full_name: '',
      age: 0,
      marriage_status: 'single',
    },
  });

  const handleVerifyAndSubmit = async (data: RegistrationFormData) => {
    // Check if already verified
    if (isVerified) {
      // Already verified, proceed to payment
      try {
        await onSubmit(data, selectedAmount);
      } catch (error) {
        console.error('Registration error:', error);
      }
      return;
    }

    // Need to verify phone first
    setFormDataToSubmit(data);
    setIsSendingOTP(true);

    try {
      // Send OTP via WhatsApp
      const response = await fetch('/api/auth/send-otp-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: `+91${data.phone_number}` }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send OTP');
      }

      // Show OTP modal
      setShowOTPModal(true);
    } catch (error) {
      console.error('Send OTP error:', error);
      alert(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerificationSuccess = async () => {
    setIsVerified(true);
    setShowOTPModal(false);

    // Wait for auth state to be set
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && formDataToSubmit) {
        console.log('✅ User authenticated:', user.uid);
        // Proceed to payment
        try {
          await onSubmit(formDataToSubmit, selectedAmount);
        } catch (error) {
          console.error('Registration error:', error);
        }
      }
    });

    // Cleanup
    setTimeout(() => unsubscribe(), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">
          {config.title}
        </h1>
        <p className="text-xl text-muted-foreground">
          {config.titleTelugu}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleVerifyAndSubmit)} className="space-y-6">
        {/* Dynamic Form Sections */}
        {formSections.map((section, index) => (
          <DynamicFormSection
            key={index}
            section={section}
            form={form}
          />
        ))}

        {/* Price Selector */}
        <PriceSelector
          registrationType={registrationType}
          value={selectedAmount}
          onChange={setSelectedAmount}
        />

        {/* Verification Status */}
        {isVerified && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                Phone Verified Successfully
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                You can now proceed to payment
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-8">
          <Button
            type="submit"
            disabled={isLoading || isSendingOTP}
            className="w-full py-6 text-lg font-semibold rounded-full"
            size="lg"
          >
            {isSendingOTP ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending OTP...
              </>
            ) : isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : isVerified ? (
              "Proceed to Payment"
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Verify Phone & Continue
              </>
            )}
          </Button>
        </div>

        {/* OTP Verification Modal */}
        {formDataToSubmit && (
          <OTPVerificationModal
            isOpen={showOTPModal}
            onClose={() => setShowOTPModal(false)}
            phoneNumber={`+91${formDataToSubmit.phone_number}`}
            onVerificationSuccess={handleVerificationSuccess}
          />
        )}
      </form>
    </div>
  );
}
