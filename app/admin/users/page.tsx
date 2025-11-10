"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

type UserRole = { id: string; role: string };
type Profile = { id: string; full_name?: string; username?: string; user_roles?: UserRole[] };

async function fetchUsers(search: string) {
  const params = new URLSearchParams();
  params.set("limit", "20");
  params.set("page", "1");
  if (search) params.set("search", search);

  const res = await fetch(`/api/admin/users?${params.toString()}`, {
    credentials: 'include'
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal memuat data pengguna");
  }
  
  return res.json() as Promise<{ users: Profile[] }>
}

async function deleteUser(id: string) {
  const res = await fetch(`/api/admin/users/${id}`, { 
    method: "DELETE",
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Gagal menghapus pengguna");
  }
  return res.json();
}

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => fetchUsers(search),
  });

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  const users = data?.users || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
        <Link href="/admin">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau username"
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
        />
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}>Cari</Button>
      </div>

      <Card className="p-4">
        {isLoading && <p className="text-gray-600 dark:text-gray-400">Memuat pengguna...</p>}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 font-medium">Error:</p>
            <p className="text-red-500 dark:text-red-300 text-sm mt-1">{(error as Error).message}</p>
            <button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })} 
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        )}
        {!isLoading && !error && users.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">Tidak ada pengguna.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              {search ? 'Coba ubah kata kunci pencarian.' : 'Belum ada pengguna terdaftar.'}
            </p>
          </div>
        )}
        {!isLoading && users.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2">Nama</th>
                <th className="py-2">Username</th>
                <th className="py-2">Role</th>
                <th className="py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2">{u.full_name || "-"}</td>
                  <td className="py-2">{u.username || u.id.substring(0, 8) || "-"}</td>
                  <td className="py-2">
                    {u.user_roles && u.user_roles.length > 0 
                      ? u.user_roles.map((r: UserRole) => r.role).join(", ")
                      : "user"
                    }
                  </td>
                  <td className="py-2">
                    <Button
                      variant="destructive"
                      onClick={() => mutation.mutate(u.id)}
                      disabled={mutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}