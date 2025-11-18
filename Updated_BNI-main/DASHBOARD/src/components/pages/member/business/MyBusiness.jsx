/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaFacebook, FaTwitterSquare, FaLinkedin } from "react-icons/fa";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
const MyBusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 5;
  const { userId } = useParams();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchBusinesses();
  }, [pageIndex, userId]);

  const fetchBusinesses = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/business/getbusinessByuserId?userId=${userId}&page=${pageIndex + 1}`,
        { headers: {
          Authorization: `Bearer ${token}`,
        }, withCredentials: true, timeout: 5000 }
      );
      console.log(response.data.data);
      if (response.data && response.data.data) {
        const dataWithIds = response.data.data.map((business, index) => ({
          ...business,
          id: pageIndex * pageSize + index + 1,
        }));
        setBusinesses(dataWithIds);

        setPageCount(Math.ceil(response.data.total / pageSize));
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    }
  };

  const handleDelete = async (id) => {
    const token = getCookie("token");
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
            const response = await axios.delete("/api/business/deletebusiness", {
                params: { id },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            if (response.status === 200) {
                // Show success alert
                Swal.fire({
                    title: 'Deleted!',
                    text: 'The business has been deleted.',
                    icon: 'success',
                    confirmButtonText: 'Ok',
                });
                // Update the business list after deletion
                fetchBusinesses();
            } else {
                console.error("Failed to delete the business");
            }
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

  const handleViewDetails = (business) => {
    setSelectedBusiness(business);
    setShowModal(true);
    // Add logic to handle sidebar highlighting here if needed
  };

  const closeModal = () => {
    setShowModal(false);
    // Add logic to reset sidebar highlighting here if needed
  };

  const BusinessModal = ({ business, onClose }) => {
    if (!business) return null;

    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white w-[580px] p-6 rounded shadow-lg max-w-lg overflow-y-auto">
          {/* <h2 className="text-lg font-bold mb-4">Business Details</h2> */}
          <div className="mb-4">
            {/* <p><strong>ID:</strong> {business.id}</p> */}

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
              <p>
                <strong>Name:</strong> {business.user.name}
              </p>
              <p>
                <strong>Email:</strong> {business.user.email}
              </p>
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
            <p>
              <strong>Industry Name:</strong> {business.industryName}
            </p>
            <p>
              <strong>Contact Links:</strong>
            </p>
            <ul className="mb-2 flex">
              {business.whatsapp && (
                <li>
                  <strong></strong>{" "}
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
                  <strong></strong>{" "}
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
                  <strong></strong>{" "}
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
                  <strong></strong>{" "}
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
            {/* <p><strong>Catalog:</strong></p>
            {business.catalog ? (
              <a
                href={`/pdf/download/${business.catalog}`}
                download={business.catalog} // Specify the filename for download attribute
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-300 inline-block"
              >
                Download Catalog
              </a>
            ) : (
              <p className="text-gray-600">No catalog available</p>
            )} */}
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
      <nav className="mb-4">
        <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
          Dashboard /
        </Link>
        <Link to="/memberList" className="mr-2 text-gray-400 hover:text-gray-500">
          MemberList /
        </Link>
        <span className="font-semibold text-gray-600">Business List</span>
      </nav>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Business List</h1>
        <button className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
          <Link to={`/business_form/${userId}`}>Add Business</Link>
        </button>
      </div>

      {businesses.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">No businesses found.</p>
        </div>
      ) : (
        <>
          <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
            <thead>
              <tr className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
                <th className="py-2 px-6">ID</th>
                {/* <th className="py-2 px-6">Owner</th> */}
                <th className="py-2 px-6">Company Name</th>
                <th className="py-2 px-6">Profile Image</th>

                <th className="py-2 px-6">Industry Name</th>
                <th className="py-2 px-6">Contact Links</th>
                <th className="py-2 px-6">Catalog</th>
                <th className="py-2 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((business) => (
                <tr
                  key={business._id}
                  className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                  <td className="py-2 px-6">{business.id}</td>
                  {/* <td className="py-2 px-6">{business.user?.name}</td> */}
                  <td className="py-2 px-6">{business.companyName}</td>
                  <td className="py-2 px-6">
                    <img
                      src={`/image/download/${business.profileImg}`}
                      alt="Profile"
                      width="50"
                      height="50"
                      className="object-cover"
                    />
                  </td>
                  {/* <td className="py-2 px-6">
                    <img
                      src={`/image/download/${business.bannerImg}`}
                      alt="Banner"
                      width="50"
                      height="50"
                      className="object-cover"
                    />
                  </td> */}
                  <td className="py-2 px-6">{business.industryName}</td>
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
                  <td className="py-2 px-4">
                    <div className="flex py-1 px-4 -ml-2 space-x-2">
                      <button>
                        <Link to={`/editMyBusiness/${userId}/${business._id}`}>
                          <FaEdit className="text-blue-500 text-lg" />
                        </Link>
                      </button>
                      <button onClick={() => handleDelete(business._id)}>
                        <FaTrashAlt className="text-gray-600 text-lg" />
                      </button>
                      <button
                        onClick={() => handleViewDetails(business)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                      >
                        View More
                      </button>
                    </div>
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
        </>
      )}

      {showModal && (
        <BusinessModal business={selectedBusiness} onClose={closeModal} />
      )}
    </div>
  );
};

export default MyBusinessList;
