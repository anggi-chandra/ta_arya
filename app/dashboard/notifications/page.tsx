"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Calendar, CreditCard, Info, Check, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  action_url: string | null;
  created_at: string;
};

// Map notification type to icon (sama seperti di navbar)
function renderIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    case "warning":
      return <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
    case "error":
      return <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    default:
      return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  }
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  // Load notifications from API
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      if (res.ok) {
        await loadNotifications();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      setMarkingRead(id);
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markRead", id }),
      });
      if (res.ok) {
        await loadNotifications();
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      setMarkingRead(null);
    }
  };

  // Load notifications when user is authenticated
  useEffect(() => {
    if (status === "authenticated") {
      loadNotifications();
    }
  }, [status]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (status === "authenticated") {
      const interval = setInterval(() => {
        loadNotifications();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Notifikasi</h1>
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
        </Card>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Notifikasi</h1>
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Anda harus login untuk melihat notifikasi.
          </p>
        </Card>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {unreadCount} notifikasi belum dibaca
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} variant="outline" size="sm">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {loading ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Memuat notifikasi...</p>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Belum ada notifikasi.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const NotificationContent = (
              <Card
                key={notification.id}
                className={`p-4 ${
                  !notification.is_read
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex-shrink-0">
                    {renderIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${
                            !notification.is_read
                              ? "text-gray-900 dark:text-gray-100"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          disabled={markingRead === notification.id}
                          className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Tandai sebagai dibaca"
                        >
                          <Check className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );

            if (notification.action_url) {
              return (
                <Link
                  key={notification.id}
                  href={notification.action_url}
                  onClick={() => {
                    // Mark as read when clicked
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  {NotificationContent}
                </Link>
              );
            }

            return NotificationContent;
          })}
        </div>
      )}
    </div>
  );
}