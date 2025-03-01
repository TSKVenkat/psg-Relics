import { SignInButton } from '../components/auth/SignInButton';
import { redirect } from 'next/navigation';
import { auth } from '../lib/firebase';
import ScrollVelocity from '../components/assests/ScrollVelocity';

export default async function LandingPage() {
  
  if (auth.currentUser) {
    redirect('/home');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-16 px-6 sm:px-8 lg:px-12 gap-y-8">
      <ScrollVelocity
        texts={['RELICS', 'RELICS']}
        velocity={60}
        className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold whitespace-nowrap"
      />

      <div className="max-w-2xl w-full space-y-8 text-center">
        <p className="text-xl text-white font-bold">
          Preserve memories for your future self
        </p>
        <p className="text-md text-gray-500 leading-relaxed text-justify">
          Relics is your personal time capsule for memories, a place where you can store cherished moments and revisit them in the future. Whether it’s a heartfelt message, a collection of photos, a meaningful video, or any other digital keepsake, Relics ensures that your memories are preserved until the perfect moment arrives.
        </p>
        <p className="text-md text-gray-500 leading-relaxed text-justify">
          Create as many capsules as you want, each holding a piece of your story. Archive them securely and set them to unlock at a time of your choosing. When the moment comes, open your capsule, relive the memories, download them, and share them with friends through the built-in email service. Relics is more than just storage—it’s a bridge between your past and future, keeping your most treasured moments alive.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700" />
          </div>
          <div className="relative flex justify-center bg-black px-4 text-sm">
            <span className="text-gray-400">Sign in to begin</span>
          </div>
        </div>

        <div className="flex justify-center">
          <SignInButton />
        </div>
      </div>   
    </div>
  );
}
