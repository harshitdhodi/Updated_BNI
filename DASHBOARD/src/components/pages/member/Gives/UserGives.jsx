import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function UserGives() {
  const [data, setData] = useState([
    { 
      id: 1, 
      companyName: 'Future Tech', 
      email: 'futuretech@gmail.com',
      phoneNumber: '1234123456',
      webURL: 'www.futuretech.com',
      dept: 'Development'
    }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phoneNumber: '',
    webURL: '',
    dept: ''
  });

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ 
      companyName: '', 
      email: '', 
      phoneNumber: '', 
      webURL: '', 
      dept: '' 
    });
    setCurrentItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setFormData({
      companyName: item.companyName,
      email: item.email,
      phoneNumber: item.phoneNumber,
      webURL: item.webURL,
      dept: item.dept
    });
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ 
      companyName: '', 
      email: '', 
      phoneNumber: '', 
      webURL: '', 
      dept: '' 
    });
    setCurrentItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.companyName || !formData.email || !formData.phoneNumber || !formData.webURL || !formData.dept) {
      alert('Please fill in all fields');
      return;
    }
    
    if (modalMode === 'add') {
      const newItem = {
        id: data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1,
        ...formData
      };
      setData([...data, newItem]);
    } else {
      setData(data.map(item => 
        item.id === currentItem.id ? { ...item, ...formData } : item
      ));
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setData(data.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#ddecfe] px-6 py-5 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">My Gives</h1>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors duration-200 shadow-md"
            >
              <Plus size={20} />
              Add New
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Web URL
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No records found. Click "Add New" to create one.
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {item.companyName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {item.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {item.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {item.webURL}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {item.dept}
                      </td>
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
                            onClick={() => handleDelete(item.id)}
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl transform transition-all">
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
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150"
                    placeholder="Enter company name"
                  />
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
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150"
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Web URL
                  </label>
                  <input
                    type="text"
                    name="webURL"
                    value={formData.webURL}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150"
                    placeholder="Enter web URL"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="dept"
                    value={formData.dept}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all duration-150"
                    placeholder="Enter department"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-150 shadow-md"
                >
                  {modalMode === 'add' ? 'Add Record' : 'Update Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}