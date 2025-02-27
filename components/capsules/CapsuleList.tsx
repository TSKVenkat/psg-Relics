'use client'
import { useState, useEffect } from 'react';
import { collection, query, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Capsule } from '../../types';
import { CapsuleCard } from './CapsuleCard';

export const CapsuleList = () => {
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCapsules = async () => {
            try {
                setLoading(true);
                const capsulesRef = collection(db, 'capsules');

                // Simple query to get all capsules without filters
                const capsulesQuery = query(capsulesRef);
                const querySnapshot = await getDocs(capsulesQuery);

                const fetchedCapsules: Capsule[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();

                    // Properly convert Firestore timestamps to JavaScript Date objects
                    const createdAt = data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate()
                        : new Date(data.createdAt);

                    const unlockDate = data.unlockDate instanceof Timestamp
                        ? data.unlockDate.toDate()
                        : new Date(data.unlockDate);

                    // Format dates to YYYY-MM-DD format for display
                    const formattedCreatedAt = createdAt instanceof Date && !isNaN(createdAt.getTime())
                        ? createdAt.toISOString().split('T')[0]
                        : 'Unknown Date';

                    const formattedUnlockDate = unlockDate instanceof Date && !isNaN(unlockDate.getTime())
                        ? unlockDate.toISOString().split('T')[0]
                        : 'Unknown Date';

                    fetchedCapsules.push({
                        id: doc.id,
                        ...data,
                        createdAt,
                        unlockDate,
                        formattedCreatedAt,
                        formattedUnlockDate
                    } as Capsule);
                });

                // Sort capsules by creation date (most recent first)
                fetchedCapsules.sort((a, b) => {
                    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date();
                    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date();

                    // Check for invalid dates
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;

                    return dateB.getTime() - dateA.getTime();
                });

                setCapsules(fetchedCapsules);
            } catch (error) {
                console.error('Error fetching capsules:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCapsules();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (capsules.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No time capsules found</h3>
                <p className="text-gray-600 mb-6">Create your first time capsule to store memories for the future.</p>
                <a
                    href="/home/create-capsule"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Create a Capsule
                </a>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((capsule) => (
                <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
        </div>
    );
};