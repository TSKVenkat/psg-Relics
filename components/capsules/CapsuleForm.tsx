'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { CreateCapsuleFormData } from '../../types';
import { validateFileSize, getFileType } from '../../lib/utils';
import { useAuth } from '../auth/AuthProvider';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';

export const CapsuleForm: React.FC = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<CreateCapsuleFormData>({
        defaultValues: {
            name: '',
            description: '',
            unlockDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            files: [],
        },
    });

    // Ensure authentication persistence is set to local
    useEffect(() => {
        const auth = getAuth();
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                console.log("Authentication persistence set to local");
            })
            .catch((error) => {
                console.error("Error setting authentication persistence:", error);
            });
    }, []);

    // Check authentication status with delay to ensure Firebase Auth is initialized
    useEffect(() => {
        const auth = getAuth();

        // First check immediately
        if (auth.currentUser) {
            console.log("User is authenticated immediately:", auth.currentUser.uid);
            setAuthStatus('authenticated');
        } else {
            // If not authenticated immediately, set up listener with short delay
            const checkAuth = setTimeout(() => {
                const unsubscribe = auth.onAuthStateChanged((user) => {
                    if (user) {
                        console.log("User is authenticated after delay:", user.uid);
                        setAuthStatus('authenticated');
                    } else {
                        console.log("User is not authenticated after delay");
                        setAuthStatus('unauthenticated');
                    }
                });

                return () => {
                    unsubscribe();
                    clearTimeout(checkAuth);
                };
            }, 1000); // 1 second delay

            return () => clearTimeout(checkAuth);
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles: File[]) => {
            // Validate file sizes
            const validFiles = acceptedFiles.filter(file => {
                const isValid = validateFileSize(file);
                if (!isValid) {
                    setFileError(`File ${file.name} exceeds the 10MB limit`);
                }
                return isValid;
            });

            setFiles(prevFiles => [...prevFiles, ...validFiles]);
            setValue('files', [...files, ...validFiles]);
        },
        maxSize: 10 * 1024 * 1024, // 10MB
    });

    const removeFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        setValue('files', files.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: CreateCapsuleFormData) => {
        // Get current auth state directly
        const auth = getAuth();
        if (!auth.currentUser) {
            console.error("No authenticated user found at submission time");
            setFileError('You must be logged in to create a time capsule.');
            return;
        }

        setLoading(true);
        setFileError(null);

        try {
            const currentUser = auth.currentUser;
            console.log("Current user:", currentUser.uid);

            const formData = new FormData();

            // Add user authentication information to form data
            formData.append("userId", currentUser.uid);
            formData.append("userEmail", currentUser.email || "");
            formData.append("userName", currentUser.displayName || "");

            formData.append("name", data.name);
            formData.append("description", data.description);

            // Ensure unlockDate is a Date object before calling toISOString()
            const unlockDate = new Date(data.unlockDate);
            if (isNaN(unlockDate.getTime())) {
                throw new Error("Invalid unlock date");
            }
            formData.append("unlockDate", unlockDate.toISOString());

            files.forEach((file) => {
                formData.append('files', file);
            });

            console.log("Submitting form data with user ID:", currentUser.uid);
            const response = await fetch('/api/create-capsule', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("API error:", result);
                throw new Error(result.error || 'Failed to create capsule');
            }

            console.log("Capsule created successfully:", result);
            router.push('/home');

        } catch (error) {
            console.error('Error creating capsule:', error);
            setFileError(error instanceof Error ? error.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Add additional check before rendering form to ensure authentication
    const renderContent = () => {
        const auth = getAuth();
        if (!auth.currentUser && authStatus === 'authenticated') {
            console.log("Auth state mismatch - rechecking status");
            setAuthStatus('checking');
            setTimeout(() => {
                setAuthStatus(auth.currentUser ? 'authenticated' : 'unauthenticated');
            }, 1000);
        }

        if (authStatus === 'checking') {
            return <div className="text-center p-4">Checking authentication status...</div>;
        }

        if (authStatus === 'unauthenticated') {
            return (
                <div className="text-center p-4">
                    <p className="text-red-600 mb-4">You must be logged in to create a time capsule.</p>
                    <button
                        onClick={() => router.push('/sign-in')}
                        className="px-4 py-2 bg-primary text-black rounded-md"
                    >
                        Go to Login
                    </button>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-black p-6 rounded-md">
                {fileError && (
                    <div className="p-3 bg-red-500 text-white border border-white rounded">
                        {fileError}
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white">
                        Capsule Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name', { required: 'Name is required' })}
                        className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm bg-black text-white focus:outline-none focus:ring-white focus:border-white"
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white">
                        Description
                    </label>
                    <textarea
                        id="description"
                        rows={3}
                        {...register('description')}
                        className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm bg-black text-white focus:outline-none focus:ring-white focus:border-white"
                    />
                </div>

                <div>
                    <label htmlFor="unlockDate" className="block text-sm font-medium text-white">
                        Unlock Date
                    </label>
                    <input
                        id="unlockDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        {...register('unlockDate', { required: 'Unlock date is required' })}
                        className="mt-1 block w-full px-3 py-2 border border-white rounded-md shadow-sm bg-black text-white focus:outline-none focus:ring-white focus:border-white"
                    />
                    {errors.unlockDate && (
                        <p className="mt-1 text-sm text-red-400">{errors.unlockDate.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        Upload Files (Images, Videos, Documents)
                    </label>
                    <div
                        {...getRootProps()}
                        className="border-2 border-dashed border-white rounded-md p-6 text-center cursor-pointer hover:border-gray-300 bg-black text-white"
                    >
                        <input {...getInputProps()} />
                        <p className="text-white">
                            Drag &amp; drop files here, or click to select files
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Max file size: 10MB
                        </p>
                    </div>
                    {fileError && (
                        <p className="mt-1 text-sm text-red-400">{fileError}</p>
                    )}

                    {files.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-white mb-2">Selected Files:</h4>
                            <ul className="space-y-2">
                                {files.map((file, index) => (
                                    <li key={index} className="flex justify-between items-center p-2 bg-gray-900 rounded">
                                        <span className="text-sm text-white truncate">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-400 hover:text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-2">
                        Logged in as: {auth.currentUser?.email || "Unknown"}
                    </p>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-white rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                    >
                        {loading ? (
                            <>
                                <span className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></span>
                                Creating Capsule...
                            </>
                        ) : (
                            'Create Time Capsule'
                        )}
                    </button>
                </div>
            </form>

        );
    };

    return renderContent();
};