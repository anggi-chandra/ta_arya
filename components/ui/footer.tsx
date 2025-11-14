import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image 
                src="/logo.png" 
                alt="Bagoes Esports Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
              <h3 className="text-xl font-bold">Bagoes Esports</h3>
            </div>
            <p className="mt-4 text-gray-300">
              Platform manajemen event esports terbaik untuk komunitas gaming Indonesia.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Navigasi</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-white">Beranda</Link></li>
              <li><Link href="/events" className="text-gray-300 hover:text-white">Event</Link></li>
              <li><Link href="/tournaments" className="text-gray-300 hover:text-white">Turnamen</Link></li>
              <li><Link href="/teams" className="text-gray-300 hover:text-white">Tim</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Komunitas</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/community" className="text-gray-300 hover:text-white">Forum</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white">FAQ</Link></li>
              <li><Link href="/support" className="text-gray-300 hover:text-white">Bantuan</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Kontak</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-gray-300">Email: info@esportshub.id</li>
              <li className="text-gray-300">Telepon: +62 812 3456 7890</li>
              <li className="text-gray-300">Alamat: Jl. Esports No. 123, Jakarta</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-gray-300 text-center">
            &copy; {new Date().getFullYear()} Bagoes Esports. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}