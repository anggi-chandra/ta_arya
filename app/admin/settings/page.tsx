"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Pengaturan Admin</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan untuk panel admin dan situs web.
        </p>
      </div>

      {/* Admin Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Admin</CardTitle>
          <CardDescription>
            Perbarui informasi profil dan kata sandi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Nama</Label>
              <Input id="admin-name" defaultValue="Admin Utama" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" defaultValue="admin@esportshub.local" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Kata Sandi Baru</Label>
            <Input id="new-password" type="password" placeholder="••••••••" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Simpan Perubahan Profil</Button>
        </CardFooter>
      </Card>

      {/* General Site Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Situs Umum</CardTitle>
          <CardDescription>
            Konfigurasi pengaturan global untuk seluruh situs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance-mode" className="font-semibold">Mode Perbaikan</Label>
              <p className="text-sm text-muted-foreground">
                Nonaktifkan akses publik ke situs untuk pemeliharaan.
              </p>
            </div>
            <Switch id="maintenance-mode" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="user-registration" className="font-semibold">Pendaftaran Pengguna Baru</Label>
              <p className="text-sm text-muted-foreground">
                Izinkan atau blokir pendaftaran pengguna baru.
              </p>
            </div>
            <Switch id="user-registration" defaultChecked />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-language">Bahasa Default Situs</Label>
            <Select defaultValue="id">
              <SelectTrigger>
                <SelectValue placeholder="Pilih bahasa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English (US)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Simpan Pengaturan Situs</Button>
        </CardFooter>
      </Card>

      {/* Dangerous Actions */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
          <CardDescription>
            Tindakan ini tidak dapat diurungkan. Harap berhati-hati.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Hapus Semua Data Pengguna</p>
              <p className="text-sm text-muted-foreground">
                Tindakan ini akan menghapus semua pengguna dari database.
              </p>
            </div>
            <Button variant="destructive">Hapus Pengguna</Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Reset Pengaturan Situs</p>
              <p className="text-sm text-muted-foreground">
                Mengembalikan semua pengaturan situs ke nilai default.
              </p>
            </div>
            <Button variant="destructive">Reset Pengaturan</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}