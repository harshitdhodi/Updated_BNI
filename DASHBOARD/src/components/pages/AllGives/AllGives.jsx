import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import debounce from "lodash/debounce";
import Swal from 'sweetalert2';

const AllGives = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [value, setValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const pageSize = 5;
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const fetchCompanies = async (searchValue = "", page = 1) => {
    try {
      const token = getCookie("token");
      setIsSearching(!!searchValue);
      const url = searchValue
        ? `/api/myGives/getFilteredGives?companyName=${searchValue}`
        : `/api/myGives/getMyAllGives?page=${page}`;
      const response = await axios.get(url, { 
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true });

      console.log("API Response:", response.data);

      if (searchValue) {
        setFilteredData(response.data.data || []);
        setHasNextPage(false);
        setTotalPages(1);
      } else {
        setCompanies(response.data.data || []);
        setFilteredData(response.data.data || []);
        setHasNextPage(response.data.hasNextPage || false);
        setTotalPages(Math.ceil(response.data.total / pageSize) || 1);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const debouncedFilterData = debounce((e) => {
    const searchValue = e.target.value;
    setValue(searchValue);
    setCurrentPage(1);
    fetchCompanies(searchValue, 1);
  }, 300);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
      fetchCompanies(value, currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
      fetchCompanies(value, currentPage - 1);
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
            fetchCompanies(value, currentPage); // Fetch data after deletion
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

  const getItemId = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  return (
    <div className="p-4 ">
      <div className="lg:flex lg:flex-wrap lg:justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Give List</h1>
        <div className="lg:flex">
          <input
            type="text"
            onChange={debouncedFilterData}
            placeholder="Search Company..."
            className="p-2 mr-3 mt-3 border border-gray-300 rounded w-full"
          />
          <div className="flex gap-2">
            <button className="px-4 w-1/2 lg:w-[200px] py-1 mt-3 bg-[#CF2030] text-white rounded hover:bg-red-600 transition duration-300">
              <Link to="/addGivesbyEmail">Add Members Gives</Link>
            </button>
            <button className="px-4 py-2 w-1/2 lg:w-[200px] mt-3 bg-[#0fc29e] text-white rounded hover:bg-slate-900 transition duration-300">
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
            <tr className="bg-[#CF2030] text-white text-left uppercase font-serif text-[14px]">
              <th className="py-2 px-6">ID</th>
              <th className="py-2 px-6">Company Name</th>
              <th className="py-2 px-6">Email</th>
              <th className="py-2 px-6">URL</th>
              <th className="py-2 px-6">Phone</th>
              <th className="py-2 px-6">Department</th>
              <th className="py-2 px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="overflow-x-auto">
            {filteredData.length > 0 ? (
              filteredData.map((company, index) => (
                <tr
                  key={company._id}
                  className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                  <td className="py-2 px-6">{getItemId(index)}</td>
                  <td className="py-2 px-6">{company.companyName}</td>
                  <td className="py-2 px-6">{company.email}</td>
                  <td className="py-2 px-6">
                    <a
                      href={company.webURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {company.webURL}
                    </a>
                  </td>
                  <td className="py-2 px-6">{company.phoneNumber}</td>
                  <td className="py-2 px-6">{company.dept}</td>
                  <td className="py-2 px-6 flex space-x-2">
                    <button>
                      <Link to={`/editAllMyGives/${company._id}`}>
                        <FaEdit className="text-blue-500 text-lg" />
                      </Link>
                    </button>
                    <button onClick={() => handleDelete(company._id)}>
                      <FaTrashAlt className="text-red-500 text-lg" />
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

      {!isSearching && (
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
      )}
    </div>
  );
};

export default AllGives;
