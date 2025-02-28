import { Capsule } from '../../types';
import { formatDate, isCapsuleUnlocked } from '../../lib/utils';
import Link from 'next/link';

interface CapsuleCardProps {
  capsule: Capsule;
}

export const CapsuleCard = ({ capsule }: CapsuleCardProps) => {
  const isUnlocked = isCapsuleUnlocked(
    capsule.unlockDate instanceof Date 
      ? capsule.unlockDate 
      : new Date(capsule.unlockDate)
  );

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
          <p>Created: {formatDate(
            capsule.createdAt instanceof Date 
              ? capsule.createdAt 
              : new Date(capsule.createdAt)
          )}</p>
          <p>Unlocks: {formatDate(
            capsule.unlockDate instanceof Date 
              ? capsule.unlockDate 
              : new Date(capsule.unlockDate)
          )}</p>
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