/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import { BsFillTelephoneFill } from "react-icons/bs";
import { MdEmail, MdPlace } from "react-icons/md";
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import Badge from "@mui/material/Badge";
import Swal from "sweetalert2";
const MemberList = () => {
  const [member, setMember] = useState([]);
  const [filteredMember, setFilteredMember] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [cache, setCache] = useState({});
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
    if (cache[pageIndex]) {
      setMember(cache[pageIndex].data);
      setPageCount(cache[pageIndex].pageCount);
    } else {
      fetchMember();
    }
  }, [pageIndex]);

  useEffect(() => {
    filterMember(searchValue);
  }, [member, searchValue]);

  const fetchMember = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/member/getApprovedMember`,
        { 
          headers: {
          Authorization: `Bearer ${token}`,
        },withCredentials: true }
      );
      const dataWithIds = response.data.data.map((customer, index) => ({
        ...customer,
        id: pageIndex * pageSize + index + 1,
      }));
      setMember(dataWithIds);
      setPageCount(Math.ceil(response.data.total / pageSize));
      setCache((prevCache) => ({
        ...prevCache,
        [pageIndex]: {
          data: dataWithIds,
          pageCount: Math.ceil(response.data.total / pageSize),
        },
      }));
    } catch (error) {
      console.error("There was an error fetching the members!", error);
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
  

  const filterMember = (searchValue) => {
    if (searchValue !== "") {
      const filtered = member.filter((customer) =>
        Object.keys(customer).some((key) =>
          String(customer[key])
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        )
      );
      setFilteredMember(filtered);
    } else {
      setFilteredMember(member);
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
  console.log("object", member);
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
    <div className="p-4  ">
      <div className="lg:flex flex-wrap justify-between items-center mb-4 ">
        <h1 className="text-xl font-bold mb-3 ml-2 ">Members List</h1>
        <div>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="p-2 border border-gray-300 rounded mr-3"
          />
          <button className="px-4 py-2 mr-3 mt-3 bg-[#CF2030] text-white rounded hover:bg-red-600 transition duration-300">
            <Link to="/pending-member">Pending Members</Link>
          </button>
          <button className="px-4 py-2 mt-3 bg-[#CF2030] text-white rounded hover:bg-red-600 transition duration-300">
            <Link to="/createCustomer">Add New Members</Link>
          </button>
          <button className="px-4 py-2 sm:ml-3 mt-3 bg-[#0fc29e] text-white rounded hover:bg-slate-900 transition duration-300">
            <ReactHTMLTableToExcel
              id="test-table-xls-button"
              className="btn btn-success "
              table="table-to-xls"
              filename="members_list"
              sheet="members_list"
              buttonText="Export to Excel"
            />
          </button>
        </div>
      </div>

      {/* Table for UI */}
      <div className="w-full overflow-x-auto  mt-4 shadow-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#CF2030] text-white text-left font-serif text-[14px]">
              <th className="py-2 px-4 lg:px-6">ID</th>
              <th className="py-2 px-4 lg:px-6">Member Name</th>
              {/* <th className="py-2 px-4 lg:px-6">Chapter</th> */}
              <th className="py-2 px-4 lg:px-6 text-center">Info</th>
              {/* <th className="py-2 px-4 lg:px-6 w-[10px]">Keyword</th> */}
              <th className="py-2 px-4 lg:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(searchValue.length > 0 ? filteredMember : member).map(
              (customer) => (
                <tr
                  key={customer._id}
                  className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                  <td className="py-2 px-4 lg:px-6">{customer.id}</td>
                  <td className="py-2 px-4 lg:px-6">{customer.name}</td>
                  {/* <td className="py-2 px-4 lg:px-6">{customer.chapter}</td> */}
                  <td className="py-2 px-4 lg:px-6">
                    <div>
                      <p className="flex items-center gap-1 ">
                        <BsFillTelephoneFill className="text-gray-600" />
                        {customer.mobile}
                      </p>
                      <p className="flex items-center gap-1">
                        <MdEmail className="text-gray-600" /> {customer.email}
                      </p>
                      <p className="flex items-center gap-1">
                        <MdPlace className="text-gray-600" />{" "}
                        <span>{customer.country}, </span>
                        <span>{customer.city}</span>
                      </p>
                    </div>
                  </td>
                  {/* <td className="py-2 px-4 lg:px-6 w-[10px]">
                    {Array.isArray(customer.keyword)
                      ? customer.keyword.join(", ")
                      : customer.keyword}
                  </td> */}
                  <td className="py-2 px-4 lg:px-6">
                    <div className="flex flex-wrap py-1 px-2 lg:px-4 items-center gap-x-2">
                      <FaEye
                        onClick={() => handleViewDetails(customer)}
                        className="text-green-700"
                      />
                      {/* <button
                        onClick={() => handleViewDetails(customer)}
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                      >
                        View More
                      </button> */}
                      <button>
                        <Link to={`/editMember/${customer._id}`}>
                          <FaEdit className="text-blue-500 text-lg" />
                        </Link>
                      </button>
                      <button onClick={() => handleDelete(customer._id)}>
                        <FaTrashAlt className="text-red-500 text-lg" />
                      </button>
                      <Badge
                        badgeContent={customer?.referralCount || 0}
                        color="primary"
                        className="mr-3"
                      >
                        <Link to={`/ref-member/${customer?.refral_code}`}>
                          <button className="bg-green-500 mt-2 mb-1 lg:mt-0 lg:w-full w-[2cm] flex justify-center items-center gap-2 text-white px-2 py-1 rounded hover:bg-green-700 transition">
                            {/* <FaGift className="text-lg" /> */}
                            <p>Ref Member</p>
                          </button>
                        </Link>
                      </Badge>

                      <Link to={`/myGives/${customer._id}`}>
                        <button className="bg-green-500 mt-2 mb-1 lg:mt-0 lg:w-full w-[2cm] flex justify-center items-center gap-2 text-white px-2 py-1 rounded hover:bg-green-700 transition">
                          {/* <FaGift className="text-lg" /> */}
                          <p>Gives</p>
                        </button>
                      </Link>
                      <Link to={`/myAsks/${customer._id}`}>
                        <button className="bg-red-600 w-[2cm] flex mb-1 lg:w-full justify-center gap-2 items-center text-white px-2 py-1 rounded hover:bg-red-700 transition">
                          {/* <FaQuestionCircle className="text-lg" /> */}
                          <p>Asks</p>
                        </button>
                      </Link>
                      <Link to={`/myMatches/${customer._id}`}>
                        <button className="bg-yellow-500 flex mb-1 justify-center gap-2 items-center text-white px-2 py-1 rounded hover:bg-yellow-700 transition">
                          {/* <FaEdit className="text-lg" /> */}
                          <p>Matches</p>
                        </button>
                      </Link>
                      <Link to={`/myBusiness/${customer._id}`}>
                        <button className="bg-blue-500 flex justify-center gap-2 items-center text-white px-2 py-1 rounded hover:bg-blue-700 transition">
                          {/* <FaEdit className="text-lg" /> */}
                          <p>Business</p>
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Table for Excel Export */}
      <table id="table-to-xls" className="hidden">
        <thead>
          <tr>
            <th>ID</th>
            <th>Member Name</th>
            <th>Chapter</th>
            <th>Info</th>
            {/* <th>Keyword</th> */}
          </tr>
        </thead>
        <tbody>
          {(searchValue.length > 0 ? filteredMember : member).map(
            (customer) => (
              <tr key={customer._id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                {/* <td>{customer.chapter}</td> */}
                <td>
                  {`${customer.mobile}, ${customer.email}, ${customer.country}, ${customer.city}`}
                </td>
                {/* <td>
                  {Array.isArray(customer.keyword)
                    ? customer.keyword.join(", ")
                    : customer.keyword}
                </td> */}
              </tr>
            )
          )}
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

      {showModal && (
        <MemberModal member={selectedMember} onClose={closeModal} />
      )}
    </div>
  );
};

export default MemberList;
