"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (!name || !email || !subject || !message) {
        setError("Harap lengkapi semua field.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Gagal mengirim pesan");
      }

      const data = await res.json();
      setSuccess(`Pesan terkirim. Ticket ID: ${data.id}`);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Kontak Kami</h1>
      <p className="text-muted-foreground mb-6">
        Ada pertanyaan atau masukan? Kirimkan pesan Anda melalui formulir di bawah ini.
      </p>

      <Card className="p-6 space-y-4">
        {success && (
          <div className="rounded-md bg-green-50 text-green-700 p-3 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 text-red-700 p-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="Nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-gray-400"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subjek</label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="Judul pesan"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pesan</label>
            <textarea
              className="w-full min-h-[140px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="Tulis pesan Anda di sini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Kami biasanya membalas dalam 1–2 hari kerja.
            </p>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 text-sm text-muted-foreground">
        Atau hubungi kami via email: <span className="font-medium">support@esports.local</span>
      </div>
    </div>
  );
}