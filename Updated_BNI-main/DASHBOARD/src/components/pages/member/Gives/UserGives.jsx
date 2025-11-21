import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
import MyGivesTable from './MyGivesTable';
import toast, { Toaster } from 'react-hot-toast';
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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalGives, setTotalGives] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const { id: userId } = useParams();

  // Calculate pageCount when totalGives or pageSize changes
  useEffect(() => {
    if (totalGives > 0) {
      const calculated = Math.ceil(totalGives / pageSize);
      setPageCount(calculated);
    } else {
      setPageCount(1);
    }
  }, [totalGives, pageSize]);

  // Reset pageIndex if it exceeds pageCount (e.g., after deletion)
  useEffect(() => {
    if (totalGives > 0 && pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageCount, pageIndex, totalGives]);

  // Fetch data from API
const fetchData = useCallback(async () => {
  if (!userId) return;
  try {
    setLoading(true);
    const response = await axios.get(`/api/myGives/getMyGives`, {
      params: {
        userId,
        page: pageIndex + 1,
        limit: pageSize,
      }
    });
    setData(response.data.data || []);
    setTotalGives(response.data.total || 0);
    setPageCount(response.data.totalPages || 1); // Use totalPages from backend
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to fetch records.');
  } finally {
    setLoading(false);
  }
}, [userId, pageIndex, pageSize]);
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
    setCurrentItem(null);
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
      fetchData();
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
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageIndex(0);
  };

  const goToPage = (page) => {
    setPageIndex(page - 1);
  };

  const goToFirstPage = () => {
    setPageIndex(0);
  };

  const goToLastPage = () => {
    setPageIndex(pageCount - 1);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pageCount;
    const current = pageIndex + 1;
    const delta = 2;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (current <= delta + 2) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (current >= totalPages - delta - 1) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - delta; i <= current + delta; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= pageCount - 1;
  const currentPage = pageIndex + 1;

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen sm:p-8 bg-slate-50">
        <div className="w-full mx-auto">
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
              pageIndex={pageIndex}
              pageSize={pageSize}
            />

            {/* Pagination */}
            <div className="px-4 py-4 bg-slate-50 border-t border-slate-200">
              <div className="max-w-7xl mx-auto">
                {/* Top row: Rows per page + Page info (stacked on mobile) */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* Rows per page */}
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-700">
                    <span className="whitespace-nowrap">Show</span>
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                    <span className="whitespace-nowrap">entries</span>
                  </div>

                  {/* Page info */}
                  <span className="text-sm text-gray-600 text-center sm:text-right">
                    {totalGives === 0
                      ? "No entries to show"
                      : `Showing ${pageIndex * pageSize + 1} to ${Math.min(
                          (pageIndex + 1) * pageSize,
                          totalGives
                        )} of ${totalGives} entries`}
                  </span>
                </div>

                {/* Pagination Controls - touch friendly */}
                <nav className="flex flex-wrap justify-center items-center gap-2 mt-4" aria-label="Pagination">
                  <button
                    onClick={goToFirstPage}
                    disabled={isFirstPage}
                    className={`px-4 py-2.5 min-w-[80px] text-sm font-medium rounded-lg transition-all ${
                      isFirstPage
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    First
                  </button>

                  <button
                    onClick={handlePreviousPage}
                    disabled={isFirstPage}
                    className={`px-5 py-2.5 min-w-[100px] text-sm font-medium rounded-lg transition-all ${
                      isFirstPage
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    Previous
                  </button>

                  {/* Page Numbers - responsive & touch-friendly */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {getPageNumbers().map((page, idx) =>
                      page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-3 py-2 text-gray-500 text-sm">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${page}`}
                          onClick={() => goToPage(page)}
                          className={`w-11 h-11 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                            currentPage === page
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-300"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={isLastPage}
                    className={`px-5 py-2.5 min-w-[100px] text-sm font-medium rounded-lg transition-all ${
                      isLastPage
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    Next
                  </button>

                  <button
                    onClick={goToLastPage}
                    disabled={isLastPage}
                    className={`px-4 py-2.5 min-w-[80px] text-sm font-medium rounded-lg transition-all ${
                      isLastPage
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    Last
                  </button>
                </nav>
              </div>
            </div>
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