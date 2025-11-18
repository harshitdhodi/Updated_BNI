import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Eye, Edit2, Trash2, Phone, Mail, MapPin, Download, MoreVertical, Gift } from 'lucide-react';
import { Toaster, toast } from "react-hot-toast";

const MemberList = () => {
  const [member, setMember] = useState([]);
  const [filteredMember, setFilteredMember] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAsksModal, setShowAsksModal] = useState(false);
  const [showGivesModal, setShowGivesModal] = useState(false);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [showRefMemberModal, setShowRefMemberModal] = useState(false);
  const [selectedActionMember, setSelectedActionMember] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const pageSize = 5;

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    const start = pageIndex * pageSize;
    const pageSlice = allMembers.slice(start, start + pageSize);
    setMember(pageSlice);
    setPageCount(Math.max(1, Math.ceil(allMembers.length / pageSize)));
  }, [pageIndex, allMembers]);

  useEffect(() => {
    fetchMember();
  }, []);

  useEffect(() => {
    filterMember(searchValue);
  }, [allMembers, searchValue]);

  const fetchMember = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/member/getApprovedMember`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const data = response.data.data || [];
      const dataWithIds = data.map((customer, index) => ({
        ...customer,
        id: index + 1,
      }));
      setAllMembers(dataWithIds);
      const start = pageIndex * pageSize;
      setMember(dataWithIds.slice(start, start + pageSize));
      setPageCount(Math.max(1, Math.ceil(dataWithIds.length / pageSize)));
    } catch (error) {
      console.error("There was an error fetching the members!", error);
      toast.error("Failed to fetch members");
    }
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
    setShowModal(true);
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
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        const token = getCookie("token");
        await axios.delete(`/api/member/deletememberById?id=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const remaining = allMembers.filter((m) => m._id !== id);
        setAllMembers(remaining);
        const newPageCount = Math.max(1, Math.ceil(remaining.length / pageSize));
        if (pageIndex >= newPageCount) setPageIndex(newPageCount - 1);

        toast.success("Member deleted successfully");
      } catch (error) {
        console.error("There was an error deleting the member!", error);
        const msg = error?.response?.data?.message || "Failed to delete member";
        toast.error(msg);
      }
    }
  };

  const filterMember = (searchValue) => {
    if (searchValue !== "") {
      const filtered = allMembers.filter((customer) =>
        Object.keys(customer).some((key) =>
          String(customer[key])
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        )
      );
      setFilteredMember(filtered);
    } else {
      setFilteredMember(
        allMembers.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
      );
    }
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchValue(searchValue);
    filterMember(searchValue);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleAsks = (member) => {
    setSelectedActionMember(member);
    setShowAsksModal(true);
  };

  const handleGives = (member) => {
    setSelectedActionMember(member);
    setShowGivesModal(true);
  };

  const handleMatches = (member) => {
    setSelectedActionMember(member);
    setShowMatchesModal(true);
  };

  const handleRefMember = (member) => {
    setSelectedActionMember(member);
    setShowRefMemberModal(true);
  };

  const toggleMenu = (memberId) => {
    setOpenMenuId(openMenuId === memberId ? null : memberId);
  };

  const ActionMenu = ({ memberId, member, position = "right", isLastOrSecondLast = false }) => {
    return (
      <div
        className={`absolute ${
          isLastOrSecondLast ? "bottom-full mb-2" : "top-full mt-2"
        } ${
          position === "right" ? "right-0" : "left-0"
        } bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-max`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            handleAsks(member);
            setOpenMenuId(null);
          }}
          className="w-full px-4 py-2 text-left hover:bg-purple-50 text-purple-700 font-medium text-sm flex items-center gap-2 border-b border-gray-100"
        >
          ✦ Asks
        </button>

        <button
          onClick={() => {
            handleGives(member);
            setOpenMenuId(null);
          }}
          className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium text-sm flex items-center gap-2 border-b border-gray-100"
        >
          ✦ Gives
        </button>

        <button
          onClick={() => {
            handleMatches(member);
            setOpenMenuId(null);
          }}
          className="w-full px-4 py-2 text-left hover:bg-orange-50 text-orange-700 font-medium text-sm flex items-center gap-2 border-b border-gray-100"
        >
          ✦ Matches
        </button>

        <Link to={`/ref-member/${member?.refral_code}`} className="block">
          <button
            onClick={() => setOpenMenuId(null)}
            className="w-full px-4 py-2 text-left hover:bg-green-50 text-green-700 font-medium text-sm flex items-center gap-2 border-b border-gray-100"
            title={`${member?.referralCount || 0} referrals`}
          >
            <Gift size={16} /> 
            Ref Member 
            {member?.referralCount > 0 && (
              <span className="ml-auto bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {member?.referralCount}
              </span>
            )}
          </button>
        </Link>

        <button
          onClick={() => {
            handleViewDetails(member);
            setOpenMenuId(null);
          }}
          className="w-full px-4 py-2 text-left hover:bg-blue-50 text-blue-600 font-medium text-sm flex items-center gap-2 border-b border-gray-100"
        >
          <Eye size={16} /> View Details
        </button>

        <Link to={`/editMember/${member._id}`} className="block">
          <button
            className="w-full px-4 py-2 text-left hover:bg-blue-50 text-blue-600 font-medium text-sm flex items-center gap-2 border-b border-gray-100"
            onClick={() => setOpenMenuId(null)}
          >
            <Edit2 size={16} /> Edit
          </button>
        </Link>

        <button
          onClick={() => {
            handleDelete(member._id);
            setOpenMenuId(null);
          }}
          className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 font-medium text-sm flex items-center gap-2 rounded-b-lg"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    );
  };

  const MemberModal = ({ member, onClose }) => {
    if (!member) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
            <h2 className="text-white font-semibold text-lg">Member Details</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 rounded-full p-1 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <img
                src={`/api/image/download/${member.profileImg}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-blue-100"
              />
              <h3 className="mt-3 text-xl font-semibold text-gray-800">
                {member.name}
              </h3>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Mobile</p>
                  <p className="text-gray-800 font-medium">{member.mobile}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-800 font-medium">{member.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-gray-800 font-medium">
                    {member.city}, {member.country}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <Toaster />

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Members List
        </h1>

        {/* Search and Action Buttons */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search members..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />

          <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            <Link to="/pending-member" className="flex-1 md:flex-initial">
              <button className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                Pending Members
              </button>
            </Link>

            <Link to="/createCustomer" className="flex-1 md:flex-initial">
              <button className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                Add New Member
              </button>
            </Link>

            <button className="flex-1 md:flex-initial px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <th className="px-6 py-3 text-left font-semibold text-sm">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-sm">
                  Member Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-sm">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-center font-semibold text-sm">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {(searchValue.length > 0 ? filteredMember : member).map(
                (customer, index) => {
                  const visibleData = searchValue.length > 0 ? filteredMember : member;
                  const isLastOrSecondLast = index >= visibleData.length - 2;
                  return (
                    <tr
                      key={customer._id}
                      className="border-b border-gray-200 hover:bg-blue-50 transition"
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {customer.id}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 space-y-1">
                        <p className="flex items-center gap-2">
                          <Phone size={16} className="text-blue-600" />
                          {customer.mobile}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail size={16} className="text-blue-600" />
                          {customer.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={16} className="text-blue-600" />
                          {customer.country}, {customer.city}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center relative">
                          <button
                            onClick={() => toggleMenu(customer._id)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                            title="More actions"
                          >
                            <MoreVertical size={20} />
                          </button>
                          {openMenuId === customer._id && (
                            <ActionMenu 
                              memberId={customer._id} 
                              member={customer} 
                              position="right"
                              isLastOrSecondLast={isLastOrSecondLast}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {(searchValue.length > 0 ? filteredMember : member).map((customer, index) => {
          const visibleData = searchValue.length > 0 ? filteredMember : member;
          const isLastOrSecondLast = index >= visibleData.length - 2;
          return (
            <div
              key={customer._id}
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs text-gray-500 font-medium">ID #{customer.id}</p>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {customer.name}
                  </h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => toggleMenu(customer._id)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                    title="More actions"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {openMenuId === customer._id && (
                    <ActionMenu 
                      memberId={customer._id} 
                      member={customer} 
                      position="left"
                      isLastOrSecondLast={isLastOrSecondLast}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="flex items-center gap-2 text-gray-700">
                  <Phone size={16} className="text-blue-600 flex-shrink-0" />
                  {customer.mobile}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <Mail size={16} className="text-blue-600 flex-shrink-0" />
                  {customer.email}
                </p>
                <p className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-blue-600 flex-shrink-0" />
                  {customer.city}, {customer.country}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
        <button
          onClick={handlePreviousPage}
          disabled={pageIndex === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
        >
          ← Previous
        </button>

        <div className="px-4 py-2 bg-gray-200 rounded-lg text-gray-800 font-medium">
          Page <span className="font-bold">{pageIndex + 1}</span> of{" "}
          <span className="font-bold">{pageCount}</span>
        </div>

        <button
          onClick={handleNextPage}
          disabled={pageIndex + 1 >= pageCount}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
        >
          Next →
        </button>
      </div>

      {/* Hidden table for Excel export */}
      <table id="table-to-xls" className="hidden">
        <thead>
          <tr>
            <th>ID</th>
            <th>Member Name</th>
            <th>Mobile</th>
            <th>Email</th>
            <th>Country</th>
            <th>City</th>
          </tr>
        </thead>
        <tbody>
          {(searchValue.length > 0 ? filteredMember : member).map(
            (customer) => (
              <tr key={customer._id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.mobile}</td>
                <td>{customer.email}</td>
                <td>{customer.country}</td>
                <td>{customer.city}</td>
              </tr>
            )
          )}
        </tbody>
      </table>

      {/* Modals for action buttons */}
      {showAsksModal && (
        <ActionMenu
          title="Asks"
          member={selectedActionMember}
          onClose={() => setShowAsksModal(false)}
        />
      )}

      {showGivesModal && (
        <ActionMenu
          title="Gives"
          member={selectedActionMember}
          onClose={() => setShowGivesModal(false)}
        />
      )}

      {showMatchesModal && (
        <ActionMenu
          title="Matches"
          member={selectedActionMember}
          onClose={() => setShowMatchesModal(false)}
        />
      )}

      {/* Ref Member Modal */}
      {showRefMemberModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-white font-semibold text-lg">Referral Members</h2>
              <button
                onClick={() => setShowRefMemberModal(false)}
                className="text-white hover:bg-green-800 rounded-full p-1 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <h3 className="mt-3 text-xl font-semibold text-gray-800">
                  {selectedActionMember?.name}'s Referrals
                </h3>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                {/* Display referral members here */}
              </div>
            </div>

            <button
              onClick={() => setShowRefMemberModal(false)}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <MemberModal member={selectedMember} onClose={closeModal} />
      )}
    </div>
  );
};

export default MemberList;
