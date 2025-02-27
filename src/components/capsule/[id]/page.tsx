// src/app/capsule/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getCapsule } from '@/lib/db';
import { Capsule } from '@/types';

export default function CapsuleDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [capsule, setCapsule] = useState<Capsule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user && id) {
            loadCapsule();
        }
    }, [user, id]);

    const loadCapsule = async () => {
        try {
            setLoading(true);
            const capsuleData = await getCapsule(id as string);

            if (!capsuleData) {
                setError('Capsule not found');
                return;
            }

            if (capsuleData.userId !== user!.uid) {
                setError('You do not have permission to view this capsule');
                return;
            }

            setCapsule(capsuleData);
        } catch (error) {
            console.error('Error loading capsule:', error);
            setError('Failed to load capsule');
        } finally {
            setLoading(false);
        }
    };

    const isUnlocked = () => {
        if (!capsule) return false;
        return !capsule.isLocked || new Date() >= capsule.lockUntil;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <AuthGuard>
                <div className="max-w-4xl mx-auto px-4 py-10 text-center">
                    Loading capsule...
                </div>
            </AuthGuard>
        );
    }

    if (error) {
        return (
            <AuthGuard>
                <div className="max-w-4xl mx-auto px-4 py-10">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                    <button
                        onClick={() => router.push('/home')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                    >
                        Back to Home
                    </button>
                </div>
            </AuthGuard>
        );
    }

    if (!capsule) {
        return (
            <AuthGuard>
                <div className="max-w-4xl mx-auto px-4 py-10 text-center">
                    Capsule not found
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/home')}
                        className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-gray-700"
                    >
                        ← Back to Home
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-bold">{capsule.title}</h1>
                            <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${isUnlocked()
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}
                            >
                                {isUnlocked() ? 'Unlocked' : 'Locked'}
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="text-sm text-gray-500 mb-1">
                                Created on {formatDate(capsule.createdAt)}
                            </div>
                            {!isUnlocked() && (
                                <div className="text-sm font-medium text-blue-600">
                                    Will unlock on {formatDate(capsule.lockUntil)}
                                </div>
                            )}
                        </div>

                        {!isUnlocked() ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6 text-center">
                                <h2 className="text-xl font-semibold mb-2">This capsule is still locked</h2>
                                <p className="text-gray-600 mb-4">
                                    You can view this capsule after {formatDate(capsule.lockUntil)}
                                </p>
                                <div className="text-sm text-gray-500">
                                    You will receive an email notification when it unlocks.
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                                    <p className="text-gray-700 whitespace-pre-wrap">{capsule.description}</p>
                                </div>

                                {capsule.mediaUrls && capsule.mediaUrls.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4">Media</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {capsule.mediaUrls.map((media, index) => (
                                                <div key={index} className="border rounded-lg overflow-hidden">
                                                    {media.type === 'image' ? (
                                                        <div>
                                                            <img
                                                                src={media.url}
                                                                alt={media.name}
                                                                className="w-full h-48 object-cover"
                                                            />
                                                            <div className="p-2 text-sm">{media.name}</div>
                                                        </div>
                                                    ) : media.type === 'video' ? (
                                                        <div>
                                                            <video
                                                                src={media.url}
                                                                controls
                                                                className="w-full h-48 object-cover"
                                                            ></video>
                                                            <div className="p-2 text-sm">{media.name}</div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4">
                                                            <div className="flex items-center mb-2">
                                                                <svg
                                                                    className="w-6 h-6 text-gray-500 mr-2"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                                                    ></path>
                                                                </svg>
                                                                <span className="text-sm">{media.name}</span>
                                                            </div>
                                                            <a
                                                                href={media.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 text-sm"
                                                            >
                                                                Download Document
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthGuard>
    );
}