"use client";

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
    <header className="sticky top-0 z-50 flex justify-between items-center px-6 h-16 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/95">
      <Link 
        href="/" 
        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
      >
        KANBAN SYNC
      </Link>

      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton>
            <button className="text-gray-700 hover:text-gray-900 rounded-lg font-medium text-sm px-4 py-2 transition-colors">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm px-4 py-2 transition-colors shadow-sm">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}