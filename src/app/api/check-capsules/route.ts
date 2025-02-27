import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { sendCapsuleUnlockEmail } from '@/lib/mail';

// This endpoint should be called by a CRON job (e.g., using Vercel Cron)
export async function GET() {
    try {
        const now = new Date();
        const nowTimestamp = Timestamp.fromDate(now);

        // Find all locked capsules where lockUntil is less than or equal to now
        const q = query(
            collection(db, 'capsules'),
            where('isLocked', '==', true),
            where('lockUntil', '<=', nowTimestamp)
        );

        const querySnapshot = await getDocs(q);
        const unlockedCount = querySnapshot.docs.length;

        // Process each capsule
        const updatePromises = querySnapshot.docs.map(async (document) => {
            const capsule = { id: document.id, ...document.data() };

            // Update capsule to unlocked status
            await updateDoc(doc(db, 'capsules', document.id), {
                isLocked: false
            });

            // Send email notification
            await sendCapsuleUnlockEmail(
                capsule.userEmail,
                capsule.title,
                document.id
            );

            return capsule.id;
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ success: true, unlockedCount });
    } catch (error) {
        console.error('Error checking capsules:', error);
        return NextResponse.json(
            { error: 'Failed to check capsules' },
            { status: 500 }
        );
    }
}