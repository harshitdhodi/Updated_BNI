import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaQuestionCircle } from "react-icons/fa";
import { IoEyeSharp } from "react-icons/io5";
import Swal from 'sweetalert2';
const MyAskList = () => {
  const [myAsks, setMyAsks] = useState([]);
  const [myGives, setMyGives] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({});
  const pageSize = 5;

  const { userId } = useParams();
  console.log(userId);
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchMyAsks();
  }, [pageIndex, userId]);

  useEffect(() => {
    fetchMyGives();
  }, [pageIndex, userId]);

  const fetchMyGives = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/myGives/getMyGives?userId=${userId}&page=${pageIndex + 1}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
           withCredentials: true }
      );

      console.log("My Gives Response:", response.data);

      if (response.data && response.data.data) {
        const dataWithIds = response.data.data.map((myGive, index) => ({
          ...myGive,
          id: pageIndex * pageSize + index + 1,
        }));
        setMyGives(dataWithIds);

        if (response.data.total != null) {
          setPageCount(Math.ceil(response.data.total / pageSize));
        } else {
          setPageCount(Math.ceil(response.data.data.length / pageSize));
        }
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching My Gives:", error);
    }
  };

  const fetchMyAsks = async () => {
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

      console.log("My Asks Response:", response.data);

      if (response.data && response.data.data) {
        const dataWithIds = response.data.data.map((myAsk, index) => ({
          ...myAsk,
          id: pageIndex * pageSize + index + 1,
        }));
        setMyAsks(dataWithIds);
        setPageCount(Math.ceil(response.data.total / pageSize));
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching My Asks:", error);
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
    <div className="p-4 overflow-x-auto">
      <nav className="mb-4">
        <Link to="/" className="mr-2 text-red-300 hover:text-red-500">
          Dashboard /
        </Link>
        <Link to="/memberList" className="mr-2 text-red-300 hover:text-red-500">
          MemberList /
        </Link>
        <Link className="font-semibold text-red-500">My Asks</Link>
      </nav>

      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">My Asks List</h1>
        <button className="px-4 py-2 mt-3 bg-[#CF2030] text-white rounded transition duration-300">
          <Link to={`/createMyAsks/${userId}`}>Add Ask</Link>
        </button>
      </div>

      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
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
          {myAsks.map((myAsk) => (
            <tr
              key={myAsk._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-6">{myAsk.id}</td>
              <td className="py-2 px-6">{myAsk.companyName}</td>
              <td className="py-2 px-6">{myAsk.dept?.name}</td>
              <td className="py-2 px-6 ">
                {" "}
                <div className="truncate overflow-hidden max-w-xs ">
                  {myAsk.message}
                </div>
              </td>
              <td className="py-2 px-4">
                <div className="flex py-1 px-4 items-center space-x-2">
                  <button onClick={() => openModal(myAsk)}>
                    <IoEyeSharp className="text-green-500 text-lg" />
                  </button>
                  <button>
                    <Link to={`/editMyAsks/${userId}/${myAsk._id}`}>
                      <FaEdit className="text-blue-500 text-lg" />
                    </Link>
                  </button>
                  <button onClick={() => handleDelete(myAsk._id)}>
                    <FaTrashAlt className="text-red-500 text-lg" />
                  </button>
                </div>
                <Link
                  to={`/myMatch/${myAsk.companyName}/${myAsk.dept}/${userId}`}
                >
                  <button className="bg-red-600 flex justify-center gap-2 items-center text-white px-2 py-1 rounded hover:bg-red-700 transition">
                    <FaQuestionCircle className="text-lg" />
                    <p> My Matches</p>
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center items-center space-x-2">
        <button
          onClick={handlePreviousPage}
          disabled={pageIndex === 0}
          className="px-3 py-1 bg-[#CF2030] text-white flex justify-center rounded transition"
        >
          {"<"}
        </button>
        <button
          onClick={handleNextPage}
          disabled={pageIndex + 1 >= pageCount}
          className="px-3 py-1 bg-[#CF2030] text-white rounded transition"
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

      {/* Modal for Viewing Details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center  items-center">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-lg font-bold mb-4">Details</h2>
            <p>Company Name: {modalData.companyName}</p>
            <p>Department: {modalData.dept}</p>
            <p className="">Message: {modalData.message}</p>
            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-[#CF2030] text-white rounded hover:bg-slate-900 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAskList;
