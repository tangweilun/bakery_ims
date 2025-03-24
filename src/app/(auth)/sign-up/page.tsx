"use client";

export const dynamic = "force-dynamic"; // Prevents pre-rendering errors

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle email/password sign up
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // Create user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        // options: {
        //   data: {
        //     business_name: businessName,
        //   },
        // },
      });

      if (signUpError) throw signUpError;

      // Check if user already exists
      // When a user tries to sign up with an existing email, Supabase will return a user object
      // but with identities as an empty array
      if (data?.user?.identities && data.user.identities.length === 0) {
        setError("This email is already registered. Please sign in instead.");
        setLoading(false);
        return;
      }

      // Check if confirmation is required by looking at the session
      if (!data.session) {
        // No session means email confirmation is required
        router.push(`/sign-up/confirmation?email=${encodeURIComponent(email)}`);
      } else {
        // Session exists, user is auto-confirmed
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        // Some Supabase configurations might throw an explicit error for existing users
        if (error.message?.includes("already registered")) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(error.message || "Error creating account");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign up
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error instanceof Error) throw error;
      // Redirect is handled by OAuth flow
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message || "Error signing up with Google");
        setLoading(false);
      }
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
                Create your BakeryTrack account
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Get started managing your bakery operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert className="bg-red-50 text-red-600 border-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Google Sign Up Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 flex items-center justify-center gap-2"
                onClick={handleGoogleSignUp}
                disabled={loading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  width="24px"
                  height="24px"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  />
                </svg>
                Sign up with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="bakery@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder=""
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
