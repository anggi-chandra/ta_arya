"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { 
  Home, 
  User, 
  Settings, 
  Bell, 
  Users, 
  Calendar,
  Trophy,
  LogOut
} from "lucide-react";

// Sidebar items will be computed based on role (simple email check for admin)
function getSidebarItems(isAdmin: boolean) {
  return [
    { name: "Dashboard", href: isAdmin ? "/admin" : "/dashboard", icon: Home },
    { name: "Profil", href: "/dashboard/profile", icon: User },
    { name: "Tim Saya", href: "/dashboard/teams", icon: Users },
    { name: "Event", href: "/dashboard/events", icon: Calendar },
    { name: "Notifikasi", href: "/dashboard/notifications", icon: Bell },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "admin@esportshub.local";
  const sidebarItems = getSidebarItems(isAdmin);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <Image 
                src="/logo.png" 
                alt="Bagoes Esports Logo" 
                width={28} 
                height={28} 
                className="object-contain"
              />
              <span>Bagoes Esports</span>
            </Link>
          </div>
          <div className="px-4 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                {session?.user?.email?.[0].toUpperCase() || "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {session?.user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session?.user?.email || "user@example.com"}
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    pathname === item.href
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1 pb-8">
          <div className="py-6">
            <div className="w-full mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );}
