// Block search engines from indexing admin pages
export const metadata = {
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
      { url: '/logo-blue.png', type: 'image/png' },
      { url: '/logo-blue.png', type: 'image/png', sizes: 'any' }
    ],
    shortcut: '/logo-blue.png',
    apple: '/logo-blue.png',
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

