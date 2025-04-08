import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-[#F0F7FF] to-[#F5F3FF] p-4">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-indigo-600">404</h1>
        <h2 className="mb-4 text-3xl font-semibold text-gray-800">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-600">
          Oops! The page you are looking for does not seem to exist.
        </p>
        <Button
          asChild
          className="bg-indigo-600 text-white hover:bg-indigo-700"
        >
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
