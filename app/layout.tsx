import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/auth/AuthProvider';
import SignOutButton from '../components/auth/SignOutButton';

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
      <body className={`font-grotesk min-h-screen bg-gray-50 `}>
        <AuthProvider>
          <nav><div className='flex text-white font-bold justify-between items-center p-4'><p className='self-center text-3xl'>Relics</p><SignOutButton /></div></nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}