import Footer from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";

// Ensure pages under this layout are properly handled
export const dynamicParams = false;
// Force dynamic rendering
export const dynamic = 'force-dynamic';

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