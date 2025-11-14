import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import MyGivesTable from './MyGivesTable';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import MyGivesForm from './MyGivesForm';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function UserGives() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { id: userId } = useParams();

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await axios.get(`/api/myGives/getMyGives`, { params: { userId } });
      setData(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch records.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('/api/department/getAllDepartment');
        if (response.data && Array.isArray(response.data.data)) {
          setDepartments(response.data.data);
        }
      } catch (error) {
        toast.error('Could not load departments.');
      }
    };
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setModalMode('add');
    setCurrentItem(null); // No initial data for add mode
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setModalLoading(false);
  };

  const handleSubmit = async (formData) => {
    setModalLoading(true);
    try {
      if (modalMode === 'add') {
        await axios.post(`/api/myGives/addMyGives`, formData, {
          params: { user: userId }
        });
        toast.success('Record added successfully!');
      } else {
        await axios.put(`/api/myGives/updateMyGives`, formData, {
          params: { id: currentItem._id }
        });
        toast.success('Record updated successfully!');
      }
      closeModal();
      fetchData(); // Refresh data after success
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    } finally {
      setModalLoading(false);
    }
  };

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
      await axios.delete(`/api/myGives/deletemyGivesById`, {
        params: { id: itemToDelete._id }
      });
      toast.success('Record deleted successfully!');
      closeDeleteModal();
      fetchData(); // Refresh the data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete record.');
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
            <h1 className="text-2xl font-bold text-black">My Gives</h1>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
          <MyGivesTable 
            data={data} 
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            loading={loading}
            departments={departments}
          />
        </div>
      </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <MyGivesForm
          mode={modalMode}
          initialData={currentItem}
          onSubmit={handleSubmit}
          onClose={closeModal}
          loading={modalLoading}
          departments={departments}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Delete Record</h3>
              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to delete this record? This action cannot be undone.
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