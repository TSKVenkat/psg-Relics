import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 md:px-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-6">Virtual Time Capsule</h1>
      <p className="text-xl mb-8 max-w-2xl">
        Preserve your memories, messages, and media in a digital time capsule. 
        Lock them away and rediscover them in the future.
      </p>
      
      <div className="flex flex-col items-center space-y-4 w-full max-w-md p-8 rounded-lg bg-gray-50 shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <GoogleSignInButton />
      </div>
      
      <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-6xl">
        <FeatureCard 
          title="Create Capsules" 
          description="Build digital time capsules with photos, videos, and messages."
          icon="📦"
        />
        <FeatureCard 
          title="Time Lock" 
          description="Set a future date when your capsule will be unlocked."
          icon="🔒"
        />
        <FeatureCard 
          title="Get Notified" 
          description="Receive an email when your capsule is ready to be opened."
          icon="📬"
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="flex flex-col items-center p-6 rounded-lg bg-white shadow-md">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}