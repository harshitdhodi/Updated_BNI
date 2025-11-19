import React, { useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

function MyGivesTable({ data, onEdit, onDelete, loading, departments = [] }) {
  // Create a lookup map for department names for efficient rendering
  const departmentMap = useMemo(() =>
    new Map(departments.map(dept => [dept._id, dept.name])),
    [departments]);

  return (
    <div className="overflow-x-auto">
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
          {data.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                {loading ? 'Loading...' : 'No records found. Click "Add New" to create one.'}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <TableRow 
                key={item._id} 
                item={item} 
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                departmentName={
                  typeof item.dept === 'object' && item.dept?.name 
                    ? item.dept.name 
                    : departmentMap.get(item.dept) || item.dept || '—'
                }
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// TableRow Component
function TableRow({ item, index, onEdit, onDelete, departmentName }) {
  return (
    <tr className="hover:bg-slate-50 transition-colors duration-150">
      <td className="px-6 py-4 text-sm text-slate-900 font-medium">
        {index + 1}
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
        {departmentName}
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
  );
}
export default MyGivesTable;