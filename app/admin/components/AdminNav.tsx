'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const tutorsItems = [
  { name: 'Tutors', href: '/admin/tutors' },
  { name: 'Tutor Requests', href: '/admin/tutor-requests' },
];

const ambassadorsItems = [
  { name: 'Ambassadors', href: '/admin/ambassadors' },
  { name: 'Outreach Analytics', href: '/admin/ambassador-outreach' },
  { name: 'Reachout Track', href: '/admin/reachout' },
];

const operationsItems = [
  { name: 'Analytics', href: '/admin/analytics' },
  { name: 'Offline Ops', href: '/admin/offline-ops' },
  { name: 'Feedback Inbox', href: '/admin/feedback-inbox' },
  { name: 'Ops Events', href: '/admin/operations-events' },
  { name: 'Active Users', href: '/admin/users/active' },
];

const singleItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Sessions', href: '/admin/sessions' },
  { name: 'Revenue', href: '/admin/revenue' },
  { name: 'Pricing', href: '/admin/pricing' },
  { name: 'Notifications', href: '/admin/notifications/send' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTutorsOpen, setMobileTutorsOpen] = useState(false);
  const [mobileAmbassadorsOpen, setMobileAmbassadorsOpen] = useState(false);
  const [mobileOperationsOpen, setMobileOperationsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const isTutorsActive = tutorsItems.some((i) => isActive(i.href));
  const isAmbassadorsActive = ambassadorsItems.some((i) => isActive(i.href));
  const isOperationsActive = operationsItems.some((i) => isActive(i.href));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <nav className="border-b border-gray-200 sticky top-0 z-50" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white shrink-0">PrepSkul Admin</h1>
            <div className="hidden md:flex items-center gap-1 flex-wrap">
              {singleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-1.5 text-sm font-medium transition-colors rounded ${
                    isActive(item.href)
                      ? 'text-white bg-white/20'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium transition-colors rounded ${
                      isTutorsActive
                        ? 'text-white bg-white/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Tutors
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                  {tutorsItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium transition-colors rounded ${
                      isOperationsActive
                        ? 'text-white bg-white/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Operations
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[220px]">
                  {operationsItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`inline-flex items-center gap-1 px-2 py-1.5 text-sm font-medium transition-colors rounded ${
                      isAmbassadorsActive
                        ? 'text-white bg-white/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    Ambassadors
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[200px]">
                  {ambassadorsItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="cursor-pointer">
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Desktop: Logout button */}
          <button
            onClick={handleLogout}
            className="hidden md:block text-sm text-white/90 hover:text-white font-medium transition-colors shrink-0"
          >
            Logout
          </button>

          {/* Mobile: Menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-white/80 p-2 shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/20" style={{ background: 'linear-gradient(135deg, #1B2C4F 0%, #4A6FBF 100%)' }}>
          <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
            {singleItems.map((item) => (
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
            <div>
              <button
                type="button"
                onClick={() => setMobileOperationsOpen(!mobileOperationsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isOperationsActive
                    ? 'text-white bg-white/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Operations
                <ChevronRight className={`h-4 w-4 transition-transform ${mobileOperationsOpen ? 'rotate-90' : ''}`} />
              </button>
              {mobileOperationsOpen && (
                <div className="pl-4 space-y-1">
                  {operationsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'text-white bg-white/15'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => setMobileTutorsOpen(!mobileTutorsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isTutorsActive
                    ? 'text-white bg-white/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Tutors
                <ChevronRight className={`h-4 w-4 transition-transform ${mobileTutorsOpen ? 'rotate-90' : ''}`} />
              </button>
              {mobileTutorsOpen && (
                <div className="pl-4 space-y-1">
                  {tutorsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'text-white bg-white/15'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => setMobileAmbassadorsOpen(!mobileAmbassadorsOpen)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isAmbassadorsActive
                    ? 'text-white bg-white/20'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Ambassadors
                <ChevronRight className={`h-4 w-4 transition-transform ${mobileAmbassadorsOpen ? 'rotate-90' : ''}`} />
              </button>
              {mobileAmbassadorsOpen && (
                <div className="pl-4 space-y-1">
                  {ambassadorsItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'text-white bg-white/15'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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



