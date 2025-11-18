import  { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaFacebook, FaTwitterSquare, FaLinkedin } from "react-icons/fa";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
import { Eye, EyeIcon } from "lucide-react";
const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyNames, setCompanyNames] = useState([]);
  const [showFindCompanyModal, setShowFindCompanyModal] = useState(false);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (allCompanies.length > 0) {
      const offset = pageIndex * pageSize;
      const pagedData = allCompanies.slice(offset, offset + pageSize);
      setCompanies(pagedData);
      setPageCount(Math.ceil(allCompanies.length / pageSize));
    }
  }, [pageIndex, pageSize, allCompanies]);

  const fetchCompanies = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/company/getAllCompany`,
        {   headers: {
          Authorization: `Bearer ${token}`,
        }, withCredentials: true, timeout: 5000 }
      );
      const dataWithIds = response.data.data.map((company, index) => ({
        ...company,
        id: index + 1,
      }));
      setAllCompanies(dataWithIds);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const fetchCompanyNames = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get("/api/company/getNonExistingCompanyNames", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        timeout: 5000,
      });

      if (response.data && response.data.companyNames) {
        setCompanyNames(response.data.companyNames);
        setShowFindCompanyModal(true);
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching company names:", error);
    }
  };

  const handleDelete = async (id) => {
    // Show confirmation alert
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this company!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
        try {
            const token = getCookie("token");
            const response = await axios.delete("/api/company/deleteCompany", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: { id },
                withCredentials: true,
            });

            if (response.status === 200) {
                // Show success alert
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The company has been deleted.',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                });

                // Refresh data after deletion
                fetchCompanies();
            } else {
                console.error("Failed to delete the company");
                // Show error alert
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete the company.',
                    icon: 'error',
                    confirmButtonText: 'Ok',
                });
            }
        } catch (error) {
            console.error("Error deleting company:", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting the company.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowCompanyModal(true);
  };

  const closeCompanyModal = () => {
    setShowCompanyModal(false);
  };

  const closeFindCompanyModal = () => {
    setShowFindCompanyModal(false);
  };

  const CompanyModal = ({ company, onClose }) => {
    if (!company) return null;

    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white w-[580px] p-6 rounded shadow-lg max-w-lg overflow-y-auto">
          <div className="mb-4">
            <div className="flex">
              <div className="w-1/2">
                <p>
                  <strong>Profile Image:</strong>
                </p>
                <img
                  src={`/api/image/download/${company.profileImg}`}
                  alt="Profile"
                  className="w-full max-h-60 object-cover mb-2"
                />
              </div>
             
            </div>
            <p>
              <strong>Company Name:</strong> {company.companyName}
            </p>
            <p>
              <strong>Company Address:</strong> {company.companyAddress}
            </p>
            <p>
              <strong>Contact Links:</strong>
            </p>
            <ul className="mb-2">
              <li className="flex">
                <a
                  href={company.whatsapp || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2"
                >
                  <IoLogoWhatsapp className="w-[25px] h-[25px] text-green-500" />
                </a>
                <a
                  href={company.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2"
                >
                  <FaFacebook className="w-[25px] h-[25px] text-purple-900" />
                </a>
                <a
                  href={company.twitter || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2"
                >
                  <FaTwitterSquare className="w-[25px] h-[25px] text-blue-500" />
                </a>
                <a
                  href={company.linkedin || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr-2"
                >
                  <FaLinkedin className="w-[25px] h-[25px] text-blue-500" />
                </a>
              </li>
            </ul>
          </div>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  const FindCompanyModal = ({ companies, onClose }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 4; // 2 columns * 2 rows
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
      // Redirect to the company form page using React Router
      navigate(`/add_company?name=${encodeURIComponent(companyName)}`);
    };
    
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
        <div className="bg-white p-6 rounded shadow-lg max-w-full mx-auto overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Company Names</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
      {paginatedCompanies.map((company, index) => (
        <div
          key={index}
          className="relative p-2 border rounded bg-gray-100 cursor-pointer hover:bg-gray-200"
        >
          <div onClick={() => handleCompanyClick(company)}>
            {company} {/* Adjust according to your company object structure */}
          </div>
          {/* <div
            onClick={() => handleRemoveCompany(company.id)} // Replace with the actual ID or identifier
            className="absolute top-0 right-0 p-1 text-gray-600 cursor-pointer"
          >
            <FaTimes /> 
          </div> */}
        </div>
      ))}
    </div>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Previous
            </button>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Next
            </button>
          </div>
      <div className="flex gap-5">
      <button
            onClick={onClose}
            className="mt-4 bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
          >
            Close
          </button>
          <button className="mt-4 bg-red-600 hover:bg-red-900 px-3 py-1 text-white rounded">
             <Link to="/add_company">Add Own Company</Link>
          </button>
      </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`p-4 overflow-x-auto ${
        showCompanyModal || showFindCompanyModal ? "modal-open" : ""
      }`}
    >
      

      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Company List</h1>
        <div className="flex">
          {/* <button className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
            <Link to={`/add_company`}>Add Company</Link>
          </button> */}
          <button
            onClick={fetchCompanyNames}
            className="px-4 py-2 mt-3 ml-4 bg-gradient-to-r shadow-md from-blue-100 to-blue-50 text-gray-700 rounded  transition duration-300"
          >
            Add Company
          </button>
        </div>
      </div>

      {companies.length > 0 && (
        <>
          <div className="w-full overflow-x-auto mt-4 shadow-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 text-left uppercase font-serif text-[14px]">
                  <th className="py-2 px-4 lg:px-6">Profile Image</th>
                 <th className="py-2 px-4 lg:px-6">Company Name</th>
                  <th className="py-2 px-4 lg:px-6">Contact Links</th>
                  <th className="py-2 px-4 lg:px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company._id}
                    className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                  >
                    <td className="py-2 px-6">
                      <img
                        src={`/api/image/download/${company.profileImg}`}
                        alt="Profile"
                        className="h-20 object-cover w-[200px] lg:w-[150px] lg:h-[100px]"
                      />
                    </td>
                  
                    <td className="py-2 px-6">{company.companyName}</td>
                    <td className="py-2 px-6">
                      <div className="flex items-center gap-2">
                      <a
                        href={company.whatsapp || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mr-2"
                      >
                        <IoLogoWhatsapp className="w-[20px] h-[20px] text-green-500" />
                      </a>
                      <a
                        href={company.facebook || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mr-2"
                      >
                        <FaFacebook className="w-[20px] h-[20px] text-purple-900" />
                      </a>
                      <a
                        href={company.twitter || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mr-2"
                      >
                        <FaTwitterSquare className="w-[20px] h-[20px] text-blue-500" />
                      </a>
                      <a
                        href={company.linkedin || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mr-2"
                      >
                        <FaLinkedin className="w-[20px] h-[20px] text-blue-500" />
                      </a>
                      </div>
                    </td>
                    <td className=" px-6">
                      <div className="flex items-center justify-start gap-4 text-xl">  
                         <button
                        onClick={() => handleViewDetails(company)}
                        className="text-blue-500 hover:text-blue-700 mt-2 mr-2"
                      >
                        <EyeIcon className="text-blue-500 text-lg" /> 
                        {/* View */}
                      </button>
                      <button>
                        <Link to={`/edit_company/${company._id}`}>
                          <FaEdit className="text-blue-500 text-lg" />
                        </Link>
                      </button>
                      <button
                        onClick={() => handleDelete(company._id)}
                        className="text-gray-600 hover:text-red-700"
                      >
                        <FaTrashAlt />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
  {/* Rows per page selector */}
  <div className="flex items-center gap-3 text-sm text-gray-700">
    <span>Show</span>
    <select
      value={pageSize}
      onChange={(e) => {
        setPageSize(Number(e.target.value));
        setPageIndex(0);
      }}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {[5, 10, 20, 50].map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
    <span>entries</span>
  </div>

  {/* Page info */}
  <span className="text-sm text-gray-600">
    Showing {(pageIndex * pageSize) + 1} to{" "}
    {Math.min((pageIndex + 1) * pageSize, allCompanies.length)} of{" "}
    {allCompanies.length} entries
  </span>

  {/* Pagination Controls */}
  <nav className="flex items-center gap-1" aria-label="Pagination">
    {/* First Page */}
    <button
      onClick={() => setPageIndex(0)}
      disabled={pageIndex === 0}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        pageIndex === 0
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
      }`}
    >
      First
    </button>

    {/* Previous */}
    <button
      onClick={handlePreviousPage}
      disabled={pageIndex === 0}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        pageIndex === 0
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
      }`}
    >
      Previous
    </button>

    {/* Page Numbers (with ellipsis logic) */}
    <div className="flex items-center gap-1">
      {(() => {
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

        return pages.map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              key={idx}
              onClick={() => setPageIndex(page - 1)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                current === page
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white hover:bg-blue-50 text-gray-700 border border-gray-300"
              }`}
            >
              {page}
            </button>
          )
        );
      })()}
    </div>

    {/* Next */}
    <button
      onClick={handleNextPage}
      disabled={pageIndex >= pageCount - 1}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        pageIndex >= pageCount - 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
      }`}
    >
      Next
    </button>

    {/* Last Page */}
    <button
      onClick={() => setPageIndex(pageCount - 1)}
      disabled={pageIndex >= pageCount - 1}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        pageIndex >= pageCount - 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
      }`}
    >
      Last
    </button>
  </nav>
</div>
        </>
      )}

      {showCompanyModal && (
        <CompanyModal company={selectedCompany} onClose={closeCompanyModal} />
      )}

      {showFindCompanyModal && (
        <FindCompanyModal
          companies={companyNames}
        
          onClose={closeFindCompanyModal}
        />
      )}
    </div>
  );
};

export default CompanyList;
