"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, UserCircle, Bell, Calendar, CheckCircle, CreditCard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const navLinks = [
  { name: "Beranda", href: "/" },
  { name: "Event", href: "/events" },
  { name: "Komunitas", href: "/community" },
  { name: "Turnamen", href: "/tournaments" },
  { name: "Tim", href: "/teams" },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
  { name: "Kontak", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.email === "admin@esportshub.local";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map notification type to icon
  function renderIcon(type: string) {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <Calendar className="h-4 w-4 text-orange-600" />;
      case "error":
        return <CreditCard className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  }

  async function loadNotifications() {
    try {
      setLoadingNotifs(true);
      const res = await fetch("/api/notifications", { method: "GET" });
      const json = await res.json();
      if (res.ok) {
        setNotifItems(Array.isArray(json.notifications) ? json.notifications : []);
      }
    } catch (e) {
      // noop
    } finally {
      setLoadingNotifs(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      if (res.ok) {
        await loadNotifications();
      }
    } catch (e) {
      // noop
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Preload notifications when user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSignOut = async () => {
    try {
      // Sign out without redirect to avoid NEXTAUTH_URL issues
      await signOut({ 
        redirect: false 
      });
      // Use window.location to ensure we use the current origin (not NEXTAUTH_URL)
      // This prevents redirect to localhost:3001 or other incorrect URLs
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
      // Fallback: redirect to login anyway using current origin
      window.location.href = "/login";
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[1000] pointer-events-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-20 relative">
          {/* Left: Brand */}
          <div className="flex items-center justify-start gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image 
                src="/logo.png" 
                alt="Bagoes Esports Logo" 
                width={40} 
                height={40} 
                className="object-contain"
                priority
              />
              <span className="text-2xl font-bold text-primary">
                Bagoes Esports
              </span>
            </Link>
          </div>

          {/* Center: Nav links */}
          <div className="hidden sm:flex justify-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center px-2 border-b-2 text-lg font-semibold h-full",
                  pathname === link.href || pathname.startsWith(`${link.href}/`)
                    ? "border-primary text-primary dark:text-primary"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100",
                  link.name === "Kontak" && "relative z-[1001]"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Auth */}
          <div className="hidden sm:flex items-center justify-end space-x-4">
            {status === "authenticated" ? (
              <div className="relative flex items-center gap-3" ref={dropdownRef}>
                {/* Notification Bell */}
                <button
                  aria-label="Notifikasi"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    // ensure profile dropdown closes when opening notifications
                    if (!notificationsOpen) setDropdownOpen(false);
                    if (!notificationsOpen) {
                      loadNotifications();
                    }
                  }}
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                >
                  <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                  {notifItems.filter((n) => !n.is_read).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none rounded-full bg-red-600 text-white">
                      {notifItems.filter((n) => !n.is_read).length}
                    </span>
                  )}
                </button>

                {/* Profile Button */}
                <button
                  onClick={() => {
                    setDropdownOpen(!dropdownOpen);
                    if (!dropdownOpen) setNotificationsOpen(false);
                  }}
                  className="flex items-center space-x-2 text-base focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block text-gray-700 dark:text-gray-300">
                    {session?.user?.email?.split("@")[0] || "User"}
                  </span>
                </button>
                
                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-20 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold">Notifikasi</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Update terbaru untuk Anda</p>
                    </div>
                    <div className="max-h-64 overflow-auto">
                      {loadingNotifs && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Memuat...</div>
                      )}
                      {!loadingNotifs && notifItems.map((n) => (
                        <Link key={n.id} href={n.action_url || "#"} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <div className="mt-0.5">{renderIcon(n.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{n.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{n.message}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                      {!loadingNotifs && notifItems.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Tidak ada notifikasi.
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-2 pt-2">
                      <Button onClick={handleMarkAllRead} variant="ghost" size="sm" className="text-xs">Tandai semua dibaca</Button>
                      <Link href="/dashboard/notifications" className="text-xs text-primary px-2 py-1 hover:underline">Lihat semua</Link>
                    </div>
                  </div>
                )}

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link 
                      href={isAdmin ? "/admin" : "/dashboard"}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                    <Link 
                      href={isAdmin ? "/admin/settings" : "/dashboard/settings"} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Pengaturan
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" prefetch={false}>
                  <Button variant="ghost" size="lg" className="text-lg">Masuk</Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button size="lg" className="text-lg">Daftar</Button>
                </Link>
              </>
            )}
          </div>
          {/* Mobile: hamburger (right aligned) */}
          <div className="col-span-1 flex items-center sm:hidden justify-end">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}