'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!mounted) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              MyNewsHub
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`${
                pathname === '/' ? 'text-blue-600' : 'text-gray-700'
              } hover:text-blue-600 transition`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                href="/my-feeds"
                className={`${
                  pathname === '/my-feeds' ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition`}
              >
                My Feeds
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/preferences"
                className={`${
                  pathname === '/preferences' ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition`}
              >
                Preferences
              </Link>
            )}
            {isAuthenticated && user?.roles?.includes('admin') && (
              <Link
                href="/admin/sources"
                className={`${
                  pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-700'
                } hover:text-blue-600 transition`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700">Hi, {user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block text-gray-700 hover:text-blue-600">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/my-feeds" className="block text-gray-700 hover:text-blue-600">
                  My Feeds
                </Link>
                <Link href="/preferences" className="block text-gray-700 hover:text-blue-600">
                  Preferences
                </Link>
                <div className="pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Hi, {user?.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link href="/auth/login" className="block text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
