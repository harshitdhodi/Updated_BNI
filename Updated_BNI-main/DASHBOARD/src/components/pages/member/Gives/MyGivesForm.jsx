import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Building2, Briefcase, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

function MyGivesForm({ 
  mode = 'add', 
  initialData, 
  onSubmit, 
  onClose, 
  loading, 
  departments = [],
  formType = 'mygives' // ← NEW: 'mygives' or 'myask'
}) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    webURL: initialData?.webURL || '',
    dept: initialData?.dept?._id || initialData?.dept || '',
    message: initialData?.message || '',
  });

  const [errors, setErrors] = useState({});
  const [companySuggestions, setCompanySuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const companyInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        webURL: initialData.webURL || '',
        dept: initialData.dept?._id || initialData.dept || '',
        message: initialData.message || '',
      });
    } else {
      setFormData({
        companyName: '',
        email: '',
        phoneNumber: '',
        webURL: '',
        dept: '',
        message: ''
      });
    }
    setErrors({});
  }, [initialData]);

  // Company suggestions (only for MyGives if you want, or keep for both)
  useEffect(() => {
    if (formData.companyName.trim().length < 2 || formType === 'myask') {
      setCompanySuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const response = await axios.get(`/api/company/getFilteredGives?companyName=${formData.companyName}`);
        setCompanySuggestions(response.data.companies || []);
        setIsSuggestionsOpen(true);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setCompanySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [formData.companyName, formType]);

  const validateForm = () => {
    const newErrors = {};

    // Always required: companyName & dept
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company Name is required.';
    } else if (!/^[a-zA-Z0-9\s.,'&()-]+$/.test(formData.companyName)) {
      newErrors.companyName = "Only letters, numbers, spaces, and basic punctuation allowed.";
    }

    if (!formData.dept) {
      newErrors.dept = 'Department is required.';
    }

    // Only validate these fields if it's a MyGives form
    if (formType === 'mygives') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required.';
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
        newErrors.email = 'Invalid email address.';
      }

      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone Number is required.';
      } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Must be exactly 10 digits.';
      } else if (/(.)\1{9}/.test(formData.phoneNumber) || formData.phoneNumber === '1234567890') {
        newErrors.phoneNumber = 'Enter a valid phone number.';
      }

      if (formData.webURL.trim() && !/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(formData.webURL)) {
        newErrors.webURL = 'Enter a valid URL (e.g., google.com)';
      }
    }

    // Message is optional everywhere
    if (formData.message.trim().length > 150) {
      newErrors.message = 'Message cannot exceed 150 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (companyInputRef.current && !companyInputRef.current.contains(e.target)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }
    // onSubmit(formData); // We will call this from the parent, but here we handle the API call directly for clarity
    // The parent component's onSubmit is likely doing the API call.
    // To fix the error handling, we need to catch the specific error here.
    // Since the parent component logic is not provided, I will modify this to show how to handle the error.
    // The ideal solution is to pass the error from the parent back to this form.
    // For now, let's assume the parent's `onSubmit` returns a promise that rejects with the API error.
    onSubmit(formData).catch(err => {
      if (err.response?.data?.field === 'email') {
        setErrors(prev => ({ ...prev, email: err.response.data.message }));
      }
    });
  };

  const isMyAsk = formType === 'myask';
  const title = isMyAsk 
    ? (mode === 'add' ? 'Add My Ask' : 'Edit My Ask')
    : (mode === 'add' ? 'Add New Record' : 'Edit Record');

  const submitText = isMyAsk 
    ? (loading ? 'Adding...' : mode === 'add' ? 'Add My Ask' : 'Update My Ask')
    : (loading ? 'Processing...' : mode === 'add' ? 'Add Record' : 'Update Record');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold text-black">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-black/20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="relative" ref={companyInputRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Building2 className="inline mr-1" size={18} />
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                  errors.companyName ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="e.g., Google, Microsoft"
                autoComplete="off"
              />
              {/* Suggestions (only show for MyGives) */}
              {!isMyAsk && isSuggestionsOpen && companySuggestions.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {companySuggestions.map((company) => (
                    <li
                      key={company._id || company.companyName}
                      onMouseDown={() => {
                        setFormData(prev => ({ ...prev, companyName: company.companyName }));
                        setIsSuggestionsOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                    >
                      {company.companyName}
                    </li>
                  ))}
                </ul>
              )}
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>

            {/* Email, Phone, WebURL — only for MyGives */}
            {!isMyAsk && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="contact@company.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={loading}
                    maxLength={10}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="9876543210"
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Web URL (Optional)
                  </label>
                  <input
                    type="text"
                    name="webURL"
                    value={formData.webURL}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://company.com"
                  />
                  {errors.webURL && <p className="text-red-500 text-sm mt-1">{errors.webURL}</p>}
                </div>
              </>
            )}

            {/* Department */}
            <div className={isMyAsk ? 'md:col-span-2' : ''}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Briefcase className="inline mr-1" size={18} />
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="dept"
                value={formData.dept}
                onChange={handleInputChange}
                disabled={loading}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.dept ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.dept && <p className="text-red-500 text-sm mt-1">{errors.dept}</p>}
            </div>

            {/* Message - full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MessageSquare className="inline mr-1" size={18} />
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                maxLength={150}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                  errors.message ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="e.g., Looking for opportunities in software development..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.message.length}/150
              </div>
              {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-slate-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-md"
          >
            {submitText}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MyGivesForm;