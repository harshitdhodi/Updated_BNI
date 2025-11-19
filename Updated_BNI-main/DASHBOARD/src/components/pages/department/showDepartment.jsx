import  { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5); // Default page size
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchDepartments();
  }, [pageIndex, pageSize]); // Refetch when page or page size changes

  const fetchDepartments = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/department/getDepartment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: pageIndex + 1, // API is likely 1-based, component is 0-based
            limit: pageSize,
          },
          withCredentials: true,
        }
      );
      const responseData = response.data.data;
      const total = response.data.total;
      const dataWithIds = (responseData || []).map((department, index) => ({
        ...department,
        id: pageIndex * pageSize + index + 1,
      }));
      setDepartments(dataWithIds);
      setTotalDepartments(total);
      setPageCount(Math.ceil(total / pageSize));
    } catch (error) {
      console.error("There was an error fetching the departments!", error);
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
            await axios.delete(`/api/department/deleteDepartmentById?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'The department has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Refresh data after deletion
            fetchDepartments(); // Fetch data after deletion
        } catch (error) {
            console.error("There was an error deleting the department!", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting the department.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  return (
    <div className="p-4 overflow-x-auto">
      <div className="lg:flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 sm:ml-2">Department List</h1>
        <button className="px-4 py-2 mt-3 bg-gradient-to-r shadow-md from-blue-100 to-blue-50 text-gray-700 rounded transition duration-300">
          <Link to="/createDepartment">Add New Department</Link>
        </button>
      </div>

      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
        <thead>
          <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 text-left uppercase font-serif text-[14px]">
            <th className="py-2 px-6 ">ID</th>
            <th className="py-2 px-6 ">Department Name</th>
            <th className="py-2 px-6 ">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((department) => (
            <tr
              key={department._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{department.id}</td>
              <td className="py-2 px-6">{department.name}</td>
              <td className="py-2 px-4">
                <div className="flex py-1 px-4 items-center space-x-2">
                  <button>
                    <Link to={`/editdepartment/${department._id}`}>
                      <FaEdit className="text-gray-500 text-lg" />
                    </Link>
                  </button>
                  <button onClick={() => handleDelete(department._id)}>
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
          {Math.min((pageIndex + 1) * pageSize, totalDepartments)} of{" "}
          {totalDepartments} entries
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
    </div>
  );
};

export default DepartmentList;
