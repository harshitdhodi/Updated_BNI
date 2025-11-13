import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function UserMyAsk() {
  const { id: userId } = useParams();
  console.log('userId', userId);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    dept: '',
    message: '',
  });
  const [modalLoading, setModalLoading] = useState(false); // ← New: modal loading

  /* --------------------------------------------------------------------- *
   *  API helpers with axios
   * --------------------------------------------------------------------- */
  const api = useMemo(() => ({
    async get() {
      try {
        const response = await axios.get(`/api/myAsk/getMyAsk`, {
          params: { userId }
        });
        return response.data.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch records');
      }
    },

    async getById(id) {
      try {
        const response = await axios.get(`/api/myAsk/getMyAskById`, {
          params: { id }
        });
        return response.data.data; // { id, companyName, dept, message }
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch record');
      }
    },

    async add(payload) {
      try {
        const response = await axios.post(`/api/myAsk/addMyAsk`, payload, {
          params: { user: userId }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to add record');
      }
    },

    async update(updateId, payload) {
      try {
        const response = await axios.put(`/api/myAsk/updateMyAsk`, payload, {
          params: { id: updateId }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update record');
      }
    },

    async delete(deleteId) {
      try {
        await axios.delete(`/api/myAsk/deleteMyAskById`, {
          params: { id: deleteId }
        });
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete record');
      }
    },
  }), [userId]);

  /* --------------------------------------------------------------------- *
   *  Load data on mount
   * --------------------------------------------------------------------- */
  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const responseData = await api.get();
      setData(Array.isArray(responseData) ? responseData : []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, api]);

  useEffect(() => {
    if (!userId) {
      console.log('No userId available yet');
      return;
    }
    loadData();
  }, [userId, loadData]);

  /* --------------------------------------------------------------------- *
   *  Modal handlers
   * --------------------------------------------------------------------- */
  const openAddModal = () => {
    setModalMode('add');
    setFormData({ companyName: '', dept: '', message: '' });
    setCurrentItem(null);
    setIsModalOpen(true);
    setModalLoading(false);
  };

  const openEditModal = async (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setIsModalOpen(true);
    setModalLoading(true);

    // Show empty form while loading
    setFormData({ companyName: '', dept: '', message: '' });

    try {
      const freshData = await api.getById(item._id);
      setFormData({
        companyName: freshData.companyName || '',
        dept: freshData.dept || '',
        message: freshData.message || '',
      });
    } catch (error) {
      toast.error(error.message);
      // Fallback: use local data
      setFormData({
        companyName: item.companyName,
        dept: item.dept,
        message: item.message,
      });
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ companyName: '', dept: '', message: '' });
    setCurrentItem(null);
    setModalLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* --------------------------------------------------------------------- *
   *  CRUD handlers (optimistic updates)
   * --------------------------------------------------------------------- */
  const handleSubmit = async () => {
    if (!formData.companyName || !formData.dept || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (modalMode === 'add') {
        const tempId = Date.now();
        const optimisticItem = { id: tempId, ...formData };
        setData((prev) => [...prev, optimisticItem]);

        const added = await api.add(formData);
        setData((prev) => prev.map((i) => (i.id === tempId ? added.data : i)));
        toast.success('Record added');
      } else if (currentItem) {
        const optimisticItem = { ...currentItem, ...formData };
        setData((prev) => prev.map((i) => (i.id === currentItem.id ? optimisticItem : i)));

        const updated = await api.update(currentItem._id, formData);
        setData((prev) => prev.map((i) => (i._id === currentItem._id ? updated.data : i)));
        toast.success('Record updated');
      }
    } catch (e) {
      toast.error(e.message);
      loadData(); // rollback
    } finally {
      closeModal();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    setData((prev) => prev.filter((i) => i._id !== id));

    try {
      await api.delete(id);
      toast.success('Record deleted');
    } catch (e) {
      toast.error(e.message);
      loadData();
    }
  };

  /* --------------------------------------------------------------------- *
   *  Render
   * --------------------------------------------------------------------- */
  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen p-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-gradient-to-r bg-[#ddecfe] px-6 py-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-black">My Asks</h1>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 shadow-md"
              >
                <Plus size={20} />
                Add New
              </button>
            </div>

            {/* Table Loading Spinner */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-red-600" size={48} />
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Company Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        {loading ? 'Loading…' : 'No records found. Click "Add New" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    data.map((item, index) => (
                      <tr key={item._id || item.id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.companyName}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.dept}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.message}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
                <h2 className="text-xl font-bold text-white">
                  {modalMode === 'add' ? 'Add New Record' : 'Edit Record'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors duration-150"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {modalLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150"
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                      <input
                        type="text"
                        name="dept"
                        value={formData.dept}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150"
                        placeholder="Enter department"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 resize-none"
                        placeholder="Enter message"
                      />
                    </div>
                  </>
                )}

                {/* Modal Footer */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    disabled={modalLoading}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors duration-150 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={modalLoading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-150 shadow-md disabled:opacity-50"
                  >
                    {modalMode === 'add' ? 'Add Record' : 'Update Record'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}