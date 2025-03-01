'use client'
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Capsule } from '../../../../types';
import { CapsuleView } from '../../../../components/capsules/CapsuleView';

export default function ViewCapsulePage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const resolvedParams = React.use(params);
    const id = resolvedParams.id;
    
    const [capsule, setCapsule] = useState<Capsule | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchCapsule = async () => {
            try {
                const capsuleData = await getCapsuleById(id);
                if (capsuleData) {
                    setCapsule(capsuleData);
                }
            } catch (error) {
                console.error('Error fetching capsule:', error);
            }
        };

        fetchCapsule();
    }, [id]);

    if (!capsule) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <CapsuleView capsuleId={capsule.id} />
        </div>
    );
}

async function getCapsuleById(id: string): Promise<Capsule | null> {
    try {
        const capsuleRef = doc(db, 'capsules', id);
        const capsuleSnap = await getDoc(capsuleRef);

        if (capsuleSnap.exists()) {
            return {
                id: capsuleSnap.id,
                ...capsuleSnap.data()
            } as Capsule;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching capsule:', error);
        return null;
    }
}