'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserCapsules } from '@/lib/db';
import { Capsule } from '@/types';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Link from 'next/link';
import CapsuleCard from '@/components/capsule/CapsuleCard';

export default function HomePage() {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserCapsules();
    }
  }, [user]);

  const loadUserCapsules = async () => {
    try {
      if (user) {
        setLoading(true);
        const userCapsules = await getUserCapsules(user.uid);
        setCapsules(userCapsules);
      }
    } catch (error) {
      console.error('Error loading capsules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Time Capsules</h1>
          <Link
            href="/capsule/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Create New Capsule
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading your capsules...</div>
        ) : capsules.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 mb-4">You don't have any time capsules yet.</p>
            <Link
              href="/capsule/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
            >
              Create Your First Capsule
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((capsule) => (
              <CapsuleCard key={capsule.id} capsule={capsule} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}