"use client";

import Link from "next/link";
import Image from "next/image";
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
  { name: "Kontak", href: "/contact" },
];

export function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.email === "admin@esportshub.local";
  const [pathname, setPathname] = useState<string>(() => {
    // Get initial pathname from window if available
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return "/";
  });
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update pathname after mount and on navigation
  useEffect(() => {
    setMounted(true);
    
    const updatePathname = () => {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        setPathname(currentPath);
      }
    };

    // Initial update
    updatePathname();

    // Listen for navigation events
    const handlePopState = () => {
      updatePathname();
    };

    // Check for pathname changes (for Next.js client-side navigation)
    let lastPathname = pathname;
    const checkPathname = () => {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (currentPath !== lastPathname) {
          lastPathname = currentPath;
          setPathname(currentPath);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    
    // Check periodically for route changes (Next.js Link doesn't always trigger popstate)
    const interval = setInterval(checkPathname, 150);
    
    // Also listen to route changes via Next.js router
    // For App Router, we need to track navigation manually
    const handleRouteChange = () => {
      setTimeout(updatePathname, 50);
    };

    // Intercept Link clicks to update pathname immediately
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link && (link as HTMLAnchorElement).href.startsWith(window.location.origin)) {
        const href = (link as HTMLAnchorElement).getAttribute('href');
        if (href && href !== pathname) {
          setTimeout(() => setPathname(href), 0);
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClick);
      clearInterval(interval);
    };
  }, []); // Empty deps - only run on mount

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
      const res = await fetch("/api/notifications", { 
        method: "GET",
        credentials: "include"
      });
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
        credentials: "include"
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
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[1000] pointer-events-auto shadow-sm backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 animate-fade-in-down">
      <div className="w-full">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: Brand */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-all duration-300 hover:scale-105 pl-2 sm:pl-4 md:pl-6">
              <Image 
                src="/logo.png" 
                alt="Bagoes Esports Logo" 
                width={36} 
                height={36} 
                className="object-contain w-8 h-8 md:w-10 md:h-10 transition-transform duration-300 hover:rotate-12"
                priority
              />
              <span className="text-xl md:text-2xl font-bold text-primary whitespace-nowrap hover:text-primary-end transition-colors duration-300">
                Bagoes Esports
              </span>
            </Link>
          </div>

          {/* Center: Nav links */}
          <div className="hidden lg:flex items-center justify-center gap-1 md:gap-2 flex-1 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center px-3 md:px-4 py-2 border-b-2 text-sm md:text-base font-medium transition-all duration-300 hover:scale-105",
                  pathname === link.href || (pathname && pathname.startsWith(`${link.href}/`))
                    ? "border-primary text-primary dark:text-primary hover:border-primary-end"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-300 dark:hover:text-gray-100 hover:text-primary",
                  link.name === "Kontak" && "relative z-[1001]"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right: Auth */}
          <div className="flex items-center justify-end gap-3 md:gap-4 flex-shrink-0 pr-4 sm:pr-6 lg:pr-8">
            {status === "authenticated" ? (
              <div className="relative flex items-center gap-2 md:gap-3" ref={dropdownRef}>
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
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
                >
                  <Bell className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
                  {notifItems.filter((n) => !n.is_read).length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium leading-none rounded-full bg-red-600 text-white min-w-[18px]">
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
                  className="flex items-center gap-2 text-base focus:outline-none hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm md:text-base font-medium">
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden lg:block text-gray-700 dark:text-gray-300 text-sm md:text-base">
                    {session?.user?.email?.split("@")[0] || "User"}
                  </span>
                </button>
                
                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50 border border-gray-200 dark:border-gray-700">
                    <div className="px-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifikasi</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Update terbaru untuk Anda</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {loadingNotifs && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Memuat...</div>
                      )}
                      {!loadingNotifs && notifItems.map((n) => (
                        <Link 
                          key={n.id} 
                          href={n.action_url || "#"} 
                          className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          <div className="mt-0.5 flex-shrink-0">{renderIcon(n.type)}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{n.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{n.message}</p>
                            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                          </div>
                        </Link>
                      ))}
                      {!loadingNotifs && notifItems.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Tidak ada notifikasi.
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button onClick={handleMarkAllRead} variant="ghost" size="sm" className="text-xs h-7">Tandai semua dibaca</Button>
                      <Link href="/dashboard/notifications" className="text-xs text-primary px-2 py-1 hover:underline" onClick={() => setNotificationsOpen(false)}>Lihat semua</Link>
                    </div>
                  </div>
                )}

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl py-1 z-50 border border-gray-200 dark:border-gray-700">
                    <Link 
                      href={isAdmin ? "/admin" : "/dashboard"}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                    <Link 
                      href={isAdmin ? "/admin/settings" : "/dashboard/settings"} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Pengaturan
                    </Link>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                  <Button variant="ghost" size="sm" className="text-sm md:text-base">Masuk</Button>
                </Link>
                <Link href="/register" prefetch={false}>
                  <Button size="sm" className="text-sm md:text-base">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

