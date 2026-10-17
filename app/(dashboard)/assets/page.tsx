'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2, Edit2, Box } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Asset {
  id: number;
  name: string;
  serial_number: string;
  category_id: number;
  location_id: number;
  status: 'available' | 'in_use' | 'maintenance' | 'disposed';
  purchase_date: string | null;
  purchase_cost: number | null;
  category?: Category;
  location?: Location;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [locationId, setLocationId] = useState<number | ''>('');
  const [status, setStatus] = useState<'available' | 'in_use' | 'maintenance' | 'disposed'>('available');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchaseCost, setPurchaseCost] = useState('');

  const fetchAssets = async () => {
    try {
      const assetsRes = await api.get('/assets');
      setAssets(assetsRes.data.data || assetsRes.data);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleOpenModal = async (asset?: Asset) => {
    // Fetch categories & locations fresh setiap kali modal dibuka
    try {
      const [catRes, locRes] = await Promise.all([
        api.get('/categories'),
        api.get('/locations'),
      ]);
      setCategories(catRes.data.data || catRes.data);
      setLocations(locRes.data.data || locRes.data);
    } catch (err) {
      console.error('Gagal memuat kategori/lokasi', err);
    }

    if (asset) {
      setEditingId(asset.id);
      setName(asset.name);
      setSerialNumber(asset.serial_number);
      setCategoryId(asset.category_id);
      setLocationId(asset.location_id);
      setStatus(asset.status);
      setPurchaseDate(asset.purchase_date || '');
      setPurchaseCost(asset.purchase_cost ? String(asset.purchase_cost) : '');
    } else {
      setEditingId(null);
      setName('');
      setSerialNumber('');
      setCategoryId('');
      setLocationId('');
      setStatus('available');
      setPurchaseDate('');
      setPurchaseCost('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      serial_number: serialNumber,
      category_id: Number(categoryId),
      location_id: Number(locationId),
      status,
      purchase_date: purchaseDate || null,
      purchase_cost: purchaseCost ? Number(purchaseCost) : null,
    };

    try {
      if (editingId) {
        await api.put(`/assets/${editingId}`, payload);
      } else {
        await api.post('/assets', payload);
      }
      setShowModal(false);
      fetchAssets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan perangkat');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus perangkat ini?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus perangkat');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Tersedia</span>;
      case 'in_use':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Digunakan</span>;
      case 'maintenance':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Perawatan</span>;
      case 'disposed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Diarsipkan</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perangkat / Aset</h1>
          <p className="text-sm text-gray-600">Daftar inventaris hardware dan aset perusahaan</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Perangkat
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                <th className="py-3 px-4">Nama Perangkat</th>
                <th className="py-3 px-4">Nomor Seri</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Lokasi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Harga Beli</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center">Memuat data...</td>
                </tr>
              ) : assets.length > 0 ? (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                      <Box className="w-4 h-4 text-blue-600" />
                      {asset.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{asset.serial_number}</td>
                    <td className="py-3 px-4">{asset.category?.name || '-'}</td>
                    <td className="py-3 px-4">{asset.location?.name || '-'}</td>
                    <td className="py-3 px-4">{getStatusBadge(asset.status)}</td>
                    <td className="py-3 px-4">
                      {asset.purchase_cost
                        ? `Rp ${Number(asset.purchase_cost).toLocaleString('id-ID')}`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(asset)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
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
                    Belum ada data perangkat.
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
              {editingId ? 'Edit Perangkat' : 'Tambah Perangkat Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama Perangkat</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="MacBook Pro M3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nomor Seri</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="SN-12345678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kategori</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="" disabled>Pilih Kategori</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Lokasi Penempatan</label>
                  <select
                    required
                    value={locationId}
                    onChange={(e) => setLocationId(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="" disabled>Pilih Lokasi</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status Aset</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="available">Tersedia (Available)</option>
                    <option value="in_use">Digunakan (In Use)</option>
                    <option value="maintenance">Perawatan (Maintenance)</option>
                    <option value="disposed">Diarsipkan (Disposed)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tanggal Pembelian</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Harga Beli (Rp)</label>
                <input
                  type="number"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="15000000"
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