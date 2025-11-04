export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black p-6">
      {children}
    </div>
  );
}