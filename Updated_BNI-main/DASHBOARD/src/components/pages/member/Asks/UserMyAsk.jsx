import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertTriangle, Building2, Briefcase, MessageSquare } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function UserMyAsk() {
  const { id: userId } = useParams();

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
  const [errors, setErrors] = useState({});
  const [modalLoading, setModalLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [departments, setDepartments] = useState([]);

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const departmentMap = useMemo(() =>
    new Map(departments.map(dept => [dept._id, dept.name])),
    [departments]
  );

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

  const api = useMemo(() => ({
    async get(page, limit) {
      try {
        const response = await axios.get(`/api/myAsk/getMyAsk`, {
          params: { userId, page, limit }
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch records');
      }
    },
    async getById(id) {
      try {
        const response = await axios.get(`/api/myAsk/getMyAskById`, {
          params: { id }
        });
        return response.data.data;
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

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await api.get(pageIndex + 1, pageSize);
      setData(Array.isArray(response.data) ? response.data : []);
      setTotalItems(response.total || 0);
      if (response.totalPages) {
        setPageCount(response.totalPages);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, api, pageIndex, pageSize]);

  useEffect(() => {
    if (userId) loadData();
  }, [userId, loadData]);

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

  // Modal handlers
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company Name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.companyName)) {
      newErrors.companyName = "Company Name must contain only letters and spaces.";
    }

    if (!formData.dept) {
      newErrors.dept = "Department is required.";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required.";
    } else if (formData.message.length < 15) {
      newErrors.message = "Message must be at least 15 characters long.";
    } else if (formData.message.length > 150) {
      newErrors.message = "Message cannot exceed 150 characters.";
    } else if (/<script\b[^>]*>[\s\S]*?<\/script>/gi.test(formData.message)) {
      newErrors.message = "Message contains invalid characters. HTML/Script is not allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    // Clear errors if validation passes
    setErrors({});

    setModalLoading(true);

    try {
      if (modalMode === 'add') {
        await api.add(formData);
        toast.success('Record added');
      } else if (currentItem) {
        await api.update(currentItem._id, formData);
        toast.success('Record updated');
      }
      closeModal();
      loadData();
    } catch (e) {
      toast.error(e.message);
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
      await api.delete(itemToDelete._id);
      toast.success('Record deleted');
      closeDeleteModal();
      loadData();
    } catch (e) {
      toast.error(e.message);
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

  const getDepartmentName = (item) => {
    return item.dept?.name || departmentMap.get(item.dept) || item.dept || '—';
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className="min-h-screen p-1 md:p-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
            {/* Header */}
            <div className="bg-gradient-to-r bg-[#ddecfe] px-4 md:px-6 py-4 md:py-5 flex justify-between items-center">
              <h1 className="text-xl md:text-2xl font-bold text-black">My Asks</h1>
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-white text-red-600 px-3 md:px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 shadow-md text-sm md:text-base"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-red-600" size={48} />
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">#</th>
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
                      <tr key={item._id} className="hover:bg-slate-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{startingRowNumber + index + 1}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{item.companyName}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{getDepartmentName(item)}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 max-w-xs truncate">{item.message}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => openEditModal(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150" title="Edit">
                              <Edit2 size={18} />
                            </button>
                            <button onClick={() => openDeleteModal(item)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150" title="Delete">
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
              {data.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  {loading ? 'Loading…' : 'No records found. Click "Add New" to create one.'}
                </div>
              ) : (
                data.map((item, index) => (
                  <div key={item._id} className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {startingRowNumber + index + 1}
                          </div>
                          <h3 className="font-semibold text-slate-800 text-lg truncate max-w-[180px]">
                            {item.companyName || 'Unnamed'}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => openEditModal(item)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150" title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => openDeleteModal(item)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Company */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={18} className="text-rose-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Company</p>
                          <p className="text-sm text-slate-800 truncate">{item.companyName || '—'}</p>
                        </div>
                      </div>

                      {/* Department */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase size={18} className="text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Department</p>
                          <span className="text-sm px-2 py-0.5 bg-slate-100 rounded-full text-slate-700">
                            {getDepartmentName(item)}
                          </span>
                        </div>
                      </div>

                      {/* Message */}
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MessageSquare size={18} className="text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Message</p>
                          <p className="text-sm text-slate-800 line-clamp-3">{item.message || '—'}</p>
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
                <select value={pageSize} onChange={handlePageSizeChange} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
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
                <button onClick={goToFirstPage} disabled={isFirstPage} className={`px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-all ${isFirstPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}>
                  First
                </button>
                <button onClick={handlePreviousPage} disabled={isFirstPage} className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${isFirstPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}>
                  Prev
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((page, idx) =>
                    page === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-gray-500">...</span>
                    ) : (
                      <button key={`page-${page}`} onClick={() => goToPage(page)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === page ? "bg-blue-600 text-white shadow-md" : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-300"}`}>
                        {page}
                      </button>
                    )
                  )}
                </div>

                {/* Mobile: Show current page */}
                <span className="sm:hidden px-3 py-2 text-sm text-gray-600">
                  {currentPage} / {pageCount}
                </span>

                <button onClick={handleNextPage} disabled={isLastPage} className={`px-2 md:px-4 py-2 rounded-lg text-sm font-medium transition-all ${isLastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}>
                  Next
                </button>
                <button onClick={goToLastPage} disabled={isLastPage} className={`px-2 md:px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLastPage ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}>
                  Last
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-6 py-4 flex justify-between items-center rounded-t-xl sticky top-0">
                <h2 className="text-xl font-bold text-black">
                  {modalMode === 'add' ? 'Add New Record' : 'Edit Record'}
                </h2>
                <button type="button" onClick={closeModal} className="text-black hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors duration-150">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {modalLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 ${errors.companyName ? 'border-red-500' : 'border-slate-300'}`}
                        placeholder="Enter company name"
                        required
                        aria-invalid={errors.companyName ? "true" : "false"}
                      />
                      {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="dept"
                        value={formData.dept}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 ${errors.dept ? 'border-red-500' : 'border-slate-300'}`}
                        required
                        aria-invalid={errors.dept ? "true" : "false"}
                      >
                        <option value="" disabled>Select a department</option>
                        {departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>{dept.name}</option>
                        ))}
                      </select>
                      {errors.dept && <p className="text-red-500 text-sm mt-1">{errors.dept}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea name="message" value={formData.message} onChange={handleInputChange} rows="4" className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 resize-none ${errors.message ? 'border-red-500' : 'border-slate-300'}`} placeholder="Enter message (min 15 characters, max 150 characters)" minLength={15} maxLength={150} required aria-invalid={errors.message ? "true" : "false"} />
                      {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={closeModal} disabled={modalLoading} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors duration-150 disabled:opacity-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={modalLoading} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-150 shadow-md disabled:opacity-50">
                    {modalLoading ? <Loader2 className="animate-spin mx-auto" size={20} /> : (modalMode === 'add' ? 'Add Record' : 'Update Record')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Delete Record</h3>
                <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete this record? This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 p-4 bg-slate-50 rounded-b-xl">
                <button onClick={closeDeleteModal} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors duration-150">Cancel</button>
                <button onClick={handleConfirmDelete} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-150 shadow-md">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}