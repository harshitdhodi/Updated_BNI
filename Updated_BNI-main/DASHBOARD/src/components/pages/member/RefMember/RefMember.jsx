/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail, MdPlace } from "react-icons/md";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Recommended
import Swal from "sweetalert2";

const RefMember = () => {
  const { refMember } = useParams();
  const [member, setMember] = useState([]);
  const [filteredMember, setFilteredMember] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const pageSize = 5;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    fetchMember();
  }, [pageIndex, refMember]);

  useEffect(() => {
    filterMember(searchValue);
  }, [member, searchValue]);

  const fetchMember = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/member/getMemberByRef?refMember=${refMember}&page=${pageIndex + 1}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const dataWithIds = response.data.data.map((member, index) => ({
        ...member,
        id: pageIndex * pageSize + index + 1,
      }));

      setMember(dataWithIds);
      setFilteredMember(dataWithIds);

      const total = response.data.total ?? response.data.data.length;
      setPageCount(Math.max(1, Math.ceil(total / pageSize)));

      // Adjust page if current page becomes empty after delete
      if (pageIndex > 0 && response.data.data.length === 0) {
        setPageIndex(prev => prev - 1);
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const token = getCookie("token");
        await axios.delete(`/api/member/deletememberById?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        Swal.fire("Deleted!", "The member has been deleted.", "success");
        fetchMember(); // Refresh list
      } catch (error) {
        console.error("Error deleting member:", error);
        Swal.fire("Error!", "Failed to delete member.", "error");
      }
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const filterMember = (searchValue) => {
    const filtered = member.filter((mem) =>
      mem.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredMember(filtered);
  };

  const handleNextPage = () => {
    if (pageIndex < pageCount - 1) setPageIndex(pageIndex + 1);
  };

  const handlePreviousPage = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const MemberModal = ({ member, onClose }) => {
    if (!member) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white w-[580px] p-6 rounded-lg shadow-xl max-h-screen overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="font-semibold mb-2">Profile Image:</p>
              <img
                src={`/api/image/download/${member.profileImg}`}
                alt="Profile"
                className="w-full h-48 object-cover rounded border"
              />
            </div>
            <div>
              <p className="font-semibold mb-2">Banner Image:</p>
              <img
                src={`/api/image/download/${member.bannerImg}`}
                alt="Banner"
                className="w-full h-48 object-cover rounded border"
              />
            </div>
          </div>

          <div className="space-y-2 text-gray-700">
            <p><strong>Name:</strong> {member.name}</p>
            <p><strong>Mobile:</strong> {member.mobile}</p>
            <p><strong>Email:</strong> {member.email}</p>
            <p><strong>Country:</strong> {member.country}</p>
            <p><strong>City:</strong> {member.city}</p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 overflow-x-auto">
      <nav className="mb-4 text-sm">
        <Link to="/" className="text-gray-400 hover:text-gray-600">Dashboard /</Link>{" "}
        <Link to="/memberList" className="text-gray-400 hover:text-gray-600">MemberList /</Link>{" "}
        <span className="font-semibold text-gray-700">Ref Members</span>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Referred Members</h1>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name..."
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>

      {filteredMember.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 text-left text-sm uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">ID</th>
                  <th className="py-3 px-4 font-medium">Name & Details</th>
                  <th className="py-3 px-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMember.map((member) => (
                  <tr
                    key={member._id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-4 font-medium text-gray-800">{member.id}</td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 capitalize text-lg">{member.name}</p>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <BsFillTelephoneFill className="text-blue-600" />
                          {member.mobile}
                        </p>
                        <p className="flex items-center gap-2">
                          <MdEmail className="text-red-600" />
                          {member.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <MdPlace className="text-green-600" />
                          {member.country}, {member.city}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-4 text-xl">
                        <FaEye
                          className="text-gray-600 hover:text-blue-600 cursor-pointer transition"
                          onClick={() => handleViewDetails(member)}
                        />
                        <Link to={`/editMember/${member._id}`}>
                          <FaEdit className="text-gray-600 hover:text-green-600 cursor-pointer transition" />
                        </Link>
                        <FaTrashAlt
                          className="text-red-600 hover:text-red-800 cursor-pointer transition"
                          onClick={() => handleDelete(member._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Beautiful Pagination - Same as before */}
          <div className="mt-8 flex justify-between items-center bg-white px-6 py-4 rounded-lg shadow-md border border-gray-200">
            <div className="text-sm text-gray-700">
              Page <span className="font-bold text-gray-900">{pageIndex + 1}</span> of{" "}
              <span className="font-bold text-gray-900">{pageCount}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousPage}
                disabled={pageIndex === 0}
                className="flex items-center justify-center px-4 h-10 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={18} className="mr-1" />
                Previous
              </button>

              <button
                onClick={handleNextPage}
                disabled={pageIndex + 1 >= pageCount}
                className="flex items-center justify-center px-4 h-10 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight size={18} className="ml-1" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500 text-lg">
          No referred members found.
        </div>
      )}

      {showModal && <MemberModal member={selectedMember} onClose={closeModal} />}
    </div>
  );
};

export default RefMember;