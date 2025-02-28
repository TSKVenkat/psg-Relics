'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CapsuleForm } from '../../../components/capsules/CapsuleForm';
import { auth } from '../../../lib/firebase';

export default function CreateCapsulePage() {
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        if (!auth.currentUser) {
            router.push('/sign-in');
        }
    }, [router]);

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Create a New Time Capsule</h1>
            <div className="border shadow rounded-lg p-6">
                <CapsuleForm />
            </div>
        </div>
    );
}