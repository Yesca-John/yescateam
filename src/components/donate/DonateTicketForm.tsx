// Donate Ticket Form Component
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Heart, Ticket, IndianRupee } from "lucide-react";
import { OTPVerificationModal } from "@/components/auth/OTPVerificationModal";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";

const TICKET_PRICE = 300;

interface DonateFormData {
  name: string;
  phone_number: string;
  number_of_tickets: number;
  total_amount: number;
}

export function DonateTicketForm() {
  const [formData, setFormData] = useState<DonateFormData>({
    name: "",
    phone_number: "",
    number_of_tickets: 1,
    total_amount: TICKET_PRICE,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DonateFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<DonateFormData | null>(null);

  // Fetch donation stats
  useEffect(() => {
    fetchDonationStats();
  }, []);

  const fetchDonationStats = async () => {
    try {
      const response = await fetch("/api/donate/stats");
      const data = await response.json();
      
      if (data.success) {
        // Update the DOM elements
        const availableEl = document.getElementById("available-tickets");
        const totalEl = document.getElementById("total-donated");
        if (availableEl) availableEl.textContent = data.available_tickets.toString();
        if (totalEl) totalEl.textContent = data.total_donated.toString();
      }
    } catch (error) {
      console.error("Error fetching donation stats:", error);
    }
  };

  // Update total amount when number of tickets changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total_amount: prev.number_of_tickets * TICKET_PRICE,
    }));
  }, [formData.number_of_tickets]);

  // Validate phone number (Indian format)
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone number (only digits)
    if (name === "phone_number") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitsOnly }));
    } 
    // Special handling for number of tickets
    else if (name === "number_of_tickets") {
      const num = parseInt(value) || 1;
      const validNum = Math.max(1, Math.min(100, num)); // Between 1 and 100
      setFormData(prev => ({ ...prev, [name]: validNum }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name as keyof DonateFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DonateFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.phone_number) {
      newErrors.phone_number = "Phone number is required";
    } else if (!validatePhone(formData.phone_number)) {
      newErrors.phone_number = "Invalid phone number (10 digits, starting with 6-9)";
    }

    if (formData.number_of_tickets < 1) {
      newErrors.number_of_tickets = "At least 1 ticket required";
    } else if (formData.number_of_tickets > 100) {
      newErrors.number_of_tickets = "Maximum 100 tickets per donation";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle phone verification and form submission
  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // If already verified, proceed to payment
    if (isVerified) {
      await handleSubmit();
      return;
    }

    // Otherwise, verify phone number first
    setIsSendingOTP(true);
    setFormDataToSubmit(formData);

    try {
      const formattedPhone = `+91${formData.phone_number}`;
      
      const response = await fetch("/api/auth/send-otp-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: formattedPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      console.log("📱 OTP sent to:", formattedPhone);
      if (data.otp_dev_only) {
        console.log("🔑 OTP (DEV MODE):", data.otp_dev_only);
      }

      setShowOTPModal(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert(error instanceof Error ? error.message : "Failed to send OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  // Handle successful phone verification
  const handleVerificationSuccess = async () => {
    console.log("✅ Phone verification successful");
    setShowOTPModal(false);
    setIsVerified(true);

    // Wait for auth state to update
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user is authenticated
    const user = auth.currentUser;
    if (user) {
      console.log("✅ User authenticated, proceeding to payment");
      await handleSubmit();
    } else {
      console.log("⚠️ Waiting for auth state...");
      // Listen for auth state change
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("✅ Auth state updated, proceeding to payment");
          unsubscribe();
          await handleSubmit();
        }
      });
    }
  };

  // Submit donation and proceed to payment
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Get Firebase ID token
      const idToken = await user.getIdToken();

      // Create donation record
      const response = await fetch("/api/donate/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(formDataToSubmit || formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create donation");
      }

      console.log("✅ Donation created:", data.donation_id);

      // Initiate payment
      const paymentResponse = await fetch("/api/payment/donate/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          donation_id: data.donation_id,
          amount: (formDataToSubmit || formData).total_amount,
          phone_number: `+91${(formDataToSubmit || formData).phone_number}`,
          name: (formDataToSubmit || formData).name,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Failed to initiate payment");
      }

      console.log("✅ Payment initiated");

      // Redirect to payment gateway
      if (paymentData.payment_url) {
        window.location.href = paymentData.payment_url;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert(error instanceof Error ? error.message : "Failed to submit donation");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            Donation Details
          </CardTitle>
          <CardDescription>
            Fill in your details to donate tickets to those in need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyAndSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting || isSendingOTP}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone_number">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-muted rounded-md border">
                  <span className="text-muted-foreground">+91</span>
                </div>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone_number}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={isSubmitting || isSendingOTP}
                  className={errors.phone_number ? "border-red-500" : ""}
                />
              </div>
              {errors.phone_number && (
                <p className="text-sm text-red-500">{errors.phone_number}</p>
              )}
              {isVerified && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Phone number verified
                </p>
              )}
            </div>

            {/* Number of Tickets */}
            <div className="space-y-2">
              <Label htmlFor="number_of_tickets">
                Number of Tickets <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    number_of_tickets: Math.max(1, prev.number_of_tickets - 1)
                  }))}
                  disabled={formData.number_of_tickets <= 1 || isSubmitting || isSendingOTP}
                >
                  -
                </Button>
                <Input
                  id="number_of_tickets"
                  name="number_of_tickets"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.number_of_tickets}
                  onChange={handleChange}
                  disabled={isSubmitting || isSendingOTP}
                  className={`text-center ${errors.number_of_tickets ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    number_of_tickets: Math.min(100, prev.number_of_tickets + 1)
                  }))}
                  disabled={formData.number_of_tickets >= 100 || isSubmitting || isSendingOTP}
                >
                  +
                </Button>
              </div>
              {errors.number_of_tickets && (
                <p className="text-sm text-red-500">{errors.number_of_tickets}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Each ticket costs ₹{TICKET_PRICE}
              </p>
            </div>

            {/* Total Amount Display */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {formData.number_of_tickets} {formData.number_of_tickets === 1 ? "Ticket" : "Tickets"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {formData.total_amount}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your generous donation will help {formData.number_of_tickets} {formData.number_of_tickets === 1 ? "person" : "people"} attend YESCA
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
              disabled={isSubmitting || isSendingOTP}
            >
              {isSendingOTP ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending OTP...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : isVerified ? (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Proceed to Payment
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-5 w-5" />
                  Verify Phone & Donate
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By proceeding, you agree to donate {formData.number_of_tickets} {formData.number_of_tickets === 1 ? "ticket" : "tickets"} worth ₹{formData.total_amount} to help others attend YESCA events
            </p>
          </form>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phoneNumber={`+91${formData.phone_number}`}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </>
  );
}
