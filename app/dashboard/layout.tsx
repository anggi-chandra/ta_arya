"use client";

import { useSession } from "next-auth/react";
import {
  Home,
  User,
  Settings,
  Bell,
  Users,
  Calendar,
  Trophy,
} from "lucide-react";
import { DashboardShell, type SidebarItem } from "@/components/layouts/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "admin@esportshub.local";
  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", href: isAdmin ? "/admin" : "/dashboard", icon: Home, matchChildren: false },
    { name: "Profil", href: "/dashboard/profile", icon: User },
    { name: "Tim Saya", href: "/dashboard/teams", icon: Users, matchChildren: true },
    { name: "Event", href: "/dashboard/events", icon: Calendar, matchChildren: true },
    { name: "Notifikasi", href: "/dashboard/notifications", icon: Bell },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <DashboardShell
      sidebarItems={sidebarItems}
      title={isAdmin ? "Panel Admin" : "Dashboard Pengguna"}
      description={
        isAdmin
          ? "Kelola konten, event, dan komunitas dari satu tempat."
          : "Pantau aktivitas esports Anda dan kelola semua kebutuhan tim."
      }
    >
              {children}
    </DashboardShell>
  );
}
