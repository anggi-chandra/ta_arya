"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  matchChildren?: boolean;
}

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  footerLink?: {
    href: string;
    label: string;
  };
  title?: string;
  description?: string;
}

export function DashboardShell({
  children,
  sidebarItems,
  title,
  description,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#050505] via-[#0b0000] to-[#010101] text-white">
      <aside className="hidden md:flex md:w-72 md:flex-col border-r border-red-900/40 bg-gradient-to-b from-[#0b0b0f] via-[#050000] to-[#020000] shadow-2xl shadow-black/40">
        <div className="flex flex-col flex-grow gap-6 px-5 py-8 overflow-y-auto">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 group-hover:bg-white/20 transition-colors">
              <Image
                src="/logo.png"
                alt="Bagoes Esports Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight group-hover:text-white">Bagoes Esports</p>
              <p className="text-xs text-white/60 uppercase tracking-[0.2em]">Control Center</p>
            </div>
          </Link>

          <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs text-white/50 uppercase tracking-[0.25em] mb-3">Akun Aktif</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-lg font-semibold">
                {session?.user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {session?.user?.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-white/60">{session?.user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const matchesChildren =
                Boolean(item.matchChildren && pathname && pathname.startsWith(`${item.href}/`));
              const isActive = pathname === item.href || matchesChildren;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200",
                    isActive
                      ? "border-red-500/60 bg-red-600/10 text-white shadow-[0_0_25px_rgba(239,68,68,0.35)]"
                      : "border-transparent text-white/70 hover:border-white/10 hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isActive ? "bg-red-600/20 text-red-300" : "bg-white/5 text-white/70")}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-red-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-4">
            <Link
              href="/home"
              className="flex items-center justify-between px-3 py-2 rounded-xl border border-red-900/40 bg-red-900/10 hover:bg-red-900/20 transition-colors text-sm font-medium text-red-300"
            >
              <span>Kembali ke Beranda</span>
              <LogOut className="w-4 h-4 opacity-70" />
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 min-h-screen">
        <main className="flex-1 w-full">
          <div className="px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-6xl space-y-8">
              {(title || description) && (
                <header className="space-y-2">
                  {title && <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>}
                  {description && <p className="text-white/70 text-sm sm:text-base">{description}</p>}
                </header>
              )}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

