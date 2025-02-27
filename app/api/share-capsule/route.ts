import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { auth } from '../../../lib/firebase';
import { generateShareUrl } from '../../../lib/utils';

export async function POST(request: NextRequest) {
    // Check if user is authenticated using Firebase directly
    const user = auth.currentUser;
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { capsuleId, email, message } = await request.json();

        if (!capsuleId || !email) {
            return NextResponse.json({ error: 'Capsule ID and email are required' }, { status: 400 });
        }

        const capsuleRef = doc(db, 'capsules', capsuleId);
        const capsuleSnap = await getDoc(capsuleRef);

        if (!capsuleSnap.exists()) {
            return NextResponse.json({ error: 'Capsule not found' }, { status: 404 });
        }

        const capsuleData = capsuleSnap.data();

        // Check if user is authorized to share this capsule
        if (capsuleData.userId !== user.uid) {
            return NextResponse.json({ error: 'Not authorized to share this capsule' }, { status: 403 });
        }

        // Check if capsule is unlocked
        if (capsuleData.isLocked) {
            return NextResponse.json({ error: 'Cannot share a locked capsule' }, { status: 403 });
        }

        // Add email to sharedWith array
        await updateDoc(capsuleRef, {
            sharedWith: arrayUnion(email)
        });

        // Send email notification via the API
        const shareUrl = generateShareUrl(capsuleId);

        // Call the email API endpoint
        const emailResponse = await fetch(new URL('/api/send-email', request.url).toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'capsuleShare',
                data: {
                    toEmail: email,
                    fromName: user.displayName || 'A time capsule user',
                    capsuleName: capsuleData.name,
                    shareUrl
                }
            }),
        });

        if (!emailResponse.ok) {
            console.warn('Failed to send notification email, but capsule was shared');
        }

        return NextResponse.json({
            success: true,
            message: 'Capsule shared successfully'
        });

    } catch (error) {
        console.error('Error sharing capsule:', error);
        return NextResponse.json({ error: 'Failed to share capsule' }, { status: 500 });
    }
}