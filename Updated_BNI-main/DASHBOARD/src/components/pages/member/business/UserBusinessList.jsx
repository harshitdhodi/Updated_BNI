import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertTriangle, Pencil, Trash2, Building2, Briefcase, Phone, Mail, MapPin, Factory } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BusinessFormModal from './UserBusinessForm';

export default function UserBusinessList() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentBusinessId, setCurrentBusinessId] = useState(null);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const { id: userId } = useParams();

  // Calculate pageCount
  useEffect(() => {
    if (totalItems > 0) {
      setPageCount(Math.ceil(totalItems / pageSize));
    } else {
      setPageCount(1);
    }
  }, [totalItems, pageSize]);

  // Reset pageIndex if exceeds pageCount
  useEffect(() => {
    if (totalItems > 0 && pageIndex >= pageCount) {
      setPageIndex(Math.max(0, pageCount - 1));
    }
  }, [pageCount, pageIndex, totalItems]);

  // Fetch all businesses
  const fetchBusinesses = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/business/getbusinessByuserId`, {
        params: { 
          userId,
          page: pageIndex + 1,
          limit: pageSize
        }
      });
      setBusinesses(response.data.data || []);
      setTotalItems(response.data.total || 0);
      if (response.data.totalPages) {
        setPageCount(response.data.totalPages);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch businesses.');
    } finally {
      setLoading(false);
    }
  }, [userId, pageIndex, pageSize]);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  // Modal handlers
  const openAddModal = () => {
    setModalMode('add');
    setCurrentBusinessId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (business) => {
    setModalMode('edit');
    setCurrentBusinessId(business._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBusinessId(null);
  };

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

  // Pagination handlers
  const handlePreviousPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) setPageIndex(pageIndex + 1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPageIndex(0);
  };

  const goToPage = (page) => setPageIndex(page - 1);
  const goToFirstPage = () => setPageIndex(0);
  const goToLastPage = () => setPageIndex(pageCount - 1);

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
  const startingRowNumber = pageIndex * pageSize;

  const getIndustryName = (business) => {
    return typeof business.industryName === 'object'
      ? business.industryName?.name || '—'
      : business.industryName || '—';
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen  md:p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-gradient-to-r bg-[#ddecfe] px-4 md:px-6 py-4 md:py-5 flex justify-between items-center">
              <h1 className="text-xl md:text-2xl font-bold text-black">My Businesses</h1>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-white text-red-600 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 shadow-md text-sm md:text-base"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add Business</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-red-600" size={48} />
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-600 uppercase bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-16">#</th>
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
                      <td colSpan="8" className="text-center py-10 text-gray-500">
                        No businesses found. Click "Add Business" to create one.
                      </td>
                    </tr>
                  ) : (
                    businesses.map((business, index) => (
                      <tr key={business._id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {startingRowNumber + index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {business.companyName || '—'}
                        </td>
                        <td className="px-6 py-4">{getIndustryName(business)}</td>
                        <td className="px-6 py-4">{business.designation || '—'}</td>
                        <td className="px-6 py-4">
                          {business.mobile ? (
                            <a href={`tel:${business.mobile}`} className="text-blue-600 hover:underline">
                              {business.mobile}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          {business.email ? (
                            <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">
                              {business.email}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 max-w-xs truncate">
                          {business.companyAddress || '—'}
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

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {businesses.length === 0 && !loading ? (
                <div className="text-center py-12 text-slate-500">
                  No businesses found. Click "Add Business" to create one.
                </div>
              ) : (
                businesses.map((business, index) => (
                  <div key={business._id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {startingRowNumber + index + 1}
                          </div>
                          <h3 className="font-semibold text-slate-800 text-lg truncate max-w-[180px]">
                            {business.companyName || 'Unnamed Business'}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(business)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(business)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Industry */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Factory size={18} className="text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Industry</p>
                          <p className="text-sm text-slate-800">{getIndustryName(business)}</p>
                        </div>
                      </div>

                      {/* Designation */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase size={18} className="text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Designation</p>
                          <p className="text-sm text-slate-800">{business.designation || '—'}</p>
                        </div>
                      </div>

                      {/* Mobile */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone size={18} className="text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Mobile</p>
                          {business.mobile ? (
                            <a href={`tel:${business.mobile}`} className="text-sm text-blue-600 hover:underline">
                              {business.mobile}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-400">—</p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail size={18} className="text-rose-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                          {business.email ? (
                            <a href={`mailto:${business.email}`} className="text-sm text-blue-600 hover:underline truncate block">
                              {business.email}
                            </a>
                          ) : (
                            <p className="text-sm text-slate-400">—</p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin size={18} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Address</p>
                          <p className="text-sm text-slate-800 line-clamp-2">{business.companyAddress || '—'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 md:px-6 py-4 bg-slate-50 border-t border-slate-200">
              {/* Rows per page */}
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="hidden sm:inline">entries</span>
              </div>

              {/* Page info */}
              <span className="text-sm text-gray-600">
                {totalItems === 0
                  ? "No entries"
                  : `Showing ${startingRowNumber + 1} to ${Math.min((pageIndex + 1) * pageSize, totalItems)} of ${totalItems}`}
              </span>

              {/* Pagination Controls */}
              <nav className="flex items-center gap-1 flex-wrap justify-center" aria-label="Pagination">
                <button
                  onClick={goToFirstPage}
                  disabled={isFirstPage}
                  className={`px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-all ${isFirstPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  First
                </button>
                <button
                  onClick={handlePreviousPage}
                  disabled={isFirstPage}
                  className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFirstPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  Prev
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        key={`page-${page}`}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === page ? "bg-blue-600 text-white shadow-md" : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-300"}`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                {/* Mobile: Show current page */}
                <span className="sm:hidden px-3 py-2 text-sm text-gray-600">
                  {currentPage} / {pageCount}
                </span>

                <button
                  onClick={handleNextPage}
                  disabled={isLastPage}
                  className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  Next
                </button>
                <button
                  onClick={goToLastPage}
                  disabled={isLastPage}
                  className={`px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
                >
                  Last
                </button>
              </nav>
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