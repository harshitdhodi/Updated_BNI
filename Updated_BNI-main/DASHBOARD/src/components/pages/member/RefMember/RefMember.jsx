/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail, MdPlace } from "react-icons/md";
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
           withCredentials: true }
      );
      const dataWithIds = response.data.data.map((member, index) => ({
        ...member,
        id: pageIndex * pageSize + index + 1,
      }));
      setMember(dataWithIds);
      setFilteredMember(dataWithIds);
      if (response.data.total != null) {
        setPageCount(Math.ceil(response.data.total / pageSize));
      } else {
        setPageCount(Math.ceil(response.data.data.length / pageSize));
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
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
  
        // Optional: Fetch the updated list of members after deletion
        fetchMember();
  
        // Show success message
        Swal.fire("Deleted!", "The member has been deleted.", "success");
        // Optionally, you can reload the page or update the state here
        window.location.reload();
      } catch (error) {
        console.error("There was an error deleting the member!", error);
        // Show error message
        Swal.fire("Error!", "There was an error deleting the member.", "error");
      }
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowModal(true);
  };
  const filterMember = (searchValue) => {
    const filtered = member.filter((mem) =>
      mem.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredMember(filtered);
  };
  const closeModal = () => {
    setShowModal(false);
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
  const MemberModal = ({ member, onClose }) => {
    if (!member) return null;

    return (
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        <div className="bg-white w-[580px] p-6 rounded shadow-lg max-w-lg overflow-y-auto">
          <div className="mb-4">
            <div className="flex">
              <div>
                <p>
                  <strong>Profile Image:</strong>
                </p>
                <img
                  src={`/api/image/download/${member.profileImg}`}
                  alt="Profile"
                  className="w-1/2 max-h-60 object-cover mb-2"
                />
              </div>
              <div>
                <p>
                  <strong>Banner Image:</strong>
                </p>
                <img
                  src={`/api/image/download/${member.bannerImg}`}
                  alt="Banner"
                  className="w-1/2 max-h-60 object-cover mb-2"
                />
              </div>
            </div>
            <p>
              <strong>Name:</strong> {member.name}
            </p>
            <p>
              {/* <strong>Chapter:</strong> {member.chapter} */}
            </p>
            <p>
              <strong>Mobile:</strong> {member.mobile}
            </p>
            <p>
              <strong>Email:</strong> {member.email}
            </p>
            <p>
              <strong>Country:</strong> {member.country}
            </p>
            <p>
              <strong>City:</strong> {member.city}
            </p>
            {/* <p>
              <strong>Keyword:</strong> {member.keyword}
            </p> */}
          </div>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  return (
    <div className="p-4 overflow-x-auto">
      <nav className="mb-4">
        <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
          Dashboard /
        </Link>
        <Link to="/memberList" className="mr-2 text-gray-400 hover:text-gray-500">
          MemberList /
        </Link>
        <Link className="font-semibold text-gray-600">Ref Members</Link>
      </nav>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">Referred Members</h1>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search by name"
          className="px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      {filteredMember.length > 0 ? (
        <>
          <table className="w-full mt-4 border-collapse shadow-lg">
            <thead>
              <tr className="bg-[#CF2030] text-white text-left uppercase font-serif text-[14px]">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Name</th>
                {/* <th className="py-2 px-4">Phone</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">City</th> */}
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMember.map((member) => (
                <tr
                  key={member._id}
                  className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                  <td className="py-2 px-4">{member.id}</td>
                  <td className="py-2 px-4">
                  <p className="flex items-center gap-1 capitalize font-bold ">
                       
                       {member.name}
                     </p>
                  <div>
                 
                      <p className="flex items-center gap-1 ">
                        <BsFillTelephoneFill className="text-gray-600" />
                        {member.mobile}
                      </p>
                      <p className="flex items-center gap-1">
                        <MdEmail className="text-gray-600" /> {member.email}
                      </p>
                      <p className="flex items-center gap-1">
                        <MdPlace className="text-gray-600" />{" "}
                        <span>{member.country}, </span>
                        <span>{member.city}</span>
                      </p>
                    </div>
                  </td>
                  {/* <td className="py-2 px-4">
                    <BsFillTelephoneFill className="inline-block mr-2" />
                    {member.mobile}
                  </td>
                  <td className="py-2 px-4">
                    <MdEmail className="inline-block mr-2" />
                    {member.email}
                  </td>
                  <td className="py-2 px-4">
                    <MdPlace className="inline-block mr-2" />
                    {member.city}
                  </td> */}
                  <td className="py-2 px-4">
                    <div className="flex items-center space-x-2">
                      <Link to={`/editMember/${member._id}`}>
                        <FaEdit className="text-blue-500" />
                      </Link>
                      <FaEye
                        onClick={() => handleViewDetails(member)}
                        className="text-green-700"
                      />
                      <FaTrashAlt
                        className="text-gray-600 cursor-pointer"
                        onClick={() => handleDelete(member._id)}
                      />
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
        </>
      ) : (
        <div className="text-center text-gray-500 mt-4">No referred members found.</div>
      )}

{showModal && (
        <MemberModal member={selectedMember} onClose={closeModal} />
      )}
    </div>
  );
};

export default RefMember;
