import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import debounce from "lodash/debounce";
import Swal from 'sweetalert2';

const AllGives = () => {
  const [gives, setGives] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalGives, setTotalGives] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const fetchGives = async () => {
    try {
      const token = getCookie("token");
      // Pass pagination and search parameters to the API
      const response = await axios.get(`/api/myGives/getMyAllGives`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: pageIndex + 1, // API is likely 1-based, component is 0-based
          limit: pageSize,
          search: searchValue,
        },
        withCredentials: true,
      });

      const responseData = response.data.data; // Assuming the array is in response.data.data
      const total = response.data.total; // Assuming total count is in response.data.total

      // Add a sequential ID for display purposes
      const dataWithIds = (responseData || []).map((give, index) => ({
        ...give,
        id: pageIndex * pageSize + index + 1,
      }));

      setGives(dataWithIds);
      setTotalGives(total);
      setPageCount(Math.ceil(total / pageSize));
    } catch (error) {
      console.error("Error fetching gives:", error);
    }
  };

  useEffect(() => {
    fetchGives();
  }, [pageIndex, pageSize, searchValue]); // Refetch when page, size, or search changes


  const handleSearchChange = debounce((e) => {
    setSearchValue(e.target.value);
    setPageIndex(0);
  }, 300);

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) {
      setPageIndex(pageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
    }``
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
            await axios.delete(`/api/myGives/deletemyGivesById?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'Your "My Give" has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Refresh data after deletion
            fetchGives(); // Fetch data after deletion
        } catch (error) {
            console.error("Error deleting company:", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting your "My Give".',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  return (
    <div className="p-4 ">
      <div className="lg:flex lg:flex-wrap lg:justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Give List</h1>
        <div className="lg:flex">
          <input
            type="text"
            onChange={handleSearchChange}
            placeholder="Search Company..."
            className="p-2 mr-3 mt-3 border border-gray-300 rounded w-full"
          />
          <div className="flex gap-2">
            <button className="px-4 w-1/2 lg:w-[200px] py-1 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300 border border-gray-300 ">
              <Link to="/addGivesbyEmail">Add Members Gives</Link>
            </button>
            <button className="px-4 py-2 w-1/2 lg:w-[200px] mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-slate-900 transition duration-300 border border-gray-300 ">
              <ReactHTMLTableToExcel
                id="test-table-xls-button"
                className="btn btn-success"
                table="table-to-xls"
                filename="give_list"
                sheet="give_list"
                buttonText="Export to Excel"
              />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-scroll">
        <table
          id="table-to-xls"
          className="w-full mt-4 border-collapse shadow-lg overflow-x-auto"
        >
          <thead>
            <tr className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
              <th className="py-2 px-6">ID</th>
              <th className="py-2 px-6">Company Name</th>
              <th className="py-2 px-6">Email</th>
              <th className="py-2 px-6">URL</th>
              <th className="py-2 px-6">Phone</th>
              {/* <th className="py-2 px-6">Department</th> */}
              <th className="py-2 px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="overflow-x-auto">
            {gives.length > 0 ? (
              gives.map((give, index) => (
                <tr
                  key={give._id}
                  className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                  <td className="py-2 px-6">{give.id}</td>
                  <td className="py-2 px-6">{give.companyName}</td>
                  <td className="py-2 px-6">{give.email}</td>
                  <td className="py-2 px-6">
                    <a
                      href={give.webURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500"
                    >
                      {give.webURL}
                    </a>
                  </td>
                  <td className="py-2 px-6">{give.phoneNumber}</td>
                  {/* <td className="py-2 px-6">{company.dept}</td> */}
                  <td className="py-2 px-6 flex space-x-2">
                    <button>
                      <Link to={`/editAllMyGives/${give._id}`}>
                        <FaEdit className="text-gray-500 text-lg" />
                      </Link>
                    </button>
                    <button onClick={() => handleDelete(give._id)}>
                      <FaTrashAlt className="text-red-600 text-lg" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-2 px-6 text-center">
                  No data available
                </td>
              </tr>
            )}
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
          {Math.min((pageIndex + 1) * pageSize, totalGives)} of{" "}
          {totalGives} entries
        </span>

        {/* Pagination Controls */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pageIndex === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}>First</button>
          <button onClick={handlePreviousPage} disabled={pageIndex === 0} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pageIndex === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}>Previous</button>
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

export default AllGives;
