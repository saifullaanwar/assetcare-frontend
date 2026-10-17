'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Plus, Trash2, Edit2, FolderTree } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || res.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setName(category.name);
      setCode(category.code);
      setDescription(category.description || '');
    } else {
      setEditingId(null);
      setName('');
      setCode('');
      setDescription('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, code, description });
      } else {
        await api.post('/categories', { name, code, description });
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori Aset</h1>
          <p className="text-sm text-gray-600">Kelola kategori pengelompokan perangkat</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow transition"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th className="py-3 px-4">Nama Kategori</th>
              <th className="py-3 px-4">Kode</th>
              <th className="py-3 px-4">Deskripsi</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-4 text-center">Memuat data...</td>
              </tr>
            ) : categories.length > 0 ? (
              categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold text-gray-900 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-blue-500" />
                    {cat.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-mono">
                      {cat.code}
                    </span>
                  </td>
                  <td className="py-3 px-4">{cat.description || '-'}</td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(cat)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">Belum ada data kategori.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Kategori' : 'Tambah Kategori'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Kategori</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Laptop / Monitor / Server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kode Kategori</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono"
                  placeholder="LAPTOP / MONITOR / SERVER"
                />
                <p className="text-xs text-gray-400 mt-1">Kode unik singkat, huruf kapital. Contoh: LAPTOP</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                  placeholder="Keterangan kategori..."
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
