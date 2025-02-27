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
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 font-medium"
        >
            {isLoading ? 'Signing out...' : 'Sign Out'}
        </button>
    );
};

export default SignOutButton;