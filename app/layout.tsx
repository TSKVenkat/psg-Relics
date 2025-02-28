import './globals.css';
import { AuthProvider } from '../components/auth/AuthProvider';
import SignOutButton from '../components/auth/SignOutButton';
import Link from 'next/link';
import ScrollVelocity from '../components/assests/ScrollVelocity';

export const metadata = {
  title: 'Relics',
  description: 'Create time capsules and share memories with your future self',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-grotesk min-h-screen bg-gray-50 overflow-x-hidden`}>
        <AuthProvider>
          <nav><Link className='flex text-white font-bold justify-between items-center p-4 cursor-pointer' href='/'><p className='self-center text-3xl'>Relics</p><SignOutButton /></Link></nav>
          {children}
          <footer className="w-full bg-black text-gray-400 py-6 mt-16">
            <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8 text-center">
              <ScrollVelocity
                texts={['RELICS', 'RELICS']}
                velocity={60}
                className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold whitespace-nowrap"
              />
              <p className="text-sm text-gray-500">
                Preserving your memories, one capsule at a time.
              </p>

              <div className="flex space-x-6 text-sm">
                <a href="/home" className="hover:text-white transition">Home</a>
                <a href="/home/create-capsule" className="hover:text-white transition">Capsule</a>
              </div>

              <p className="text-xs text-gray-600 mt-2">
                &copy; {new Date().getFullYear()} Relics. All rights reserved.
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}