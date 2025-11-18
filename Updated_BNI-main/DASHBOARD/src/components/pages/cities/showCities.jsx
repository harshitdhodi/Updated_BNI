import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

const CityList = () => {
  const [cities, setCities] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Now dynamic
  const [pageCount, setPageCount] = useState(1);
  const [totalCities, setTotalCities] = useState(0); // Total from backend

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    fetchCities();
  }, [pageIndex, pageSize]);

  const fetchCities = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/city/getCity?page=${pageIndex + 1}&limit=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCgrayentials: true,
        }
      );

      const dataWithIds = response.data.data.map((city, index) => ({
        ...city,
        id: pageIndex * pageSize + index + 1,
      }));

      setCities(dataWithIds);
      setTotalCities(response.data.total);
      setPageCount(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error("Error fetching cities:", error);
      Swal.fire("Error", "Failed to load cities.", "error");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getCookie("token");
        await axios.delete(`/api/city/deleteCity?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCgrayentials: true,
        });

        Swal.fire("Deleted!", "City has been deleted.", "success");
        fetchCities(); // Refresh current page
      } catch (error) {
        Swal.fire("Error!", "Failed to delete city.", "error");
      }
    }
  };

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">City List</h1>
        <Link to="/createCity">
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 font-medium rounded-lg hover:bg-gray-600 transition shadow-md">
            Add New City
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full mt-4 border-collapse shadow-lg bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 text-left  text-sm">
              <th className="py-3 px-6">ID</th>
              <th className="py-3 px-6">City Name</th>
              <th className="py-3 px-6">Country</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No cities found.
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr
                  key={city._id}
                  className="border-b hover:bg-gray-50 transition duration-150"
                >
                  <td className="py-4 px-6 text-gray-700">{city.id}</td>
                  <td className="py-4 px-6 font-medium">{city.name}</td>
                  <td className="py-4 px-6 text-gray-600">{city.countryName || "N/A"}</td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center gap-4">
                      <Link to={`/editcities/${city._id}`}>
                        <button className="text-gray-600 hover:text-gray-800 transition">
                          <FaEdit size={18} />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(city._id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* === MODERN PAGINATION UI === */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        {/* Rows per page */}
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>

        {/* Showing info */}
        <span className="text-sm text-gray-600">
          Showing {cities.length === 0 ? 0 : pageIndex * pageSize + 1} to{" "}
          {Math.min((pageIndex + 1) * pageSize, totalCities)} of {totalCities} entries
        </span>

        {/* Pagination Controls */}
        <nav className="flex items-center gap-1" aria-label="Pagination">
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

          <button
            onClick={() => setPageIndex(pageIndex - 1)}
            disabled={pageIndex === 0}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pageIndex === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
            }`}
          >
            Previous
          </button>

          {/* Page Numbers with Ellipsis */}
          <div className="flex items-center gap-1">
            {(() => {
              const pages = [];
              const current = pageIndex + 1;
              const delta = 2;

              if (pageCount <= 7) {
                for (let i = 1; i <= pageCount; i++) pages.push(i);
              } else if (current <= delta + 2) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push("...");
                pages.push(pageCount);
              } else if (current >= pageCount - delta - 1) {
                pages.push(1);
                pages.push("...");
                for (let i = pageCount - 4; i <= pageCount; i++) pages.push(i);
              } else {
                pages.push(1);
                pages.push("...");
                for (let i = current - delta; i <= current + delta; i++) pages.push(i);
                pages.push("...");
                pages.push(pageCount);
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
                        ? "bg-gray-500 text-white shadow-md"
                        : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}
          </div>

          <button
            onClick={() => setPageIndex(pageIndex + 1)}
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

export default CityList;