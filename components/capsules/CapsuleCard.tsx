import { Capsule } from '../../types';
import { formatDate } from '../../lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface CapsuleCardProps {
  capsule: Capsule;
}

export const CapsuleCard = ({ capsule }: CapsuleCardProps) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [createdDate, setCreatedDate] = useState<Date | null>(null);
  const [unlockDate, setUnlockDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapsuleData = async () => {
      try {
        setLoading(true);
        // Fetch the capsule directly from Firestore
        const capsuleRef = doc(db, 'capsules', capsule.id);
        const capsuleSnap = await getDoc(capsuleRef);

        if (capsuleSnap.exists()) {
          const data = capsuleSnap.data();

          // Get created date
          let created = null;
          if (data.createdAt && data.createdAt.toDate) {
            created = data.createdAt.toDate();
          } else if (data.createdAt) {
            created = new Date(data.createdAt);
          }

          // Get unlock date
          let unlock = null;
          if (data.unlockDate && data.unlockDate.toDate) {
            unlock = data.unlockDate.toDate();
          } else if (data.unlockDate) {
            unlock = new Date(data.unlockDate);
          }

          setCreatedDate(created);
          setUnlockDate(unlock);

          // Check if unlocked - compare with current date
          const now = new Date();
          setIsUnlocked(unlock !== null && now >= unlock);
        }
      } catch (error) {
        console.error("Error fetching capsule data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsuleData();
  }, [capsule.id]);

  return (
    <div className="border rounded-lg shadow-sm p-4 bg-black border hover:scale-95 transition duration-300 ease">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold truncate">{capsule.name}</h3>
        <div className={`px-2 py-1 text-xs rounded-full ${isUnlocked ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
          {isUnlocked ? 'Unlocked' : 'Locked'}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{capsule.description}</p>

      <div className="flex justify-between text-sm text-white">
        <div>
          <p>Created: {createdDate ? formatDate(createdDate) : "Loading..."}</p>
          <p>Unlocks: {unlockDate ? formatDate(unlockDate) : "Loading..."}</p>
        </div>

        <div className="self-end">
          <Link
            href={`/home/view-capsule/${capsule.id}`}
            className="text-primary hover:text-gray-500 transition duration-300 ease font-medium"
          >
            {isUnlocked ? 'View Contents' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};