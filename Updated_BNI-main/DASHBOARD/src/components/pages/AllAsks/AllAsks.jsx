import  { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
import { EyeIcon } from "lucide-react";
const AllAsks = () => {
  const [allData, setAllData] = useState([]);
  const [data, setData] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalAsks, setTotalAsks] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Fetch all data once
  const fetchAllAsks = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/myAsk/getAllAsks`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: {
          page: 1,
          limit: 10000, // Fetch a large limit to get all data
        },
        withCredentials: true,
      });

      const responseData = response.data.data || [];
      setAllData(responseData);
    } catch (error) {
      console.error("Error fetching all asks:", error);
    }
  };

  // Filter and paginate data based on search value
  const filterAndPaginateData = () => {
    let filteredData = allData;

    const trimmedSearchValue = searchValue.trim().toLowerCase();

    // Client-side filtering based on search value
    if (trimmedSearchValue) {
      filteredData = allData.filter((ask) =>
        ask.companyName?.toLowerCase().includes(trimmedSearchValue) ||
        ask.dept?.name?.toLowerCase().includes(trimmedSearchValue) ||
        ask.message?.toLowerCase().includes(trimmedSearchValue)
      );
    }

    const total = filteredData.length;
    const pageCount = Math.ceil(total / pageSize);

    // Paginate the filtered data
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const dataWithIds = paginatedData.map((ask, index) => ({
      ...ask,
      id: startIndex + index + 1,
    }));

    setData(dataWithIds);
    setTotalAsks(total);
    setPageCount(pageCount);
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllAsks();
  }, []);

  // Filter and paginate whenever search value, page index, or page size changes
  useEffect(() => {
    filterAndPaginateData();
  }, [searchValue, pageIndex, pageSize, allData]);

  // Debounced search handler
  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
    setPageIndex(0);
  };

  // Handle page changes
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

  // Handle delete
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
            await axios.delete(`/api/myAsk/deleteMyAskById?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'Your "My Ask" has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Refresh all data after deletion
            fetchAllAsks(); 
            setPageIndex(0);
        } catch (error) {
            console.error("Error deleting My Ask:", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting your "My Ask".',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ask List");
    XLSX.writeFile(workbook, "ask_list.xlsx");
  };

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Ask List</h1>

        <div className="flex space-x-2">
          <input
            type="text"
            onChange={handleSearchChange}
            placeholder="Search Company..."
            className="px-2 border border-gray-300 rounded"
          />
          <button className="px-4 py-2 mt-3 bg-gradient-to-r shadow-md hover:shadow-lg from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
            <Link to="/addAsksbyEmail">Add Members Asks</Link>
          </button>
          <button
            className="px-4 py-2 ml-3 mt-3 bg-gradient-to-r shadow-md hover:shadow-lg from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-slate-900 transition duration-300"
            onClick={exportToExcel}
          >
            Export to Excel
          </button>
        </div>
      </div>

      <table
        id="table-to-xls"
        className="w-full mt-4 border-collapse shadow-lg"
      >
        <thead>
          <tr className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
            <th className="py-2 px-6">ID</th>
            <th className="py-2 px-6">Company Name</th>
            <th className="py-2 px-6">Department</th>
            <th className="py-2 px-6">Message</th>
            <th className="py-2 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ask) => (
            <tr
              key={ask._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{ask.id}</td>
              <td className="py-2 px-6">{ask.companyName}</td>
              <td className="py-2 px-6">{ask.dept?.name || "No Department"} </td>
              <td className="py-2 px-6">
                {ask.message.length > 30
                  ? `${ask.message.substring(0, 60)}...`
                  : ask.message}
              </td>
              <td className="py-2 px-6 flex space-x-2">
                <button
                  onClick={() => {
                    setModalData(ask);
                    setIsModalOpen(true);
                  }}
                  className=""
                >
                  <EyeIcon className="text-gray-500 text-md" />
                </button>
                <button>
                  <Link to={`/editAllMyAsks/${ask._id}`}>
                    <FaEdit className="text-gray-500 text-lg" />
                  </Link>
                </button>
                <button onClick={() => handleDelete(ask._id)}>
                  <FaTrashAlt className="text-red-600 text-lg" />
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
          {Math.min((pageIndex + 1) * pageSize, totalAsks)} of{" "}
          {totalAsks} entries
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${pageIndex >= pageCount - 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
          >
            Next
          </button>
          <button
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${pageIndex >= pageCount - 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"}`}
          >
            Last
          </button>
        </nav>
      </div>

      {/* Modal for Viewing Details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2 h-auto">
            <h2 className="text-lg font-bold mb-4">Details</h2>
            <p>Company Name: {modalData.companyName}</p>
            <p>Department: {modalData.dept}</p>
            <p>Message: {modalData.message}</p>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-[#CF2030] text-white rounded mt-4 hover:bg-red-600 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllAsks;
