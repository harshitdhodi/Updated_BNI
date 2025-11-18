import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
const IndustryList = () => {
  const [industries, setIndustries] = useState([]);
  const [allIndustries, setAllIndustries] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);
  
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  useEffect(() => {
    if (allIndustries.length > 0) {
      const offset = pageIndex * pageSize;
      const pagedData = allIndustries.slice(offset, offset + pageSize);
      setIndustries(pagedData);
      setPageCount(Math.ceil(allIndustries.length / pageSize));
    }
  }, [pageIndex, pageSize, allIndustries]);

  const fetchIndustries = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/industry/getIndustries`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const dataWithIds = response.data.data.map((industry, index) => ({
        ...industry,
        id: index + 1,
      }));
      setAllIndustries(dataWithIds);
    } catch (error) {
      console.error("There was an error fetching the industries!", error);
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

  const handleDelete = async (id) => {
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
            await axios.delete(`/api/industry/deleteIndustry?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'The industry has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Refresh data after deletion
            fetchIndustries(); // Fetch data after deletion
        } catch (error) {
            console.error("There was an error deleting the industry!", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting the industry.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Industry List</h1>
        <button className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
          <Link to="/addIndustry">Add New Industry</Link>
        </button>
      </div>

      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
        <thead>
          <tr className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
            <th className="py-2 px-6">ID</th>
            <th className="py-2 px-6">Industry Name</th>
            <th className="py-2 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {industries.map((industry) => (
            <tr
              key={industry._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{industry.id}</td>
              <td className="py-2 px-6">{industry.name}</td>
              <td className="py-2 px-4">
                <div className="flex py-1 px-4 items-center space-x-2">
                  <button>
                    <Link to={`/editIndustry/${industry._id}`}>
                      <FaEdit className="text-gray-500 text-lg" />
                    </Link>
                  </button>
                  <button onClick={() => handleDelete(industry._id)}>
                    <FaTrashAlt className="text-red-600 text-lg" />
                  </button>
                </div>
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
    {Math.min((pageIndex + 1) * pageSize, allIndustries.length)} of{" "}
    {allIndustries.length} entries
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
    </div>
  );
};

export default IndustryList; // Make sure the export matches the component name
