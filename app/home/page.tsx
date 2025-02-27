'use client'
import Link from 'next/link';
import { CapsuleList } from '../../components/capsules/CapsuleList';
import { Button } from '../../components/ui/Button';

export default function HomePage() {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Time Capsules</h1>
        <Link href="/home/create-capsule">
          <Button variant="primary">Create New Capsule</Button>
        </Link>
      </div>

      <CapsuleList />
    </div>
  );
}