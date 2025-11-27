"use client";

import {
  Home,
  Users,
  Calendar,
  Ticket,
  Trophy,
  FileText,
  Settings,
  MessageSquare,
} from "lucide-react";
import { DashboardShell, type SidebarItem } from "@/components/layouts/dashboard-shell";

const adminSidebar: SidebarItem[] = [
  { name: "Dashboard", href: "/admin", icon: Home, matchChildren: false },
  { name: "Pengguna", href: "/admin/users", icon: Users, matchChildren: true },
  { name: "Event", href: "/admin/events", icon: Calendar, matchChildren: true },
  { name: "Permintaan Event", href: "/admin/event-requests", icon: FileText, matchChildren: true },
  { name: "Tim", href: "/admin/teams", icon: Users, matchChildren: true },
  { name: "Turnamen", href: "/admin/tournaments", icon: Trophy, matchChildren: true },
  { name: "Tiket", href: "/admin/tickets", icon: Ticket, matchChildren: true },
  { name: "Konten & Forum", href: "/admin/forum", icon: MessageSquare, matchChildren: true },
  { name: "Pengaturan", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardShell
      sidebarItems={adminSidebar}
      title="Panel Admin"
      description="Kelola seluruh ekosistem esports: pengguna, tim, event, dan komunitas."
    >
        {children}
    </DashboardShell>
  );
}