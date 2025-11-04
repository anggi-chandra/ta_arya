export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black">
      {children}
    </div>
  );
}