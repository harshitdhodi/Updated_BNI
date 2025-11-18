import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
const ChapterList = () => {
  const [chapters, setChapters] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 5;
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchChapters();
  }, [pageIndex]);

  const fetchChapters = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/chapter/getchapter?page=${pageIndex + 1}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      const dataWithIds = response.data.data.map((chapter, index) => ({
        ...chapter,
        id: pageIndex * pageSize + index + 1,
      }));
      setChapters(dataWithIds);
      setPageCount(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error("There was an error fetching the chapters!", error);
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
            await axios.delete(`/api/chapter/deleteChapter?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'The chapter has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Refresh data after deletion
            fetchChapters(); // Fetch data after deletion
        } catch (error) {
            console.error("There was an error deleting the chapter!", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting the chapter.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};
  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Chapter List</h1>
        <button className="px-4 py-2 mt-3 bg-[#CF2030] text-white rounded transition duration-300">
          <Link to="/createChapter">Add New Chapter</Link>
        </button>
      </div>

      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
        <thead>
          <tr className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
            <th className="py-2 px-6 ">ID</th>
            <th className="py-2 px-6 ">Chapter Title</th>
            <th className="py-2 px-6 ">Country</th>
            <th className="py-2 px-6 ">City</th>
            <th className="py-2 px-6 ">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr
              key={chapter._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{chapter.id}</td>
              <td className="py-2 px-6">{chapter.name}</td>
              <td className="py-2 px-6">{chapter.countryName}</td>
              <td className="py-2 px-6">{chapter.city}</td>
              <td className="py-2 px-4">
                <div className="flex py-1 px-4 items-center space-x-2">
                  <button>
                    <Link to={`/editchapter/${chapter._id}`}>
                      <FaEdit className="text-blue-500 text-lg" />
                    </Link>
                  </button>
                  <button onClick={() => handleDelete(chapter._id)}>
                    <FaTrashAlt className="text-gray-600 text-lg" />
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
          className="px-3 py-1 bg-[#CF2030] text-white flex justify-center rounded hover:bg-slate-900 transition"
        >
          {"<"}
        </button>
        <button
          onClick={handleNextPage}
          disabled={pageIndex + 1 >= pageCount}
          className="px-3 py-1 bg-[#CF2030] text-white rounded hover:bg-slate-900 transition"
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
    </div>
  );
};

export default ChapterList;
