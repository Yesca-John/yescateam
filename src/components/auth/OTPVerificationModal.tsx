 // OTP Verification Modal Component
"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Smartphone, MessageSquare } from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signInWithCustomToken } from "firebase/auth";
import {
  initializeRecaptcha,
  sendFirebasePhoneOTP,
  verifyFirebaseSMSCode,
  cleanupRecaptcha,
} from "@/lib/auth/firebase-phone-auth";

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  onVerificationSuccess: () => void;
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  phoneNumber,
  onVerificationSuccess,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [method, setMethod] = useState<"whatsapp" | "sms">("sms");
  const [isWaitingForFirebaseSMS, setIsWaitingForFirebaseSMS] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || timeLeft === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      cleanupRecaptcha();
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input
  const handleOTPChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value.slice(-1); // Take only last character
    setOtp(newOTP);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value && newOTP.every((digit) => digit)) {
      handleVerifyOTP(newOTP.join(""));
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOTP = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOTP);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (pastedData.length === 6) {
      handleVerifyOTP(pastedData);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (otpValue: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      // Firebase SMS Flow - Firebase already authenticated the user
      if (method === "sms" && isWaitingForFirebaseSMS) {
        console.log('🔥 Verifying Firebase SMS code...');
        const firebaseResult = await verifyFirebaseSMSCode(otpValue);
        console.log('✅ Firebase SMS verified and user signed in!');
        setIsWaitingForFirebaseSMS(false);

        // Sync user data to Firestore (Firebase already signed user in)
        const response = await fetch("/api/auth/verify-firebase-sms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone_number: phoneNumber,
            firebase_uid: firebaseResult.uid,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to sync user data");
        }

        console.log("✅ User data synced to Firestore!");

        // Cleanup
        cleanupRecaptcha();

        // Success! User is already signed in via Firebase Phone Auth
        onVerificationSuccess();
        return;
      }

      // WhatsApp OTP Flow - Verify with our backend
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Sign in with custom token
      console.log("🔐 Signing in with custom token...");
      await signInWithCustomToken(auth, data.custom_token);
      console.log("✅ User authenticated successfully!");

      // Success!
      onVerificationSuccess();
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err instanceof Error ? err.message : "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      // Reset timer
      setTimeLeft(300);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsSending(false);
    }
  };

  // Switch to SMS using Firebase Phone Auth
  const handleSwitchToSMS = async () => {
    setIsSending(true);
    setError(null);

    try {
      // Step 1: Call our backend to store OTP
      const response = await fetch("/api/auth/send-otp-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to prepare SMS OTP");
      }

      // Step 2: Initialize Firebase reCAPTCHA
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        // Create container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'recaptcha-container';
        document.body.appendChild(container);
      }

      initializeRecaptcha(
        'recaptcha-container',
        () => console.log('reCAPTCHA verified'),
        (error) => {
          console.error('reCAPTCHA error:', error);
          setError('reCAPTCHA verification failed');
        }
      );

      // Step 3: Send SMS via Firebase
      console.log('🔥 Sending Firebase Phone Auth SMS...');
      await sendFirebasePhoneOTP(phoneNumber);
      console.log('✅ Firebase SMS sent successfully');

      // Update UI
      setMethod("sms");
      setIsWaitingForFirebaseSMS(true);
      setTimeLeft(300);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error('Firebase SMS error:', err);
      setError(err instanceof Error ? err.message : "Failed to send SMS OTP");
      cleanupRecaptcha();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Verify Phone Number
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter the 6-digit code sent to
            <br />
            <span className="font-semibold text-foreground">{phoneNumber}</span>
            <br />
            <span className="text-sm">
              via {method === "whatsapp" ? "WhatsApp" : "SMS"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OTP Input */}
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold rounded-lg"
                disabled={isVerifying}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Timer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {timeLeft > 0 ? (
                <>
                  Code expires in{" "}
                  <span className="font-semibold text-foreground">
                    {formatTime(timeLeft)}
                  </span>
                </>
              ) : (
                <span className="text-destructive">Code expired</span>
              )}
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerifyOTP(otp.join(""))}
            disabled={otp.some((d) => !d) || isVerifying}
            className="w-full"
            size="lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          {/* Resend & SMS Options */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={handleResend}
              disabled={!canResend || isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Resend OTP
                </>
              )}
            </Button>

            {method === "sms" && (
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={!canResend || isSending}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Resend SMS OTP
                  </>
                )}
              </Button>
            )}

            {method === "whatsapp" && (
              <Button
                variant="outline"
                onClick={handleSwitchToSMS}
                disabled={isSending}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Send via SMS Instead
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
