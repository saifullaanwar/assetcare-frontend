'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Box, Wrench, CheckCircle, DollarSign } from 'lucide-react';

interface CostPerCategory {
  id: number;
  name: string;
  code: string;
  total_cost: number;
}

interface RecentMaintenance {
  id: number;
  title: string;
  maintenance_date: string;
  next_service_date: string | null;
  cost: number | null;
  status: string;
  performed_by: string | null;
  asset: {
    name: string;
    serial_number: string;
  } | null;
}

interface DashboardData {
  total_assets: number;
  available_assets: number;
  in_use_assets: number;
  maintenance_assets: number;
  disposed_assets: number;
  total_maintenance_cost: number;
  cost_per_category: CostPerCategory[];
  recent_maintenances: RecentMaintenance[];
}

function getServiceBadge(nextServiceDate: string | null) {
  if (!nextServiceDate) return <span className="text-gray-400">-</span>;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const serviceDate = new Date(nextServiceDate);
  serviceDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
        ⚠ Melewati Jadwal
      </span>
    );
  } else if (diffDays <= 3) {
    return (
      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
        ⏰ H-{diffDays}
      </span>
    );
  } else {
    return (
      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
        ✓ {nextServiceDate}
      </span>
    );
  }
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
            <p className="text-xs text-gray-400">
              {data?.available_assets || 0} tersedia · {data?.in_use_assets || 0} digunakan
            </p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabel 5 Maintenance Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Riwayat Perawatan Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="py-3 px-4">Perangkat</th>
                  <th className="py-3 px-4">Tindakan</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Jadwal Berikutnya</th>
                  <th className="py-3 px-4">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.recent_maintenances && data.recent_maintenances.length > 0 ? (
                  data.recent_maintenances.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        <div>{item.asset?.name || '-'}</div>
                        <div className="text-xs font-mono text-gray-400">{item.asset?.serial_number || ''}</div>
                      </td>
                      <td className="py-3 px-4">{item.title}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{item.maintenance_date}</td>
                      <td className="py-3 px-4">{getServiceBadge(item.next_service_date)}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900 whitespace-nowrap">
                        {item.cost ? `Rp ${Number(item.cost).toLocaleString('id-ID')}` : '-'}
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

        {/* Breakdown Biaya Per Kategori */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Biaya Servis per Kategori</h2>
          {data?.cost_per_category && data.cost_per_category.length > 0 ? (
            <div className="space-y-3">
              {data.cost_per_category
                .filter((c) => Number(c.total_cost) > 0)
                .sort((a, b) => Number(b.total_cost) - Number(a.total_cost))
                .map((cat) => {
                  const total = data.cost_per_category.reduce((sum, c) => sum + Number(c.total_cost), 0);
                  const pct = total > 0 ? Math.round((Number(cat.total_cost) / total) * 100) : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.name}</span>
                        <span className="text-gray-500">Rp {Number(cat.total_cost).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{pct}% dari total</div>
                    </div>
                  );
                })}
              {data.cost_per_category.every((c) => Number(c.total_cost) === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">Belum ada biaya servis tercatat.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada data kategori.</p>
          )}
        </div>
      </div>
    </div>
  );
}
