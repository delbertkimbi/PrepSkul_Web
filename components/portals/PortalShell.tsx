import Image from 'next/image';
import Link from 'next/link';

export function PortalShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FB]">
      <header className="border-b border-[#1B2C4F]/10 bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="https://prepskul.com" className="flex items-center gap-2 shrink-0">
            <Image src="/app_logo(blue).png" alt="PrepSkul" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="text-xl font-bold text-[#1B2C4F]" style={{ fontFamily: 'var(--font-lato), Lato, sans-serif' }}>
              PrepSkul
            </span>
          </Link>
          {title && <p className="text-sm font-medium text-slate-600 hidden sm:block">{title}</p>}
        </div>
      </header>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-[#1B2C4F]/15 bg-[#1B2C4F] text-white mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 text-sm">
          <p className="font-semibold">PrepSkul</p>
          <p className="text-white/80 mt-2 leading-relaxed">
            Quality tutoring for learners across Cameroon — online and onsite.
          </p>
          <p className="mt-4 text-white/70">
            Questions? Reach us at{' '}
            <a href="mailto:info@prepskul.com" className="underline text-white">
              info@prepskul.com
            </a>
          </p>
          <p className="mt-6 text-xs text-white/50">© {new Date().getFullYear()} PrepSkul. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
