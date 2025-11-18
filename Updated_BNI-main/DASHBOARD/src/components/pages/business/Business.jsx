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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const pageSize = 5;
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchBusinesses();
  }, [pageIndex]);

  const fetchBusinesses = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/business/getbusiness?page=${pageIndex + 1}&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setBusinesses(response.data.data);
      setPageCount(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error("There was an error fetching the businesses!", error);
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
                    <FaFacebook className="w-[25px] h-[25px] text-blue-800" />
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
      <div className="lg:flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Business List</h1>
        <button className="px-4 py-2 mt-3 bg-[#CF2030] text-white rounded hover:bg-red-600 transition duration-300">
          <Link to={`/business_form`}>Add Business</Link>
        </button>
      </div>
      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
        <thead>
          <tr className="bg-[#CF2030] text-white text-left uppercase font-serif text-[14px]">
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
              <td className="py-2 px-6">{pageIndex * pageSize + index + 1}</td>
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
                    <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition">
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
                  className="text-blue-500 hover:text-blue-700"
                >
                  <FaEye />
                </button>
                <button>
                  <Link to={`/editMyBusiness/${business._id}`}>
                    <FaEdit className="text-blue-500 text-lg" />
                  </Link>
                </button>
                <button
                  onClick={() => handleDelete(business._id)}
                  className="text-gray-600 hover:text-red-700"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
      {showModal && (
        <BusinessModal business={selectedBusiness} onClose={closeModal} />
      )}
    </div>
  );
};

export default BusinessList;
