import React, { useMemo } from 'react';
import { Edit2, Trash2, Building2, Mail, Phone, Globe, Briefcase } from 'lucide-react';

function MyGivesTable({ 
  data, 
  onEdit, 
  onDelete, 
  loading, 
  departments = [],
  pageIndex = 0,
  pageSize = 10
}) {
  const departmentMap = useMemo(() =>
    new Map(departments.map(dept => [dept._id, dept.name])),
    [departments]
  );

  const startingRowNumber = pageIndex * pageSize;

  const getDepartmentName = (item) => {
    return typeof item.dept === 'object' && item.dept?.name
      ? item.dept.name
      : departmentMap.get(item.dept) || item.dept || '—';
  };

  // Empty state
  if (data.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-slate-500">
        {loading ? 'Loading...' : 'No records found. Click "Add New" to create one.'}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden max-w-7xl lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">
                #
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
            {data.map((item, index) => (
              <tr key={item._id} className="hover:bg-slate-50 transition-colors duration-150">
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                  {startingRowNumber + index + 1}
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
                  {getDepartmentName(item)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden p-4 space-y-4">
        {data.map((item, index) => (
          <div
            key={item._id}
            className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {startingRowNumber + index + 1}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg truncate max-w-[200px]">
                    {item.companyName || 'Unnamed Company'}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(item)}
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
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Email</p>
                  <a 
                    href={`mailto:${item.email}`} 
                    className="text-sm text-blue-600 hover:underline truncate block"
                  >
                    {item.email || '—'}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Phone</p>
                  <a 
                    href={`tel:${item.phoneNumber}`} 
                    className="text-sm text-slate-800 hover:text-blue-600 truncate block"
                  >
                    {item.phoneNumber || '—'}
                  </a>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe size={18} className="text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Website</p>
                  {item.webURL ? (
                    <a 
                      href={item.webURL.startsWith('http') ? item.webURL : `https://${item.webURL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block"
                    >
                      {item.webURL}
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </div>
              </div>

              {/* Department */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Briefcase size={18} className="text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Department</p>
                  <span className="text-sm text-slate-800 inline-flex items-center gap-1">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-700">
                      {getDepartmentName(item)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MyGivesTable;