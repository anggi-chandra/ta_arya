"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { pusherClient } from "@/lib/pusher";

type NotificationItem = {
  title: string;
  message: string;
  timestamp: number;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [enabled] = useState(
    Boolean(process.env.NEXT_PUBLIC_PUSHER_APP_KEY && process.env.NEXT_PUBLIC_PUSHER_CLUSTER)
  );

  useEffect(() => {
    if (!enabled) return;

    const channel = pusherClient.subscribe("notifications");
    const handler = (data: NotificationItem) => {
      setItems((prev) => [data, ...prev]);
    };
    channel.bind("new-notification", handler);

    return () => {
      channel.unbind("new-notification", handler);
      pusherClient.unsubscribe("notifications");
    };
  }, [enabled]);

  const sendTest = async () => {
    try {
      const res = await fetch("/api/realtime/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Notifikasi Uji",
          message: "Ini adalah pesan notifikasi real-time",
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e) {
      console.error(e);
      alert("Gagal mengirim notifikasi. Pastikan env Pusher sudah diisi.");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Notifikasi</h1>

      {!enabled && (
        <Card className="p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Realtime belum dikonfigurasi. Tambahkan `NEXT_PUBLIC_PUSHER_APP_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`,
            `PUSHER_APP_ID`, dan `PUSHER_SECRET` di `.env.local`.
          </p>
        </Card>
      )}

      <div className="mb-6">
        <Button onClick={sendTest}>Kirim Notifikasi Uji</Button>
      </div>

      {items.length === 0 ? (
        <Card className="p-6">
          <p className="text-gray-600 dark:text-gray-400">Belum ada notifikasi.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((n, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{n.message}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(n.timestamp).toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}