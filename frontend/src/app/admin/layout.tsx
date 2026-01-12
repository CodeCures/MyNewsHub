'use client';

import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage news sources and system configuration</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/admin/sources"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
                  >
                    News Sources
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/articles"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
                  >
                    Articles
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
                  >
                    Back to Site
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
