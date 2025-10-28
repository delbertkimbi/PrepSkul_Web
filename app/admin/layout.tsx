export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simple layout - authentication is handled per page
  return <>{children}</>;
}

