"use client"; // This is required because Clerk components are client-side

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 bg-[#0f0f0f]">
      <Link href="/" className="text-xl font-bold">
        HACKUTD 25
      </Link>

      {/* This div keeps your auth buttons grouped on the right */}
      <div className="flex items-center gap-4">
        <SignedOut>
          <SignInButton>
            <button className="text-ceramic-white rounded-full font-montserrat text-sm sm:text-base h-10 px-4 cursor-pointer">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-transparent border-2 border-[#554069] text-ceramic-white rounded-full font-montserrat text-sm sm:text-base h-10 px-4 cursor-pointer hover:bg-[#554069] transition-colors">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}
