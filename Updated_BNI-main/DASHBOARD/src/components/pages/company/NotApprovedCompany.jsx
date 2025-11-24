import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Building2, Plus } from 'lucide-react';

const FindCompanyModal = ({ companies, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10; // Show 10 companies per page in table format
  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const navigate = useNavigate();

  if (!companies) return null;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, companies.length);
  const paginatedCompanies = companies.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCompanyClick = (companyName) => {
    navigate(`/add_company?name=${encodeURIComponent(companyName)}`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-200 to-blue-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Building2 className="text-black" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">Select Company</h2>
              <p className="text-gray-600 text-sm">{companies.length} companies found</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-900 hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Table Container */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Company Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCompanies.map((company, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition-colors cursor-pointer group"
                    onClick={() => handleCompanyClick(company)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="text-blue-600" size={16} />
                        </div>
                        <span className="group-hover:text-blue-700 transition-colors">
                          {company}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompanyClick(company);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-200 hover:bg-blue-100 text-black shadow-md rounded-lg transition-colors font-medium"
                      >
                        Select
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {paginatedCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 font-medium">No companies found</p>
            </div>
          )}
        </div>

        {/* Footer with Pagination and Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Pagination */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <span className="text-sm text-gray-700 font-medium px-3">
                Page <span className="font-bold text-gray-900">{currentPage + 1}</span> of{' '}
                <span className="font-bold text-gray-900">{totalPages}</span>
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <Link to="/add_company">
                <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  <Plus size={18} />
                  Add Own Company
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindCompanyModal;