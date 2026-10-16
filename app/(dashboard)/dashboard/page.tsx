'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Box, Wrench, CheckCircle, DollarSign } from 'lucide-react';

interface DashboardData {
  total_assets: number;
  available_assets: number;
  in_use_assets: number;
  maintenance_assets: number;
  disposed_assets: number;
  total_maintenance_cost: number;
  recent_maintenances: Array<{
    id: number;
    asset: { name: string; serial_number: string };
    maintenance_date: string;
    cost: number;
    action_taken: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data.data || res.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
        <p className="text-sm text-gray-600">Ringkasan status perangkat dan biaya perawatan</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Perangkat</p>
            <h3 className="text-2xl font-bold text-gray-900">{data?.total_assets || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Aktif / Tersedia</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {(data?.available_assets || 0) + (data?.in_use_assets || 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Dalam Perawatan</p>
            <h3 className="text-2xl font-bold text-gray-900">{data?.maintenance_assets || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Biaya Servis</p>
            <h3 className="text-xl font-bold text-gray-900">
              Rp {Number(data?.total_maintenance_cost || 0).toLocaleString('id-ID')}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabel 5 Maintenance Terbaru */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Riwayat Perawatan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Nama Perangkat</th>
                <th className="py-3 px-4">Nomor Seri</th>
                <th className="py-3 px-4">Tanggal Servis</th>
                <th className="py-3 px-4">Tindakan</th>
                <th className="py-3 px-4">Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.recent_maintenances && data.recent_maintenances.length > 0 ? (
                data.recent_maintenances.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.asset?.name || '-'}</td>
                    <td className="py-3 px-4">{item.asset?.serial_number || '-'}</td>
                    <td className="py-3 px-4">{item.maintenance_date}</td>
                    <td className="py-3 px-4">{item.action_taken}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      Rp {Number(item.cost || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-400">
                    Belum ada riwayat perawatan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}