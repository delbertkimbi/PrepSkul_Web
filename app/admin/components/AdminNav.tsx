'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Active Users', href: '/admin/users/active' },
    { name: 'Tutors', href: '/admin/tutors' },
    { name: 'Tutor Requests', href: '/admin/tutor-requests' },
    { name: 'Ambassadors', href: '/admin/ambassadors' },
    { name: 'Sessions', href: '/admin/sessions' },
    { name: 'Revenue', href: '/admin/revenue' },
    { name: 'Pricing', href: '/admin/pricing' },
    { name: 'Notifications', href: '/admin/notifications/send' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200 sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-4 md:space-x-8">
            <h1 className="text-lg md:text-xl font-bold text-white">PrepSkul Admin</h1>
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
          
          {/* Desktop: Logout button */}
          <button 
            onClick={handleLogout}
            className="hidden md:block text-sm text-white/90 hover:text-white font-medium transition-colors"
          >
            Logout
          </button>

          {/* Mobile: Menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-white/80 p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'text-white bg-white/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

