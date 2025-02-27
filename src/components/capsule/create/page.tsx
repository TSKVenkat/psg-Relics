// src/app/capsule/create/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { createCapsule } from '@/lib/db';
import { uploadMediaToStorage } from '@/lib/storage';
import { sendCapsuleCreationEmail } from '@/lib/mail';
import { Media } from '@/types';

export default function CreateCapsulePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [unlockDate, setUnlockDate] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFiles(prevFiles => [...prevFiles, ...filesArray]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !unlockDate) {
            setError('Please fill in all required fields');
            return;
        }

        const unlockDateTime = new Date(unlockDate);
        if (unlockDateTime <= new Date()) {
            setError('Unlock date must be in the future');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            // Upload all media files
            const mediaPromises = files.map(file => uploadMediaToStorage(file, user!.uid));
            const mediaItems = await Promise.all(mediaPromises);

            // Create capsule
            const capsuleId = await createCapsule({
                userId: user!.uid,
                title,
                description,
                lockUntil: unlockDateTime,
                isLocked: true,
                mediaUrls: mediaItems,
            });

            // Send notification email
            if (user!.email) {
                await sendCapsuleCreationEmail(user!.email, title, unlockDateTime);
            }

            // Redirect to home page
            router.push('/home');
        } catch (error) {
            console.error('Error creating capsule:', error);
            setError('Failed to create capsule. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <AuthGuard>
            <div className="max-w-3xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-6">Create Time Capsule</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="unlockDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Unlock Date *
                        </label>
                        <input
                            type="date"
                            id="unlockDate"
                            value={unlockDate}
                            onChange={(e) => setUnlockDate(e.target.value)}
                            min={getTomorrow()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Add Media (Images, Videos, Documents)
                        </label>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            multiple
                        />

                        {files.length > 0 && (
                            <div className="mt-2">
                                <p className="text-sm font-medium mb-1">Selected Files:</p>
                                <ul className="space-y-1">
                                    {files.map((file, index) => (
                                        <li key={index} className="flex justify-between text-sm">
                                            <span>{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-2 px-4 rounded-md text-white font-medium ${isSubmitting
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {isSubmitting ? 'Creating Capsule...' : 'Create Time Capsule'}
                        </button>
                    </div>
                </form>
            </div>
        </AuthGuard>
    );
}