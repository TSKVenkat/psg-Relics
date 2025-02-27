import { format } from 'date-fns';
import { collection, query, where, getDocs, DocumentData, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { sendCapsuleNotification } from './emailUtils';

// Format date for display
export const formatDate = (date: any): string => {
    if (!date) return "Invalid Date";  // Handle null/undefined
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date"; // Handle invalid date
    return format(parsedDate, 'PPP');
};

// Format datetime for display
export const formatDateTime = (date: any): string => {
    if (!date) return "Invalid Date";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "Invalid Date";
    return format(parsedDate, 'PPp');
};

// Check if capsule unlock date has been reached
export const isCapsuleUnlocked = (unlockDate: Date): boolean => {
    const now = new Date();
    return now >= unlockDate;
};

// Generate a share URL for a capsule
export const generateShareUrl = (capsuleId: string): string => {
    return `${process.env.NEXT_PUBLIC_APP_URL}/home/view-capsule/${capsuleId}?shared=true`;
};

// Share a capsule with another user via email
export const shareCapsuleWithUser = async (
    capsuleId: string,
    toEmail: string,
    fromName: string,
    capsuleName: string
): Promise<boolean> => {
    try {
        // Generate share URL
        const shareUrl = generateShareUrl(capsuleId);

        // Update capsule document with new shared user
        const docRef = doc(db, 'capsules', capsuleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const capsule = docSnap.data();
            const sharedWith = [...(capsule.sharedWith || [])];

            // Check if already shared with this email
            if (!sharedWith.includes(toEmail)) {
                sharedWith.push(toEmail);
                await updateDoc(docRef, { sharedWith });
            }
        }

        // Send email notification
        const response = await fetch('/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'capsuleShare',
                data: {
                    toEmail,
                    fromName,
                    capsuleName,
                    shareUrl
                }
            }),
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Error sharing capsule:', error);
        return false;
    }
};

// Check for capsules that need to be unlocked and send notifications
export const checkAndNotifyUnlockedCapsules = async (): Promise<void> => {
    const now = new Date();

    // Query for capsules that should be unlocked now but haven't sent notifications
    const capsulesRef = collection(db, 'capsules');
    const q = query(
        capsulesRef,
        where('unlockDate', '<=', now),
        where('notificationSent', '==', false)
    );

    const querySnapshot = await getDocs(q);

    const promises: Promise<any>[] = [];

    querySnapshot.forEach((doc) => {
        const capsule = doc.data() as DocumentData;
        const unlockUrl = `${process.env.NEXT_PUBLIC_APP_URL}/home/view-capsule/${doc.id}`;

        // Send notification email
        const emailPromise = sendCapsuleNotification(
            capsule.ownerEmail,
            capsule.name,
            unlockUrl
        );

        // Update notification sent status
        const updatePromise = updateNotificationSent(doc.id);

        promises.push(emailPromise);
        promises.push(updatePromise);
    });

    await Promise.all(promises);
};

// Update notification sent status
const updateNotificationSent = async (capsuleId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'capsules', capsuleId);
        await updateDoc(docRef, {
            notificationSent: true
        });
    } catch (error) {
        console.error('Error updating notification status:', error);
        throw error;
    }
};

// Helper to validate file size (max 10MB)
export const validateFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
};

// Helper to get file type category
export const getFileType = (file: File): 'image' | 'video' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
};

import { getDoc } from 'firebase/firestore';