// Test Firebase Phone Auth SMS
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OTPVerificationModal } from "@/components/auth/OTPVerificationModal";
import { Loader2, Phone, MessageSquare } from "lucide-react";

export default function TestSMSPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendWhatsAppOTP = async () => {
    setIsSending(true);
    setError(null);

    try {
      // Format phone number
      const formattedPhone = phoneNumber.startsWith("+91")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const response = await fetch("/api/auth/send-otp-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: formattedPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      console.log("✅ SMS OTP sent:", data);
      if (data.otp_dev_only) {
        console.log("🔑 OTP (DEV MODE):", data.otp_dev_only);
      }

      setShowOTPModal(true);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerificationSuccess = () => {
    console.log("🎉 Verification successful!");
    setShowOTPModal(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Test SMS Authentication</CardTitle>
          <CardDescription>
            Test Firebase Phone Auth with real SMS delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="text-center space-y-4 py-8">
              <div className="text-6xl">🎉</div>
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                Authentication Successful!
              </h3>
              <p className="text-muted-foreground">
                Your phone number has been verified and you are now authenticated.
              </p>
              <Button
                onClick={() => {
                  setSuccess(false);
                  setPhoneNumber("");
                }}
                variant="outline"
              >
                Test Again
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Phone Number (Indian)
                </label>
                <div className="flex gap-2">
                  <Input
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="text-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter 10-digit Indian mobile number (starts with 6-9)
                </p>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  onClick={handleSendWhatsAppOTP}
                  disabled={phoneNumber.length !== 10 || isSending}
                  className="w-full"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Send SMS OTP
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Primary method: SMS via Firebase
                  <br />
                  WhatsApp temporarily disabled
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  How it works:
                </h4>
                <ol className="text-xs space-y-1 text-muted-foreground">
                  <li>1. Enter your phone number</li>
                  <li>2. Click &#34;Send SMS OTP&#34;</li>
                  <li>3. Receive 6-digit code via SMS</li>
                  <li>4. Enter code to verify</li>
                  <li>5. Get authenticated with Firebase ✅</li>
                </ol>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  <strong>Dev Mode:</strong> Check console for OTP. In production, real SMS will be sent via Firebase Phone Auth.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={phoneNumber.startsWith("+91") ? phoneNumber : `+91${phoneNumber}`}
        onVerificationSuccess={handleVerificationSuccess}
      />

      {/* reCAPTCHA container (invisible) */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
