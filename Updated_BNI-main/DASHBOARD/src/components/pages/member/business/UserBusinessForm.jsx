// BusinessFormModal.jsx
import React, { useState, useEffect } from 'react';
import { Loader2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const BusinessFormModal = ({
  isOpen,
  onClose,
  mode = 'add',
  businessId = null,
  userId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profileImgPreview, setProfileImgPreview] = useState(null);
  const [profileImgFile, setProfileImgFile] = useState(null);

  // Industry dropdown
  const [industries, setIndustries] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(false);

  const [formData, setFormData] = useState({
    profileImg: '',
    companyName: '',
    industryName: '', // This will hold the industry _id (string)
    designation: '',
    aboutCompany: '',
    companyAddress: '',
    mobile: '',
    email: '',
    whatsapp: '',
    facebook: '',
    linkedin: '',
    twitter: '',
    catalog: ''
  });

  // Fetch industries on mount
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        setIndustryLoading(true);
        const res = await axios.get('/api/industry/getAllIndustry');
        setIndustries(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load industries');
      } finally {
        setIndustryLoading(false);
      }
    };
    fetchIndustries();
  }, []);

  // Fetch business data when editing
  useEffect(() => {
    if (mode === 'edit' && businessId && isOpen) {
      const fetchBusiness = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`/api/business/getbusinessbymyId`, {
            params: { id: businessId }
          });
          const data = res.data.data;
          // Ensure we store the industry _id. Handle backend returning either an id string or an object.
          const industryValue = data.industryName
            ? (typeof data.industryName === 'object' ? data.industryName._id : data.industryName)
            : '';
          setFormData({
            profileImg: data.profileImg || '',
            companyName: data.companyName || '',
            industryName: industryValue,
            designation: data.designation || '',
            aboutCompany: data.aboutCompany || '',
            companyAddress: data.companyAddress || '',
            mobile: data.mobile || '',
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            facebook: data.facebook || '',
            linkedin: data.linkedin || '',
            twitter: data.twitter || '',
            catalog: data.catalog || ''
          });
          setProfileImgPreview(data.profileImg || null);
        } catch (err) {
          toast.error('Failed to load business data');
        } finally {
          setLoading(false);
        }
      };
      fetchBusiness();
    } else if (mode === 'add' && isOpen) {
      setFormData(prev => ({ ...prev, industryName: '' }));
      setProfileImgPreview(null);
      setProfileImgFile(null);
    }
  }, [mode, businessId, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the file for upload
      setProfileImgFile(file);
      // Create preview URL using blob URL
      const previewUrl = URL.createObjectURL(file);
      setProfileImgPreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Create FormData for multipart/form-data submission
      const submitData = new FormData();
      submitData.append('companyName', formData.companyName);
      submitData.append('industryName', formData.industryName);
      submitData.append('designation', formData.designation);
      submitData.append('aboutCompany', formData.aboutCompany);
      submitData.append('companyAddress', formData.companyAddress);
      submitData.append('mobile', formData.mobile);
      submitData.append('email', formData.email);
      submitData.append('whatsapp', formData.whatsapp);
      submitData.append('facebook', formData.facebook);
      submitData.append('linkedin', formData.linkedin);
      submitData.append('twitter', formData.twitter);
      submitData.append('catalog', formData.catalog);
      
      // Append file only if a new file was selected
      if (profileImgFile) {
        submitData.append('profileImg', profileImgFile);
      }

      if (mode === 'add') {
        await axios.post(`/api/business/createProfile`, submitData, {
          params: { userId },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Business profile created successfully!');
      } else {
        await axios.put(`/api/business/updateBusinessDetails`, submitData, {
          params: { id: businessId },
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Business profile updated successfully!');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r bg-[#ddecfe] px-6 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-black">
            {mode === 'add' ? 'Add New Business' : 'Edit Business Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            disabled={submitting}
          >
            <X size={28} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-red-600" size={48} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Image */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-dashed border-gray-300">
                  {profileImgPreview ? (
                    <img src={profileImgPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Upload className="text-gray-400" size={40} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-red-700 transition">
                  <Upload size={18} />
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="Enter company name"
                />
              </div>

              {/* Industry Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                <select
                  name="industryName"
                  value={formData.industryName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition bg-white"
                >
                  <option value="">Select Industry</option>
                  {industryLoading ? (
                    <option disabled>Loading industries...</option>
                  ) : (
                    industries.map((industry) => (
                      <option key={industry._id} value={industry._id}>
                        {industry.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Rest of the fields remain the same */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="e.g., CEO, Marketing Head"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="business@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="https://linkedin.com/company/xyz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catalog Link</label>
                <input
                  type="url"
                  name="catalog"
                  value={formData.catalog}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="https://yourcatalog.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Address *</label>
              <textarea
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Full business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Company </label>
              <textarea
                name="aboutCompany"
                value={formData.aboutCompany}
                onChange={handleInputChange}
                
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                placeholder="Tell us about your company..."
              />
            </div>

            <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || industryLoading}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-150 shadow-md flex items-center gap-2 disabled:opacity-70"
              >
                {submitting && <Loader2 className="animate-spin" size={20} />}
                {submitting ? 'Saving...' : (mode === 'add' ? 'Create Business' : 'Update Business')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BusinessFormModal;