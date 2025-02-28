'use client'
import React, { useState } from 'react';
import { signOut } from '../../lib/auth';
import { useRouter } from "next/navigation"; // ✅ Correct for Next.js 13+

const SignOutButton: React.FC = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        try {
            setIsLoading(true);
            await signOut();
            router.push('/sign-in');
        } catch (error) {
            console.error('Failed to sign out:', error);
            // Optionally handle error state here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="inline-flex items-center justify-center px-6 py-3 text-base sm:text-lg
                     border border-white rounded-full
                     transition-all duration-300 ease-out
                     hover:-translate-y-1 hover:scale-105
                     hover:bg-white hover:text-black
                     focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black
                     active:scale-95">
            {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
    );
};

export default SignOutButton;