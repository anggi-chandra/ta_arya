import Footer from "@/components/ui/footer";
import { NavbarWrapper } from "@/components/ui/navbar-wrapper";

// Force dynamic rendering to prevent static optimization issues
export const dynamic = 'force-dynamic';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarWrapper />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}