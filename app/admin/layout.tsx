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
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple layout - authentication is handled per page
  return <>{children}</>;
}

