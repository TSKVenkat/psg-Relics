import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../../../lib/firebase';
import { isCapsuleUnlocked } from '../../../lib/utils';

export async function POST(request: NextRequest) {
    // Check if user is authenticated using Firebase directly
    const user = auth.currentUser;
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { capsuleId } = await request.json();

        if (!capsuleId) {
            return NextResponse.json({ error: 'Capsule ID is required' }, { status: 400 });
        }

        const capsuleRef = doc(db, 'capsules', capsuleId);
        const capsuleSnap = await getDoc(capsuleRef);

        if (!capsuleSnap.exists()) {
            return NextResponse.json({ error: 'Capsule not found' }, { status: 404 });
        }

        const capsuleData = capsuleSnap.data();

        // Check if user is authorized to unlock this capsule
        if (capsuleData.userId !== user.uid) {
            return NextResponse.json({ error: 'Not authorized to unlock this capsule' }, { status: 403 });
        }

        // Check if it's time to unlock the capsule
        const unlockDate = capsuleData.unlockDate.toDate();
        if (!isCapsuleUnlocked(unlockDate) && capsuleData.isLocked) {
            return NextResponse.json({
                error: 'This capsule is not ready to be unlocked yet',
                unlockDate: unlockDate
            }, { status: 403 });
        }

        // Unlock the capsule
        await updateDoc(capsuleRef, {
            isLocked: false,
            unlockedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: 'Capsule unlocked successfully'
        });

    } catch (error) {
        console.error('Error unlocking capsule:', error);
        return NextResponse.json({ error: 'Failed to unlock capsule' }, { status: 500 });
    }
}
