'use client';

import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm">
      <div className="text-sm font-medium text-gray-500">
        Sistem Manajemen & Perawatan Perangkat
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="p-1.5 bg-gray-100 rounded-full text-gray-600">
            <User className="w-4 h-4" />
          </div>
          <span className="font-semibold text-gray-900">{user?.name || 'User'}</span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
}