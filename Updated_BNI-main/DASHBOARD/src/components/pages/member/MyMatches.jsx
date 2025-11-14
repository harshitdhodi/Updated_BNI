import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";

const MyMatches = () => {
  const [matches, setMatches] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 5;
  const { userId, companyName, dept } = useParams(); // Ensure useParams includes userId, companyName, and dept
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchMatches();
  }, [pageIndex, userId, companyName, dept]);

  const fetchMatches = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/myGives/getMyMatches?companyName=${encodeURIComponent(
          companyName
        )}&dept=${encodeURIComponent(dept)}&page=${pageIndex + 1}`,
        {  headers: {
          Authorization: `Bearer ${token}`,
        },withCredentials: true }
      );

      console.log("My Matches Response:", response.data);

      if (response.data && response.data.data) {
        const dataWithIds = response.data.data.map((match, index) => ({
          ...match,
          id: pageIndex * pageSize + index + 1,
        }));
        setMatches(dataWithIds);
        setPageCount(Math.ceil(response.data.total / pageSize));
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching Matches:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getCookie("token");
      await axios.delete(`/api/match2/deleteMatchById?id=${id}` ,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      fetchMatches(); // Refresh matches after deletion
    } catch (error) {
      console.error("Error deleting Match:", error);
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

  return (
    <div className="p-4 overflow-x-auto">
      <h1 className="text-xl font-bold mb-3 ml-2">Matches List</h1>
      <nav className="mb-4">
        <Link to="/" className="mr-2 text-red-300 hover:text-red-500">
          Dashboard /
        </Link>
        <Link to="/memberList" className="mr-2 text-red-300 hover:text-red-500">
          MemberList /
        </Link>
        <Link className="font-semibold text-red-500"> My Matches</Link>
      </nav>

      <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
        <thead>
          <tr className="bg-[#CF2030] text-white text-left uppercase font-serif text-[14px]">
            <th className="py-2 px-4">ID</th>
            <th className="py-2 px-4">Company Info</th>
            <th className="py-2 px-4">User Info</th>
            {/* <th className="py-2 px-4">Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {matches.map((match) => (
            <tr
              key={match._id}
              className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
            >
              <td className="py-2 px-4">{match.id}</td>
              <td className="py-2 px-4">
                <strong>Name:</strong> {match.companyName}
                <br />
                <strong>Email:</strong> {match.email}
                <br />
                <strong>Department:</strong> {match.dept}
                <br />
                <strong>Phone Number:</strong> {match.phoneNumber}
                <br />
                <strong>Web URL:</strong>{" "}
                <a
                  href={match.webURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {match.webURL}
                </a>
              </td>
              <td className="py-2 px-4">
                <strong>Name:</strong> {match.user.name}
                <br />
                <strong>Email:</strong> {match.user.email}
              </td>
              {/* <td className="py-2 px-4">
                <div className="flex py-1 px-4 items-center space-x-2">
                  <button>
                    <Link to={`/editMatch/${match._id}`}>
                      <FaEdit className="text-blue-500 text-lg" />
                    </Link>
                  </button>
                  <button onClick={() => handleDelete(match._id)}>
                    <FaTrashAlt className="text-red-500 text-lg" />
                  </button>
                </div>
              </td> */}
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
    </div>
  );
};

export default MyMatches;
