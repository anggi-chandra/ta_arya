"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TournamentRegisterPage({ params }: { params: { id: string } }) {
  const tournamentId = params.id;
  const { data: session } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    teamName: "",
    teamCaptain: "",
    email: "",
    phone: "",
    members: ["", "", "", "", ""],
    substitute: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [tournament, setTournament] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        teamCaptain: session?.user?.name || "",
        email: session?.user?.email || ""
      }));
    }
    fetchTournament();
  }, [session]);

  const fetchTournament = async () => {
    try {
      const response = await fetch(`/api/events/${tournamentId}`);
      const data = await response.json();
      // API returns { event }, set the event object directly
      setTournament(data?.event ?? null);
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index: number, value: string) => {
    const newMembers = [...formData.members];
    newMembers[index] = value;
    setFormData(prev => ({ ...prev, members: newMembers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      // Route group (auth) maps to /login in this project
      router.push('/login');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/events/${tournamentId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName: formData.teamName,
          teamCaptain: formData.teamCaptain,
          email: formData.email,
          phone: formData.phone,
          members: formData.members.filter(m => m.trim() !== ""),
          substitute: formData.substitute
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Pendaftaran berhasil! Tim Anda telah terdaftar dalam turnamen.');
        router.push(`/tournaments/${tournamentId}`);
      } else {
        alert(`Pendaftaran gagal: ${result.error || 'Terjadi kesalahan'}`);
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tournament) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-6 text-center">Memuat data turnamen...</Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/tournaments/${tournamentId}`} className="text-blue-600 hover:underline flex items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Kembali ke Detail Turnamen
        </Link>
        
        <h1 className="text-2xl font-bold mb-2">Pendaftaran Turnamen</h1>
        <p className="text-gray-600">{tournament?.title}</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Tim *</label>
            <input
              type="text"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ketua Tim *</label>
            <input
              type="text"
              name="teamCaptain"
              value={formData.teamCaptain}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nomor Telepon *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nama Anggota Tim (5 Pemain Utama) *</label>
            {formData.members.map((member, index) => (
              <input
                key={index}
                type="text"
                value={member}
                onChange={(e) => handleMemberChange(index, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                placeholder={`Pemain ${index + 1}`}
                required
              />
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Pemain Cadangan (Opsional)</label>
            <input
              type="text"
              name="substitute"
              value={formData.substitute}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama pemain cadangan"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Informasi Penting:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Pastikan semua data diisi dengan benar</li>
              <li>• Setelah mendaftar, tim Anda akan diverifikasi oleh panitia</li>
              <li>• Anda akan menerima email konfirmasi setelah verifikasi</li>
              <li>• Hubungi panitia jika ada pertanyaan</li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link href={`/tournaments/${tournamentId}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Batal
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}