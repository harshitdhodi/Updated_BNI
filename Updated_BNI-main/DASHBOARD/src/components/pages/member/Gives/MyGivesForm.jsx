import { useState } from 'react';
import { X } from 'lucide-react';

function MyGivesForm({ mode, initialData, onSubmit, onClose, loading, departments = [] }) {
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    email: initialData?.email || '',
    phoneNumber: initialData?.phoneNumber || '',
    webURL: initialData?.webURL || '',
    dept: initialData?.dept || ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone Number must be 10 digits.';
    }

    if (!formData.webURL.trim()) {
      newErrors.webURL = 'Web URL is required.';
    } else if (!/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/.test(formData.webURL)) {
      newErrors.webURL = 'Please enter a valid web URL (e.g., example.com).';
    }
    
    if (!formData.dept) newErrors.dept = 'Department is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-50  px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold text-black">
            {mode === 'add' ? 'Add New Record' : 'Edit Record'}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-black hover:bg-black hover:bg-opacity-20 rounded-lg p-1 transition-colors duration-150 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 disabled:bg-gray-100"
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="text-gray-600 text-xs mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 disabled:bg-gray-100"
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-gray-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={loading}
                minLength={10}
                maxLength={10}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 disabled:bg-gray-100"
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="text-gray-600 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Web URL
              </label>
              <input
                type="url"
                name="webURL"
                value={formData.webURL}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 disabled:bg-gray-100"
                placeholder="Enter web URL"
              />
              {errors.webURL && (
                <p className="text-gray-600 text-xs mt-1">{errors.webURL}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Department
              </label>
              <select
                name="dept"
                value={formData.dept}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150 disabled:bg-gray-100"
              >
                <option value="" disabled>Select a department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.dept && (
                <p className="text-gray-600 text-xs mt-1">{errors.dept}</p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-150 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : mode === 'add' ? 'Add Record' : 'Update Record'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default MyGivesForm;