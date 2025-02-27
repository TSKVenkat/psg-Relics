import { Capsule } from '@/types';
import Link from 'next/link';

interface CapsuleCardProps {
    capsule: Capsule;
}

export default function CapsuleCard({ capsule }: CapsuleCardProps) {
    const isUnlocked = !capsule.isLocked || new Date() >= capsule.lockUntil;

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTimeLeft = (unlockDate: Date) => {
        if (!capsule.isLocked || new Date() >= unlockDate) return 'Unlocked';

        const now = new Date();
        const diff = unlockDate.getTime() - now.getTime();

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days > 0) return `${days} day${days !== 1 ? 's' : ''} left`;

        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''} left`;

        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} left`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{capsule.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{capsule.description}</p>

                <div className="flex items-center mb-3">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isUnlocked ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-sm">
                        {isUnlocked ? 'Unlocked' : 'Locked until ' + formatDate(capsule.lockUntil)}
                    </span>
                </div>

                <div className="text-sm text-gray-500 mb-4">
                    Created on {formatDate(capsule.createdAt)}
                </div>

                <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-blue-600">
                        {formatTimeLeft(capsule.lockUntil)}
                    </div>
                    <Link
                        href={`/capsule/${capsule.id}`}
                        className={`px-4 py-2 rounded-md text-white ${isUnlocked
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        {...(!isUnlocked && { onClick: (e) => e.preventDefault() })}
                    >
                        {isUnlocked ? 'Open Capsule' : 'Locked'}
                    </Link>
                </div>
            </div>
        </div>
    );
}