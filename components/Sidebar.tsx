'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, FolderTree, MapPin, Wrench } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Perangkat / Aset', href: '/assets', icon: Box },
  { name: 'Kategori', href: '/categories', icon: FolderTree },
  { name: 'Lokasi', href: '/locations', icon: MapPin },
  { name: 'Riwayat Servis', href: '/maintenances', icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wide text-blue-400">AssetCare</h1>
        <p className="text-xs text-slate-400 mt-1">Management System</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}