import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { IoLogoWhatsapp } from "react-icons/io";
import {
  FaFacebook,
  FaTwitterSquare,
  FaLinkedin,
  FaCloudDownloadAlt,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import Swal from 'sweetalert2';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();

  };
  useEffect(() => {
    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (allBusinesses.length > 0) {
      const offset = pageIndex * pageSize;
      const pagedData = allBusinesses.slice(offset, offset + pageSize);
      setBusinesses(pagedData);
      setPageCount(Math.ceil(allBusinesses.length / pageSize));
    }
  }, [pageIndex, pageSize, allBusinesses]);

  const fetchBusinesses = async () => {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/business/getbusiness`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const dataWithIds = response.data.data.map((business, index) => ({
        ...business,
        id: index + 1,
      }));
      setAllBusinesses(dataWithIds);
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

  const handleFileChange = async (event, businessId) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getCookie("token");
      await axios.post(`/api/business/uploadCatalog?id=${businessId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      fetchBusinesses(); // Refresh the list after upload
    } catch (error) {
      console.error("Error uploading catalog:", error);
    }
  };

  const handleViewDetails = (business) => {
    setSelectedBusiness(business);
    setShowModal(true);
  };

  const handleDelete = async (businessId) => {
    // Show confirmation alert
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
        try {
            const token = getCookie("token");
            await axios.delete(`/api/business/deletebusiness?id=${businessId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'Your business has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            fetchBusinesses(); // Refresh the list after deletion
        } catch (error) {
            console.error("Error deleting business:", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting the business.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  const closeModal = () => {
    setShowModal(false);
  };

  const BusinessModal = ({ business, onClose }) => {
    if (!business) return null;

    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="bg-white w-[580px] p-6 rounded shadow-lg max-w-lg overflow-y-auto">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h1 className="text-xl font-bold mb-3 ml-2">Business Details</h1>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-red-700"
            >
              X
            </button>
          </div>
          <div className="mb-4">
            <p>
              <strong>Name:</strong> {business.user?.name}
            </p>
            <p>
              <strong>Email:</strong> {business.user?.email}
            </p>
            <p>
              <strong>Industry Name:</strong> {business.industryName}
            </p>
            <div className="flex">
              <div>
                <p>
                  <strong>Profile Image:</strong>
                </p>
                <img
                  src={`/api/image/download/${business.profileImg}`}
                  alt="Profile"
                  className="w-1/2 max-h-60 object-cover mb-2"
                />
              </div>
              <div>
                <p>
                  <strong>Banner Image:</strong>
                </p>
                <img
                  src={`/api/image/download/${business.bannerImg}`}
                  alt="Banner"
                  className="w-1/2 max-h-60 object-cover mb-2"
                />
              </div>
            </div>
            <p>
              <strong>Contact Links:</strong>
            </p>
            <ul className="mb-2 flex gap-2">
              {business.whatsapp && (
                <li>
                  {" "}
                  <a
                    href={business.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IoLogoWhatsapp className="w-[25px] h-[25px] text-green-500" />
                  </a>
                </li>
              )}
              {business.facebook && (
                <li>
                  {" "}
                  <a
                    href={business.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="w-[25px] h-[25px] text-gray-800" />
                  </a>
                </li>
              )}
              {business.twitter && (
                <li>
                  {" "}
                  <a
                    href={business.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTwitterSquare className="w-[25px] h-[25px] text-blue-500" />
                  </a>
                </li>
              )}
              {business.linkedin && (
                <li>
                  {" "}
                  <a
                    href={business.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="w-[25px] h-[25px] text-blue-700" />
                  </a>
                </li>
              )}
            </ul>
            <p>
              <strong>Designation:</strong> {business.designation}
            </p>
            <p>
              <strong>About Company:</strong> {business.aboutCompany}
            </p>
            <p>
              <strong>Company Name:</strong> {business.companyName}
            </p>
            <p>
              <strong>Company Address:</strong> {business.companyAddress}
            </p>
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

  return (
    <div className={`p-4 overflow-x-auto ${showModal ? "modal-open" : ""}`}>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Business List</h1>
        <button className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
          <Link to={`/business_form`}>Add Business</Link>
        </button>
      </div>
      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
        <thead>
          <tr className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
            <th className="py-2 px-6">ID</th>
            <th className="py-2 px-6">Owner</th>
            <th className="py-2 px-6">Company Name</th>
            <th className="py-2 px-6">Contact Links</th>
            <th className="py-2 px-6">Industry</th>
            <th className="py-2 px-6 flex items-center gap-2">
              Catalog <FaCloudDownloadAlt className="w-5 h-5" />
            </th>
            <th className="py-2 px-6">Action</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((business, index) => (
            <tr
              key={business._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{business.id}</td>
              <td className="py-2 px-6">
                {business.user?.name}
                {/* <img src={`/image/download/${business.bannerImg}`} alt="Banner" width="50" height="50" /> */}
              </td>
              <td className="py-2 px-6">
                {business.companyName}
                {/* <img src={`/image/download/${business.profileImg}`} alt="Profile" width="50" height="50" /> */}
              </td>
              <td className="py-2 px-6 flex gap-2">
                {business.whatsapp && (
                  <a
                    href={business.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IoLogoWhatsapp className="w-[25px] h-[25px] text-green-500" />
                  </a>
                )}
                {business.facebook && (
                  <a
                    href={business.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook className="w-[25px] h-[25px] text-blue-800" />
                  </a>
                )}
                {business.twitter && (
                  <a
                    href={business.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTwitterSquare className="w-[25px] h-[25px] text-blue-500" />
                  </a>
                )}
                {business.linkedin && (
                  <a
                    href={business.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaLinkedin className="w-[25px] h-[25px] text-blue-700" />
                  </a>
                )}
              </td>
              <td className="py-2 px-6">{business.industryName}</td>
              <td className="py-2 px-6">
                {business.catalog ? (
                  <a href={`/pdf/download/${business.catalog}`} download>
                    <button className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 transition">
                      Download
                    </button>
                  </a>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(e, business._id)}
                    />
                  </div>
                )}
              </td>
              <td className="py-2 px-6 flex gap-2">
                <button
                  onClick={() => handleViewDetails(business)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaEye />
                </button>
                <button>
                  <Link to={`/editMyBusiness/${business._id}`}>
                    <FaEdit className="text-gray-500 text-lg" />
                  </Link>
                </button>
                <button
                  onClick={() => handleDelete(business._id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    {Math.min((pageIndex + 1) * pageSize, allBusinesses.length)} of{" "}
    {allBusinesses.length} entries
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
                  ? "bg-gray-600 text-white shadow-md"
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
      {showModal && (
        <BusinessModal business={selectedBusiness} onClose={closeModal} />
      )}
    </div>
  );
};

export default BusinessList;
