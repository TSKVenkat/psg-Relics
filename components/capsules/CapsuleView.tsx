'use client'
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Capsule } from '../../types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface CapsuleViewProps {
    capsuleId: string;
}

export const CapsuleView = ({ capsuleId }: CapsuleViewProps) => {
    const [capsule, setCapsule] = useState<Capsule | null>(null);
    const [loading, setLoading] = useState(true);
    const [shareEmail, setShareEmail] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [shareSuccess, setShareSuccess] = useState(false);
    const [shareError, setShareError] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        const fetchCapsule = async () => {
            if (!capsuleId) return;

            try {
                setLoading(true);
                const docRef = doc(db, 'capsules', capsuleId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Proper handling of Firestore timestamps
                    const createdAt = data.createdAt?.toDate ?
                        data.createdAt.toDate() :
                        new Date(data.createdAt);

                    const unlockDate = data.unlockDate?.toDate ?
                        data.unlockDate.toDate() :
                        new Date(data.unlockDate);

                    setCapsule({
                        id: docSnap.id,
                        ...data,
                        createdAt,
                        unlockDate
                    } as Capsule);
                }
            } catch (err) {
                console.error('Error fetching capsule:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCapsule();
    }, [capsuleId]);

    const formatDate = (date: Date | string | number) => {
        if (!date) return 'Not specified';

        const d = date instanceof Date ? date : new Date(date);

        // Check if date is valid
        if (isNaN(d.getTime())) return 'Not specified';

        return d.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isUnlocked = () => {
        if (!capsule?.unlockDate) return true;

        const unlockDate = capsule.unlockDate instanceof Date ?
            capsule.unlockDate :
            new Date(capsule.unlockDate);

        if (isNaN(unlockDate.getTime())) return true;

        return new Date() >= unlockDate;
    };

    const handleShareCapsule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isUnlocked()) {
            setShareError('This capsule cannot be shared until it is unlocked.');
            return;
        }

        if (!shareEmail || !shareEmail.includes('@')) {
            setShareError('Please enter a valid email address');
            return;
        }

        if (!capsule) return;

        setIsSharing(true);
        setShareError('');
        setShareSuccess(false);

        try {
            // Generate share URL
            const shareUrl = `${window.location.origin}/home/view-capsule/${capsuleId}?shared=true`;

            // Update capsule with shared info if not already shared
            if (!capsule.sharedWith || !capsule.sharedWith.includes(shareEmail)) {
                const docRef = doc(db, 'capsules', capsuleId);
                const updatedSharedWith = [...(capsule.sharedWith || []), shareEmail];

                await updateDoc(docRef, {
                    sharedWith: updatedSharedWith
                });

                // Update local state
                setCapsule({
                    ...capsule,
                    sharedWith: updatedSharedWith
                });
            }

            // Send share email notification
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'capsuleShare',
                    data: {
                        toEmail: shareEmail,
                        fromName: capsule.ownerName || 'Someone',
                        capsuleName: capsule.name,
                        shareUrl
                    }
                }),
            });

            const result = await response.json();

            if (result.success) {
                setShareSuccess(true);
                setShareEmail('');
            } else {
                setShareError('Failed to send share email. Please try again.');
            }
        } catch (err) {
            console.error('Error sharing capsule:', err);
            setShareError('An error occurred while sharing the capsule');
        } finally {
            setIsSharing(false);
        }
    };

    const downloadAllFiles = async () => {
        if (!capsule?.files || capsule.files.length === 0 || !isUnlocked()) return;

        setIsDownloading(true);
        try {
            const zip = new JSZip();
            const filesFolder = zip.folder("capsule-files");

            // Download each file and add to the zip
            const downloadPromises = capsule.files.map(async (file) => {
                try {
                    const response = await fetch(file.url);
                    const blob = await response.blob();
                    if (filesFolder) {
                        filesFolder.file(file.name, blob);
                    }
                    return true;
                } catch (error) {
                    console.error(`Error downloading file ${file.name}:`, error);
                    return false;
                }
            });

            await Promise.all(downloadPromises);

            // Generate the zip file
            const content = await zip.generateAsync({ type: "blob" });

            // Save the zip file
            const zipFileName = `${capsule.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_capsule.zip`;
            saveAs(content, zipFileName);
        } catch (error) {
            console.error('Error creating zip file:', error);
            alert('Failed to download all files. Please try again later.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading || !capsule) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-black rounded-lg shadow-lg p-16 border mb-128">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{capsule.name}</h1>
                    <p className="text-gray-500 text-md">{capsule.description}</p>
                </div>
                <div className="flex flex-col md:items-end gap-3">
                    <div className={`px-4 py-2 rounded-full text-base font-medium ${isUnlocked() ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {isUnlocked() ? 'Unlocked' : 'Locked'}
                    </div>

                    {isUnlocked() && capsule.files && capsule.files.length > 0 && (
                        <button
                            onClick={downloadAllFiles}
                            disabled={isDownloading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
                        >
                            {isDownloading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                    <span>Preparing Files...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                    </svg>
                                    <span>Download All Files</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 bg-gray-800 p-6 rounded-lg">
                <div className="bg-gray-800 p-4 rounded-md shadow-sm hover:bg-gray-700 transition-colors cursor-pointer duration-300 ease">
                    <p className="font-medium mb-1">Created by</p>
                    <p className="text-gray-500 font-semibold text-lg">{capsule.ownerName || 'Unknown'}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-md shadow-sm hover:bg-gray-700 transition-colors cursor-pointer duration-300 ease">
                    <p className="font-medium mb-1">Created on</p>
                    <p className="text-gray-500 font-semibold text-lg">{formatDate(capsule.createdAt)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-md shadow-sm hover:bg-gray-700 transition-colors cursor-pointer duration-300 ease">
                    <p className="font-medium mb-1">Unlocks on</p>
                    <p className="text-gray-500 font-semibold text-lg">{formatDate(capsule.unlockDate)}</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-md shadow-sm hover:bg-gray-700 transition-colors cursor-pointer duration-300 ease">
                    <p className="font-medium mb-1">Number of items</p>
                    <p className="text-gray-500 font-semibold text-lg">{capsule.files?.length || 0} files</p>
                </div>
            </div>

            {!isUnlocked() && (
                <div className="mb-8">
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-800 hover:bg-gray-700 transition-colors duration-300 ease">
                        <div className="flex items-center gap-3 mb-4">
                            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <h3 className="text-xl font-bold">This Capsule is Locked</h3>
                        </div>
                        <p className="text-gray-500 text-base mb-2">
                            This time capsule is currently locked and will become available on {formatDate(capsule.unlockDate)}.
                        </p>
                        <p className="text-gray-500 text-base">
                            You'll be able to view its contents, download files, and share it with others once it unlocks.
                        </p>
                    </div>
                </div>
            )}

            {isUnlocked() && (
                <>
                    <div className="mb-8">
                        <div className="border border-gray-200 rounded-lg p-6 bg-gray-800 hover:bg-gray-700 transition-colors duration-300 ease">
                            <h3 className="text-xl font-bold mb-3">Share this Capsule</h3>
                            <p className="text-gray-500 text-base mb-5">
                                Share this time capsule with friends or family by sending them an email invitation.
                            </p>

                            <form onSubmit={handleShareCapsule} className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="email"
                                    placeholder="Enter email address"
                                    className="flex-grow px-4 py-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                                    value={shareEmail}
                                    onChange={(e) => setShareEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 font-medium transition-colors duration-300 ease"
                                    disabled={isSharing}
                                >
                                    {isSharing ? 'Sharing...' : 'Share Capsule'}
                                </button>
                            </form>

                            {shareError && (
                                <div className="mt-4 p-3 bg-red-900 border-l-4 border-red-500 text-gray-300">
                                    {shareError}
                                </div>
                            )}

                            {shareSuccess && (
                                <div className="mt-4 p-3 bg-green-900 border-l-4 border-green-500 text-gray-300">
                                    Capsule shared successfully! An email invitation has been sent.
                                </div>
                            )}

                            {capsule.sharedWith && capsule.sharedWith.length > 0 && (
                                <div className="mt-5 pt-4 border-t border-gray-700">
                                    <p className="text-gray-400 font-medium mb-3">Previously shared with:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {capsule.sharedWith.map((email, index) => (
                                            <div key={index} className="text-sm bg-gray-900 px-3 py-2 rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors duration-300 ease">
                                                {email}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {capsule.files && capsule.files.length > 0 && (
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="text-2xl font-bold">Capsule Contents</h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {capsule.files.map((file) => (
                                    <div key={file.id} className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-sm hover:shadow-md hover:bg-gray-700 transition-all duration-300 ease">
                                        {file.type === 'image' && (
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
                                                <div className="relative h-48">
                                                    <img
                                                        src={file.url}
                                                        alt={file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </a>
                                        )}
                                        {file.type === 'video' && (
                                            <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 ease">
                                                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                    </svg>
                                                </a>
                                            </div>
                                        )}
                                        {file.type === 'document' && (
                                            <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-300 ease">
                                                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                                    </svg>
                                                </a>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <p className="text-base font-medium text-gray-300 mb-2 truncate" title={file.name}>{file.name}</p>
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                download={file.name}
                                                className="flex items-center gap-1 text-sm text-green-500 hover:text-green-400 font-medium transition-colors duration-300 ease"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                                </svg>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};