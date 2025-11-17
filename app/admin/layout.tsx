import type { Metadata } from "next"

// Block search engines from indexing admin pages
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  title: 'PrepSkul Admin',
  icons: {
    icon: [
      { url: '/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/logo.jpg', sizes: '192x192', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/logo.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
    shortcut: '/logo.jpg',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple layout - authentication is handled per page
  return <>{children}</>;
}

