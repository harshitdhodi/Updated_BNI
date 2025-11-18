import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams, useNavigate } from "react-router-dom";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaFacebook, FaTwitterSquare, FaLinkedin } from "react-icons/fa";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 5;
  const { userId } = useParams();
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
  }, [pageIndex, userId]);

  const fetchCompanies = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/company/getAllCompany?page=${pageIndex + 1}`,
        {   headers: {
          Authorization: `Bearer ${token}`,
        }, withCredentials: true, timeout: 5000 }
      );
      console.log(response.data.data);
      if (response.data && response.data.data) {
        const dataWithIds = response.data.data.map((company, index) => ({
          ...company,
          id: pageIndex * pageSize + index + 1,
        }));
        setCompanies(dataWithIds);
        setPageCount(Math.ceil(response.data.total / pageSize));
      } else {
        console.error("Unexpected response structure:", response.data);
      }
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
              <div className="w-1/2">
                <p>
                  <strong>Banner Image:</strong>
                </p>
                <img
                  src={`/api/image/download/${company.bannerImg}`}
                  alt="Banner"
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
    const itemsPerPage = 9; // 3 columns * 3 rows
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
          <div className="grid grid-cols-3 gap-4 mb-4">
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
      {/* <nav className="mb-4">
        <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
          Dashboard /
        </Link>
        <Link to="/memberList" className="mr-2 text-gray-400 hover:text-gray-500">
          MemberList /
        </Link>
        <span className="font-semibold text-gray-600">Company List</span>
      </nav> */}

      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Company List</h1>
        <div className="flex">
          {/* <button className="px-4 py-2 mt-3 bg-[#CF2030] text-white rounded hover:bg-red-600 transition duration-300">
            <Link to={`/add_company`}>Add Company</Link>
          </button> */}
          <button
            onClick={fetchCompanyNames}
            className="px-4 py-2 mt-3 ml-4 bg-[#007BFF] text-white rounded hover:bg-blue-600 transition duration-300"
          >
            Add Company
          </button>
        </div>
      </div>

      {companies.length > 0 && (
        <>
          <div className="w-full overflow-x-auto lg:overflow-x-scroll mt-4 shadow-lg">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-[#CF2030] text-white text-left font-serif text-[14px]">
                  <th className="py-2 px-4 lg:px-6">Profile Image</th>
                  <th className="py-2 px-4 lg:px-6">Banner Image</th>
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
                        className="w-16 h-16 object-cover"
                      />
                    </td>
                    <td className="py-2 px-6">
                      <img
                        src={`/api/image/download/${company.bannerImg}`}
                        alt="Banner"
                        className="w-16 h-16 object-cover"
                      />
                    </td>
                    <td className="py-2 px-6">{company.companyName}</td>
                    <td className="py-2 px-6 mt-5 flex gap-2 items-center ">
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
                    </td>
                    <td className="py-2 px-6">
                      <button
                        onClick={() => handleViewDetails(company)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                      >
                        View
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center items-center space-x-2">
            <button
              onClick={handlePreviousPage}
              disabled={pageIndex === 0}
              className="px-3 py-1 bg-[#CF2030] text-white flex justify-center rounded transition"
            >
              {"<"}
            </button>
            <button
              onClick={handleNextPage}
              disabled={pageIndex + 1 >= pageCount}
              className="px-3 py-1 bg-[#CF2030] text-white rounded transition"
            >
              {">"}
            </button>
            <span>
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageCount}
              </strong>{" "}
            </span>
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
