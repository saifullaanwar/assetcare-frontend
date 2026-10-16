'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2, Edit2, MapPin } from 'lucide-react';

interface Location {
  id: number;
  name: string;
  code: string;
  building: string | null;
  description: string | null;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [building, setBuilding] = useState('');
  const [description, setDescription] = useState('');

  const fetchLocations = async () => {
    try {
      const res = await api.get('/locations');
      setLocations(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingId(location.id);
      setName(location.name);
      setCode(location.code);
      setBuilding(location.building || '');
      setDescription(location.description || '');
    } else {
      setEditingId(null);
      setName('');
      setCode('');
      setBuilding('');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/locations/${editingId}`, { name, code, building, description });
      } else {
        await api.post('/locations', { name, code, building, description });
      }
      setShowModal(false);
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan lokasi');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus lokasi ini?')) return;
    try {
      await api.delete(`/locations/${id}`);
      fetchLocations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus lokasi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Lokasi Aset</h1>
          <p className="text-sm text-gray-600">Kelola penempatan fisik dan ruangan aset</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Lokasi
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Nama Lokasi / Ruangan</th>
              <th className="py-3 px-4">Kode</th>
              <th className="py-3 px-4">Gedung</th>
              <th className="py-3 px-4">Keterangan</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-4 text-center">Memuat data...</td>
              </tr>
            ) : locations.length > 0 ? (
              locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {loc.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded font-mono">
                      {loc.code}
                    </span>
                  </td>
                  <td className="py-3 px-4">{loc.building || '-'}</td>
                  <td className="py-3 px-4">{loc.description || '-'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(loc)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-400">Belum ada data lokasi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Lokasi' : 'Tambah Lokasi'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Lokasi / Ruangan</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Ruang Server Lt. 2 / Ruang IT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kode Lokasi</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                  placeholder="KP-L1 / SRV-1"
                />
                <p className="text-xs text-gray-400 mt-1">Kode unik singkat. Contoh: KP-L2</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Gedung</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Gedung Utama / Gedung B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Keterangan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={2}
                  placeholder="Deskripsi tambahan lokasi..."
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
