'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Active Users', href: '/admin/users/active' },
    { name: 'Tutors', href: '/admin/tutors/pending' },
    { name: 'Sessions', href: '/admin/sessions' },
    { name: 'Revenue', href: '/admin/revenue' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-gray-200 sticky top-0 z-10" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center gap-2">
              <Image
                src="/app_logo(white).png"
                alt="PrepSkul"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
                PrepSkul Admin
              </h1>
            </div>
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <button className="text-sm text-white/90 hover:text-white font-medium">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

