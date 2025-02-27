import Link from 'next/link';
import { useAuth } from '@/lib/auth';

export default function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-xl font-bold text-gray-900">
                            Time Capsule
                        </Link>
                    </div>

                    {user && (
                        <div className="flex items-center">
                            <Link href="/home" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                Home
                            </Link>
                            <Link href="/capsule/create" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                                Create Capsule
                            </Link>
                            <button
                                onClick={logout}
                                className="ml-4 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}