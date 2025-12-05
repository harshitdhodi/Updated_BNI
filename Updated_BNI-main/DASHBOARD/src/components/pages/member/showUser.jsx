import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, Phone, Mail, MapPin, Download, MoreVertical, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [showRefMemberModal, setShowRefMemberModal] = useState(false);
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

  const handleApprovalChange = async (memberId, currentStatus) => {
    const newStatus = currentStatus === "approved" ? "pending" : "approved";
    const toastId = toast.loading(`Updating status to ${newStatus}...`);

    try {
      const token = getCookie("token");
      await axios.put(
        `/api/member/updatememberById?id=${memberId}`,
        { approvedByadmin: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // Update local state for immediate UI feedback
      setAllMembers(prevMembers =>
        prevMembers.map(m => (m._id === memberId ? { ...m, approvedByadmin: newStatus } : m))
      );

      toast.success("Approval status updated successfully!", { id: toastId });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status.", { id: toastId });
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
        } bg-white rounded-xl shadow-2xl border border-gray-100 z-50 min-w-[200px] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-2">
          {/* Asks */}
          <Link
            to={`/myAsks/${member._id}`}
            onClick={() => setOpenMenuId(null)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 group-hover:bg-purple-200 flex items-center justify-center transition-colors">
              <span className="text-purple-600 font-bold text-sm">✦</span>
            </div>
            <span className="font-medium text-sm">Asks</span>
          </Link>

          {/* Gives */}
          <Link
            to={`/myGives/${member._id}`}
            onClick={() => setOpenMenuId(null)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 text-gray-700 hover:text-green-700 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
              <span className="text-green-600 font-bold text-sm">✦</span>
            </div>
            <span className="font-medium text-sm">Gives</span>
          </Link>

          {/* Business */}
          <Link
            to={`/business/${member._id}`}
            onClick={() => setOpenMenuId(null)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-yellow-50 text-gray-700 hover:text-yellow-700 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-yellow-100 group-hover:bg-yellow-200 flex items-center justify-center transition-colors">
              <span className="text-yellow-600 font-bold text-sm">✦</span>
            </div>
            <span className="font-medium text-sm">Business</span>
          </Link>

          {/* Matches */}
          <Link
            to={`/myMatches/${member._id}`}
            onClick={() => setOpenMenuId(null)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-gray-700 hover:text-orange-700 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-colors">
              <span className="text-orange-600 font-bold text-sm">✦</span>
            </div>
            <span className="font-medium text-sm">Matches</span>
          </Link>

          {/* Divider */}
          <div className="my-2 border-t border-gray-100"></div>

          {/* Ref Member */}
          <Link 
            to={`/ref-member/${member?.refral_code}`}
            onClick={() => setOpenMenuId(null)}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-all duration-150 group"
            title={`${member?.referralCount || 0} referrals`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center transition-colors">
              <Gift size={16} className="text-emerald-600" />
            </div>
            <span className="font-medium text-sm flex-1">Ref Member</span>
            {member?.referralCount > 0 && (
              <span className="bg-emerald-600 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold shadow-sm">
                {member?.referralCount}
              </span>
            )}
          </Link>

          {/* View Details */}
          <button
            onClick={() => {
              handleViewDetails(member);
              setOpenMenuId(null);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
              <Eye size={16} className="text-blue-600" />
            </div>
            <span className="font-medium text-sm">View Details</span>
          </button>
        </div>
      </div>
    );
  };

  const MemberModal = ({ member, onClose }) => {
    if (!member) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="sticky top-0 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 text-left text-sm uppercase tracking-wider px-6 py-4 flex justify-between items-center">
            <h2 className="font-semibold text-lg">Member Details</h2>
            <button
              onClick={onClose}
              className="hover:bg-blue-800 rounded-full p-1 transition"
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
              className="w-full mt-6 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 hover:bg-blue-600 font-medium py-2 px-4 rounded-lg transition"  
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
        <div className="flex flex-col w-full gap-3  md:flex-row md:items-center justify-between">
        <div>
            <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search members..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
        </div>

          <div className="flex flex-col gap-2 md:flex-row md:gap-3">
            {/* <Link to="/pending-member" className="flex-1 md:flex-initial">
              <button className="w-full md:w-auto px-4 py-2 bg-gray-100 text-black shadow-lg hover:shadow-xl border border-gray-200 rounded-lg font-medium transition">
                Pending Members
              </button>
            </Link> */}

            <Link to="/createCustomer" className="flex-1 md:flex-initial">
              <button className="w-full md:w-auto px-4 py-2 bg-gray-100 text-black shadow-lg hover:shadow-xl border border-gray-200 rounded-lg font-medium transition">
                Add New Member
              </button>
            </Link>

          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md"> {/* Removed overflow-hidden */}
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gradient-to-r from-blue-200 to-blue-100 text-black text-lg">
              <th className="px-6 py-3 text-left font-semibold text-sm">ID</th>
              <th className="px-6 py-3 text-left font-semibold text-sm">
                Member Name
              </th>
              <th className="px-6 py-3 text-left font-semibold text-sm">
                Contact Info
              </th>
              <th className="px-6 py-3 text-center font-semibold text-sm">
                Admin Approval
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
                // For the last two items on the page, open the menu upwards.
                // This should only happen if there are more than 3 items on the page.
                const openUpwards = visibleData.length > 3 && index >= visibleData.length - 2;

                return (
                  <tr
                    key={customer._id}
                    className="border-b border-gray-200 hover:bg-blue-50 transition"
                  >
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {customer.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                      
                        <div className="">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500"> <span className="text-gray-700 ">Referral Code:</span> {customer.refral_code}</div>
                        </div>
                      </div>
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
                    <td className="px-6 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customer.approvedByadmin === 'approved'}
                          onChange={() => handleApprovalChange(customer._id, customer.approvedByadmin)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 sr-only">
                          Admin Approval
                        </span>
                      </label>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1 relative">
                        <Link
                          to={`/editMember/${customer._id}`}
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => toggleMenu(customer._id)}
                          className="p-2 hover:bg-blue-100 z-0 rounded-lg transition text-blue-600"
                          title="More actions"
                        >
                          <MoreVertical size={20} />
                        </button>
                        {openMenuId === customer._id && (
                          <ActionMenu 
                            memberId={customer._id} 
                            member={customer} 
                            position="right"
                            isLastOrSecondLast={openUpwards}
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {(searchValue.length > 0 ? filteredMember : member).map((customer, index) => {
          const visibleData = searchValue.length > 0 ? filteredMember : member;
          // If there are more than 3 items, open the menu upwards for the last two.
          const openUpwards = visibleData.length > 3 && index >= visibleData.length - 2;

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
                <div className="relative flex items-center">
                  <Link
                    to={`/editMember/${customer._id}`}
                    className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(customer._id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
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
                      isLastOrSecondLast={openUpwards}
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
      <div className="mt-8 flex justify-between items-center bg-white px-4 py-3 rounded-lg shadow-md">
        <div className="text-sm text-gray-700">
          Page <span className="font-bold text-gray-900">{pageIndex + 1}</span> of <span className="font-bold text-gray-900">{pageCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousPage}
            disabled={pageIndex === 0}
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>

          <button
            onClick={handleNextPage}
            disabled={pageIndex + 1 >= pageCount}
            className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
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
                <h3 className="mt-3 text-xl font-semibold text-gray-800">Referrals</h3>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                {/* Display referral members here */}
              </div>
            </div>

            <button
              onClick={() => setShowRefMemberModal(false)}
              className="w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition"
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
