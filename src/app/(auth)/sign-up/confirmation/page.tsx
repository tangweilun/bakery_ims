"use client";

export const dynamic = "force-dynamic";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Create a client component that uses useSearchParams
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleResendEmail = async () => {
    if (!email) {
      setResendStatus("Error: Email address is missing");
      return;
    }

    setResendLoading(true);
    setResendStatus(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) throw error;

      setResendStatus("Verification email resent! Please check your inbox.");
    } catch (error) {
      if (error instanceof Error) {
        setResendStatus(`Error: ${error.message || "Failed to resend email"}`);
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#F0F7FF] to-[#F5F3FF] flex flex-col">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          BakeryTrack
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-indigo-100 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-gray-800">
                Check your email
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                We&apos;ve sent you a verification link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="py-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-indigo-600"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              {email ? (
                <p className="text-gray-700">
                  We&apos;ve sent a verification link to{" "}
                  <span className="font-medium">{email}</span>. Please check
                  your email inbox and click on the link to complete your
                  registration.
                </p>
              ) : (
                <p className="text-gray-700">
                  Please check your email inbox and click on the verification
                  link to complete your registration.
                </p>
              )}

              <p className="text-sm text-gray-500 mt-4">
                If you don&apos;t see the email, check your spam folder or try
                again in a few minutes.
              </p>

              {resendStatus && (
                <Alert
                  className={
                    resendStatus.includes("Error")
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-green-50 text-green-600 border-green-200"
                  }
                >
                  <AlertDescription>{resendStatus}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleResendEmail}
                disabled={resendLoading}
              >
                {resendLoading ? "Sending..." : "Resend verification email"}
              </Button>

              <Link href="/sign-up" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  Back to sign up
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-r from-[#F0F7FF] to-[#F5F3FF] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-700">Loading...</p>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
