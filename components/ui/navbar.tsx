"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, Settings, UserCircle } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.email === "admin@esportshub.local";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[1000] pointer-events-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-20 relative">
          {/* Left: Brand */}
          <div className="flex items-center justify-start">
            <Link href="/" className="text-3xl font-bold text-primary">
              EsportsHub
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 text-base focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:block text-gray-700 dark:text-gray-300">
                    {session?.user?.email?.split("@")[0] || "User"}
                  </span>
                </button>
                
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
                      href="/dashboard/settings" 
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