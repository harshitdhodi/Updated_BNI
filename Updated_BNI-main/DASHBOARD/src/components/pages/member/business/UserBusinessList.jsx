import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertTriangle, Pencil, Trash2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Import the modal component (make sure it's saved as BusinessFormModal.jsx in same folder)
import BusinessFormModal from './UserBusinessForm';

export default function UserBusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentBusinessId, setCurrentBusinessId] = useState(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { id: userId } = useParams();

  // Fetch all businesses
  const fetchBusinesses = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/business/getbusinessByuserId`, {
        params: { userId }
      });
      setBusinesses(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch businesses.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Open Add Modal
  const openAddModal = () => {
    setModalMode('add');
    setCurrentBusinessId(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (business) => {
    setModalMode('edit');
    setCurrentBusinessId(business._id);
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBusinessId(null);
  };

  // Refresh list after add/edit
  const handleSuccess = () => {
    fetchBusinesses();
    toast.success(modalMode === 'add' ? 'Business added!' : 'Business updated!');
  };

  // Delete handlers
  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setItemToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`/api/business/deleteBusinessById`, {
        params: { id: itemToDelete._id }
      });
      toast.success('Business deleted successfully!');
      closeDeleteModal();
      fetchBusinesses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete business.');
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-gradient-to-r bg-[#ddecfe] px-6 py-5 flex justify-between items-center">
              <h1 className="text-2xl font-bold text-black">My Businesses</h1>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 shadow-md"
              >
                <Plus size={20} />
                Add Business
              </button>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-red-600" size={48} />
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Company Name</th>
                    <th className="px-6 py-4 font-semibold">Industry</th>
                    <th className="px-6 py-4 font-semibold">Designation</th>
                    <th className="px-6 py-4 font-semibold">Mobile</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Address</th>
                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.length === 0 && !loading ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-gray-500">
                        No businesses found. Click "Add Business" to create one.
                      </td>
                    </tr>
                  ) : (
                    businesses.map((business) => (
                      <tr key={business._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {business.companyName || '-'}
                        </td>
                        <td className="px-6 py-4">
                          {typeof business.industryName === 'object' 
                            ? business.industryName?.name || '-' 
                            : business.industryName || '-'}
                        </td>
                        <td className="px-6 py-4">{business.designation || '-'}</td>
                        <td className="px-6 py-4">
                          {business.mobile ? (
                            <a href={`tel:${business.mobile}`} className="text-blue-600 hover:underline">
                              {business.mobile}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4">
                          {business.email ? (
                            <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">
                              {business.email}
                            </a>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">
                          {business.companyAddress || '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => openEditModal(business)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(business)}
                              className="text-red-600 hover:text-red-800 transition-colors"
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
      </div>

      {/* Add/Edit Business Modal */}
      <BusinessFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        businessId={currentBusinessId}
        userId={userId}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Delete Business</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to delete <strong>{itemToDelete?.companyName}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-slate-50 rounded-b-xl">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-150 shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}