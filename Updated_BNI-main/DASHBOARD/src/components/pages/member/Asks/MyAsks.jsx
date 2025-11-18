import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight, Search, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const MyAskList = () => {
  const [myAsks, setMyAsks] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 5;

  const { userId } = useParams();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchMyAsks();
  }, [pageIndex, userId]);

  const fetchMyAsks = async () => {
    setIsLoading(true);
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/myAsk/getMyAsk?userId=${userId}&page=${pageIndex + 1}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data && response.data.data) {
        const dataWithIds = response.data.data.map((myAsk, index) => ({
          ...myAsk,
          id: pageIndex * pageSize + index + 1,
        }));
        setMyAsks(dataWithIds);

        const totalAsks = response.data.total;
        if (totalAsks) {
          setPageCount(Math.ceil(totalAsks / pageSize));
        } else {
          // Fallback if total is not provided
          setPageCount(pageIndex + (dataWithIds.length < pageSize ? 1 : 2));
        }
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching My Asks:", error);
    } finally {
      setIsLoading(false);
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
            await axios.delete(`/api/myAsk/deleteMyAskById?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'Your ask has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Refresh data after deletion
            fetchMyAsks(); // Fetch data after deletion
        } catch (error) {
            console.error("Error deleting My Ask:", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting your ask.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
};

  const openModal = (ask) => {
    setModalData(ask);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          My Asks List
        </h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search asks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/createMyAsks/${userId}`}>
              <button className="w-full px-4 py-2 bg-gray-100 text-black shadow-lg border-gray-200 border rounded-lg font-medium transition flex items-center justify-center gap-2">
                <Plus size={18} />
                Add Ask
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-black text-lg">
                <th className="px-6 py-3 text-left font-semibold text-sm">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-sm">Company Name</th>
                <th className="px-6 py-3 text-left font-semibold text-sm">Department</th>
                <th className="px-6 py-3 text-left font-semibold text-sm">Message</th>
                <th className="px-6 py-3 text-center font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && myAsks.map((myAsk) => (
                <tr key={myAsk._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-800 font-medium">{myAsk.id}</td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{myAsk.companyName}</td>
                  <td className="px-6 py-4 text-gray-800">{myAsk.dept?.name}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{myAsk.message}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openModal(myAsk)} className="p-2 hover:bg-green-100 rounded-lg transition text-green-600" title="View">
                        <Eye size={18} />
                      </button>
                      <Link to={`/editMyAsks/${userId}/${myAsk._id}`} className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600" title="Edit">
                        <Edit size={18} />
                      </Link>
                      <button onClick={() => handleDelete(myAsk._id)} className="p-2 hover:bg-red-100 rounded-lg transition text-red-600" title="Delete">
                        <Trash2 size={18} />
                      </button>
                      <Link to={`/myMatch/${myAsk.companyName}/${myAsk.dept?._id}/${userId}`} className="p-2 hover:bg-orange-100 rounded-lg transition text-orange-600" title="Find Matches">
                        <HelpCircle size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {isLoading && (
                <tr>
                  <td colSpan="5" className="text-center py-8">
                    <div className="text-gray-500">Loading...</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow-md">
        <div className="text-sm text-gray-700">
          Page <span className="font-bold text-gray-900">{pageIndex + 1}</span> of <span className="font-bold text-gray-900">{pageCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={pageIndex === 0 || isLoading}
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={pageIndex + 1 >= pageCount || isLoading}
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      </div>

      {/* Modal for Viewing Details */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-gradient-to-r from-blue-100 to-blue-50  px-6 py-4 flex justify-between items-center">
              <h2 className="text-gray-700 font-semibold text-lg">Ask Details</h2>
              <button onClick={closeModal} className="text-black rounded-full p-1 transition">
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <p><span className="font-semibold text-gray-700">Company:</span> {modalData.companyName}</p>
                <p><span className="font-semibold text-gray-700">Department:</span> {modalData.dept?.name}</p>
                <p><span className="font-semibold text-gray-700">Message:</span></p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-md border">{modalData.message}</p>
              </div>
              <button
                onClick={closeModal}
                className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAskList;
