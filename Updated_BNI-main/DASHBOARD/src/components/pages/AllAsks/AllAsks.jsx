import  { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import debounce from "lodash/debounce";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';
const AllAsks = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [value, setValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const pageSize = 5;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  // Fetch data based on search value or page number
  const fetchAsks = async (searchValue = "", page = 1) => {
    try {
      const token = getCookie("token");
      const url = searchValue
        ? `/api/myAsk/getFilteredAsks?companyName=${searchValue}`
        : `/api/myAsk/getAllAsks?page=${page}`;

      const response = await axios.get(url, { headers: {
            Authorization: `Bearer ${token}`,
          }, withCredentials: true });

      // Log the API response to understand its structure
      console.log("API Response:", response);

      const responseData = response.data;

      // Check if the response data has a 'result' field or 'data' field
      if (responseData.result && Array.isArray(responseData.result)) {
        // Handle the filtered search response format
        setFilteredData(responseData.result);
        setData(responseData.result);
      } else if (responseData.data && Array.isArray(responseData.data)) {
        // Handle the all asks response format
        setFilteredData(responseData.data);
        setData(responseData.data);
        // Update pagination state if necessary
        setHasNextPage(responseData.hasNextPage);
        setTotalPages(Math.ceil(responseData.total / pageSize)); // Adjust pageSize as needed
      } else {
        console.error(
          "Invalid response format - expected an array in response.data.result or response.data.data:",
          responseData
        );
      }
    } catch (error) {
      console.error("Error fetching asks:", error);
    }
  };

  useEffect(() => {
    fetchAsks(); // Fetch initial data
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    console.log("Filtered Data:", filteredData);
    console.log("Data:", data);
  }, [filteredData, data]);

  // Debounced search handler
  const debouncedFilterData = debounce((e) => {
    const searchValue = e.target.value;
    setValue(searchValue);
    setCurrentPage(1); // Reset to first page on search
    fetchAsks(searchValue, 1); // Fetch filtered data
  }, 300);

  // Handle page changes
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
      fetchAsks(value, currentPage + 1); // Fetch data for the next page
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      fetchAsks(value, currentPage - 1); // Fetch data for the previous page
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

            // Refresh data after deletion
            fetchAsks(value, currentPage); // Fetch data after deletion
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

  const getItemId = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
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

        <div>
          <input
            type="text"
            onChange={debouncedFilterData}
            placeholder="Search Company..."
            className="p-2 border border-gray-300 rounded"
          />
          <button className="px-4 py-2 mt-3 bg-[#CF2030] text-white rounded hover:bg-red-600 transition duration-300">
            <Link to="/addAsksbyEmail">Add Members Asks</Link>
          </button>
          <button
            className="px-4 py-2 ml-3 mt-3 bg-[#0fc29e] text-white rounded hover:bg-slate-900 transition duration-300"
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
          <tr className="bg-[#CF2030] text-white text-left uppercase font-serif text-[14px]">
            <th className="py-2 px-6">ID</th>
            <th className="py-2 px-6">Company Name</th>
            <th className="py-2 px-6">Department</th>
            <th className="py-2 px-6">Message</th>
            <th className="py-2 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {(value.length > 0 ? filteredData : data).map((ask, index) => (
            <tr
              key={ask._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{getItemId(index)}</td>
              <td className="py-2 px-6">{ask.companyName}</td>
              <td className="py-2 px-6">{ask.dept}</td>
              <td className="py-2 px-6">
                {ask.message.length > 30
                  ? `${ask.message.substring(0, 60)}...`
                  : ask.message}
              </td>
              <td className="py-2 px-6 flex space-x-2">
                <button>
                  <Link to={`/editAllMyAsks/${ask._id}`}>
                    <FaEdit className="text-blue-500 text-lg" />
                  </Link>
                </button>
                <button onClick={() => handleDelete(ask._id)}>
                  <FaTrashAlt className="text-red-500 text-lg" />
                </button>
                <button
                  onClick={() => {
                    setModalData(ask);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0fc29e] text-white rounded hover:bg-slate-900 transition duration-300"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-[#CF2030] text-white rounded hover:bg-slate-900 transition"
        >
          {"<"}
        </button>
        <button
          onClick={handleNextPage}
          disabled={!hasNextPage}
          className="px-3 py-1 bg-[#CF2030] text-white rounded hover:bg-slate-900 transition"
        >
          {">"}
        </button>
        <span>
          Page{" "}
          <strong>
            {currentPage} of {totalPages}
          </strong>
        </span>
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
