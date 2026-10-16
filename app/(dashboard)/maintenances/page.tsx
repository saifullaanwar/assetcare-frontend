'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2, Edit2, Wrench } from 'lucide-react';

interface Asset {
  id: number;
  name: string;
  serial_number: string;
}

interface Maintenance {
  id: number;
  asset_id: number;
  title: string;
  maintenance_date: string;
  next_service_date: string | null;
  cost: number | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  performed_by: string | null;
  notes: string | null;
  asset?: Asset;
}

// Hitung badge berdasarkan next_service_date
function getServiceBadge(nextServiceDate: string | null) {
  if (!nextServiceDate) return null;

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

function getStatusBadge(status: string) {
  switch (status) {
    case 'scheduled':
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Terjadwal</span>;
    case 'in_progress':
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Berlangsung</span>;
    case 'completed':
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Selesai</span>;
    case 'cancelled':
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Dibatalkan</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
  }
}

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [assetId, setAssetId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'in_progress' | 'completed' | 'cancelled'>('completed');
  const [performedBy, setPerformedBy] = useState('');
  const [notes, setNotes] = useState('');

  const fetchMaintenances = async () => {
    try {
      const maintRes = await api.get('/maintenances');
      setMaintenances(maintRes.data.data || maintRes.data);
    } catch (err) {
      console.error('Failed to fetch maintenances', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (item?: Maintenance) => {
    // Fetch assets fresh setiap buka modal
    try {
      const assetRes = await api.get('/assets');
      setAssets(assetRes.data.data || assetRes.data);
    } catch (err) {
      console.error('Gagal memuat daftar aset', err);
    }

    if (item) {
      setEditingId(item.id);
      setAssetId(item.asset_id);
      setTitle(item.title);
      setMaintenanceDate(item.maintenance_date);
      setNextServiceDate(item.next_service_date || '');
      setCost(item.cost ? String(item.cost) : '');
      setStatus(item.status);
      setPerformedBy(item.performed_by || '');
      setNotes(item.notes || '');
    } else {
      setEditingId(null);
      setAssetId('');
      setTitle('');
      setMaintenanceDate(new Date().toISOString().split('T')[0]);
      setNextServiceDate('');
      setCost('');
      setStatus('completed');
      setPerformedBy('');
      setNotes('');
    }
    setShowModal(true);
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      asset_id: Number(assetId),
      title,
      maintenance_date: maintenanceDate,
      next_service_date: nextServiceDate || null,
      cost: cost ? Number(cost) : null,
      status,
      performed_by: performedBy || null,
      notes: notes || null,
    };

    try {
      if (editingId) {
        await api.put(`/maintenances/${editingId}`, payload);
      } else {
        await api.post('/maintenances', payload);
      }
      setShowModal(false);
      fetchMaintenances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan riwayat perawatan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus catatan perawatan ini?')) return;
    try {
      await api.delete(`/maintenances/${id}`);
      fetchMaintenances();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus catatan perawatan');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Perawatan / Servis</h1>
          <p className="text-sm text-gray-600">Pencatatan aktivitas perbaikan dan pemeliharaan aset</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Catatan Servis
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Perangkat</th>
                <th className="py-3 px-4">Judul / Tindakan</th>
                <th className="py-3 px-4">Tanggal Servis</th>
                <th className="py-3 px-4">Jadwal Berikutnya</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Teknisi</th>
                <th className="py-3 px-4">Biaya</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center">Memuat data...</td>
                </tr>
              ) : maintenances.length > 0 ? (
                maintenances.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-yellow-600 shrink-0" />
                        <div>
                          <div>{item.asset?.name || '-'}</div>
                          <div className="text-xs font-mono text-gray-400">{item.asset?.serial_number || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800">{item.title}</td>
                    <td className="py-3 px-4">{item.maintenance_date}</td>
                    <td className="py-3 px-4">{getServiceBadge(item.next_service_date)}</td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-gray-600">{item.performed_by || '-'}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {item.cost ? `Rp ${Number(item.cost).toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-gray-400">
                    Belum ada riwayat perawatan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Catatan Perawatan' : 'Tambah Catatan Perawatan Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pilih Perangkat / Aset</label>
                <select
                  required
                  value={assetId}
                  onChange={(e) => setAssetId(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="" disabled>Pilih Perangkat</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.serial_number})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Judul / Jenis Perawatan</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Ganti pasta thermal / Service rutin / Perbaikan layar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Servis</label>
                  <input
                    type="date"
                    required
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Jadwal Servis Berikutnya</label>
                  <input
                    type="date"
                    value={nextServiceDate}
                    onChange={(e) => setNextServiceDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="scheduled">Terjadwal</option>
                    <option value="in_progress">Berlangsung</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Biaya Perawatan (Rp)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="250000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Teknisi / Vendor</label>
                <input
                  type="text"
                  value={performedBy}
                  onChange={(e) => setPerformedBy(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Nama teknisi atau vendor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan Tambahan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                  placeholder="Garansi servis 1 bulan / part yang diganti..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
