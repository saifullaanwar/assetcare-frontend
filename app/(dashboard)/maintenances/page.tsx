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
  maintenance_date: string;
  cost: number;
  action_taken: string;
  notes: string | null;
  asset?: Asset;
}

export default function MaintenancesPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [assetId, setAssetId] = useState<number | ''>('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [cost, setCost] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      const [maintRes, assetRes] = await Promise.all([
        api.get('/maintenances'),
        api.get('/assets'),
      ]);
      setMaintenances(maintRes.data.data || maintRes.data);
      setAssets(assetRes.data.data || assetRes.data);
    } catch (err) {
      console.error('Failed to fetch maintenances data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item?: Maintenance) => {
    if (item) {
      setEditingId(item.id);
      setAssetId(item.asset_id);
      setMaintenanceDate(item.maintenance_date);
      setCost(String(item.cost));
      setActionTaken(item.action_taken);
      setNotes(item.notes || '');
    } else {
      setEditingId(null);
      setAssetId(assets[0]?.id || '');
      setMaintenanceDate(new Date().toISOString().split('T')[0]);
      setCost('');
      setActionTaken('');
      setNotes('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      asset_id: Number(assetId),
      maintenance_date: maintenanceDate,
      cost: Number(cost),
      action_taken: actionTaken,
      notes: notes || null,
    };

    try {
      if (editingId) {
        await api.put(`/maintenances/${editingId}`, payload);
      } else {
        await api.post('/maintenances', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan riwayat perawatan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus catatan perawatan ini?')) return;
    try {
      await api.delete(`/maintenances/${id}`);
      fetchData();
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
                <th className="py-3 px-4">Nama Perangkat</th>
                <th className="py-3 px-4">Nomor Seri</th>
                <th className="py-3 px-4">Tanggal Servis</th>
                <th className="py-3 px-4">Tindakan / Perbaikan</th>
                <th className="py-3 px-4">Biaya</th>
                <th className="py-3 px-4">Catatan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center">Memuat data...</td>
                </tr>
              ) : maintenances.length > 0 ? (
                maintenances.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-yellow-600" />
                      {item.asset?.name || '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{item.asset?.serial_number || '-'}</td>
                    <td className="py-3 px-4">{item.maintenance_date}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{item.action_taken}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      Rp {Number(item.cost).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{item.notes || '-'}</td>
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
                  <td colSpan={7} className="py-4 text-center text-gray-400">
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
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
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
                  <label className="block text-sm font-medium text-gray-700">Biaya Perawatan (Rp)</label>
                  <input
                    type="number"
                    required
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="250000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Tindakan / Perbaikan yang Dilakukan</label>
                <input
                  type="text"
                  required
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Ganti pasta thermal / Pembersihan kipas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                  placeholder="Garansi servis 1 bulan dari vendor IT..."
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