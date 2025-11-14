import dynamicImport from "next/dynamic";
import Footer from "@/components/ui/footer";

// Dynamically import Navbar with SSR disabled to avoid context issues
const Navbar = dynamicImport(() => import("@/components/ui/navbar").then(mod => ({ default: mod.Navbar })), {
  ssr: false,
  loading: () => (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[1000] shadow-sm">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 md:h-20 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </nav>
  )
});

// Ensure pages under this layout are properly handled
export const dynamicParams = false;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}