import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail, MdPlace } from "react-icons/md";

const PendingMember = () => {
  const { PendingMember } = useParams();
  const [member, setMember] = useState([]);
  const [filteredMember, setFilteredMember] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const pageSize = 5;
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchMember();
  }, [pageIndex, PendingMember]);

  useEffect(() => {
    filterMember(searchValue);
  }, [member, searchValue]);

  const fetchMember = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/member/getMemberApprovedData` ,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const dataWithIds = response.data.data.map((member, index) => ({
        ...member,
        id: pageIndex * pageSize + index + 1,
      }));
      setMember(dataWithIds);
      setFilteredMember(dataWithIds);
      setPageCount(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  };

  const filterMember = (searchValue) => {
    const filtered = member.filter((mem) =>
      mem.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredMember(filtered);
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

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      const token = getCookie("token");
      await axios.put(`/api/member/updatememberById?id=${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }, {
        approvedByadmin: newStatus, 
      });
      if (newStatus === "approved") { 
        // Reload the page when status is approved
        // window.location.reload();
      } else {
        // Refresh member data if not approved
        fetchMember();
      }
    } catch (error) {
      console.error("Error updating member status:", error);
    }
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
              <tr className="px-4 py-2 mt-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 rounded hover:bg-red-600 transition duration-300">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Info</th>
                <th className="py-2 px-4">Status</th>
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
                    <div>
                      <p className="flex items-center gap-1 ">
                        <BsFillTelephoneFill className="text-gray-600" />
                        {member.mobile}
                      </p>
                      <p className="flex items-center gap-1">
                        <MdEmail className="text-gray-600" /> {member.email}
                      </p>
                      <p className="flex items-center gap-1">
                        <MdPlace className="text-gray-600" />
                        <span>{member.country}, </span>
                        <span>{member.city}</span>
                      </p>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <select
                      value={member.approvedByadmin}
                      onChange={(e) =>
                        handleStatusChange(member._id, e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      {["pending", "approved", "cancel"].map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                          {/* Capitalize the first letter */}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-2 px-4">
                    <div className="flex items-center space-x-2">
                      <Link to={`/member/edit/${member._id}`}>
                        <FaEdit className="text-blue-500" />
                      </Link>
                      <Link to={`/member/view/${member._id}`}>
                        <FaEye className="text-green-500" />
                      </Link>
                      <FaTrashAlt
                        className="text-gray-600 cursor-pointer"
                        // Add delete function if needed
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
              className="px-3 py-1 bg-[#CF2030] text-white rounded transition"
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
              </strong>
            </span>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 mt-4">
          No referred members found.
        </div>
      )}
    </div>
  );
};

export default PendingMember;
