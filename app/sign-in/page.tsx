'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton } from '../../components/auth/SignInButton';
import { auth } from '../../lib/firebase';

export default function SignInPage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is already authenticated
        if (auth.currentUser) {
            router.push('/home');
        }
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create time capsules to preserve your memories
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <div className="flex justify-center">
                        <SignInButton />
                    </div>
                </div>
            </div>
        </div>
    );
}