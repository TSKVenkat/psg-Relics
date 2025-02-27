import { SignInButton } from '../components/auth/SignInButton';
import { redirect } from 'next/navigation';
import { auth } from '../lib/firebase';

export default async function LandingPage() {
  // Check if user is already authenticated using Firebase directly
  if (auth.currentUser) {
    redirect('/home');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold ">
            Time Capsule
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Preserve memories for your future self
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    Sign in to begin
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <SignInButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}