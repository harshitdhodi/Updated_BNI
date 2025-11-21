import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
const CountryList = () => {
  const [countries, setCountries] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Default to 10
  const [pageCount, setPageCount] = useState(0);
  const [totalCountries, setTotalCountries] = useState(0);

  const getCookie = (name) => { 
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    fetchCountries();
  }, [pageIndex, pageSize]);

  const fetchCountries = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/country/getCountry`, {
        params: { page: pageIndex + 1, limit: pageSize },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const dataWithIds = response.data.data.map((country, index) => ({
        ...country,
        id: pageIndex * pageSize + index + 1,
      }));
      setCountries(dataWithIds);
      setTotalCountries(response.data.count); // Corrected from 'total' to 'count'
      setPageCount(Math.ceil(response.data.count / pageSize)); // Corrected from 'total' to 'count'
    } catch (error) {
      console.error("There was an error fetching the countries!", error);
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
            await axios.delete(`/api/country/deleteCountry?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'The country has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Refresh data after deletion
            fetchCountries(); // Fetch data after deletion
        } catch (error) {
            console.error("There was an error deleting the country!", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting the country.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Country List</h1>
        {/* <Link to="/addCountry" className="ml-auto">
          <button className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 text-md font-medium rounded-full">Add New Country</button>
        </Link> */}
      </div>

      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 text-left uppercase font-serif text-[14px]">
            <th className="py-2 px-6 ">ID</th>
            <th className="py-2 px-6 ">Country Name</th>
            <th className="py-2 px-6 ">Photo</th>
            <th className="py-2 px-6 ">Actions</th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => (
            <tr
              key={country._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{country.id}</td>
              <td className="py-2 px-6">{country.name}</td>
              <td className="py-2 px-6">
                {country.photo && country.photo.length > 0 && (
                  <img
                    src={`${country.photo[0]}`}
                    alt="Country"
                    className="h-20 object-cover w-[200px] lg:w-[150px] lg:h-[100px]"
                  />
                )}
              </td>
              <td className="py-2 px-4">
                <div className="flex py-1 px-4 items-center space-x-2">
                  <button>
                    <Link to={`/editCountry/${country._id}`}>
                      <FaEdit className="text-blue-500 text-lg" />
                    </Link>
                  </button>
                  {/* <button onClick={() => handleDelete(country._id)}>
                    <FaTrashAlt className="text-gray-600 text-lg" />
                  </button> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* === IMPROVED PAGINATION UI === */}
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
    {Math.min((pageIndex + 1) * pageSize, totalCountries)} of{" "}
    {totalCountries} entries
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
          for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          if (current <= delta + 2) {
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

export default CountryList;
