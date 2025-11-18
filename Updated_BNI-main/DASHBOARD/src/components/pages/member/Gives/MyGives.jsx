import  { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import Swal from 'sweetalert2';
const MyGivesList = () => {
  const [myGives, setMyGives] = useState([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageSize = 5;

  // Accessing userId from route parameters using useParams
  const { userId } = useParams();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchMyGives();
  }, [pageIndex, userId]); // Fetch data when pageIndex or userId changes

  const fetchMyGives = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/myGives/getMyGives?userId=${userId}&page=${pageIndex + 1}`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },withCredentials: true }
      );

      console.log("My Gives Response:", response.data); // Check response data structure

      // Normalize response shape to handle: { data: [...], total, currentPage } etc.
      const resp = response.data || {};
      const items = Array.isArray(resp.data) ? resp.data : Array.isArray(resp) ? resp : [];
      const currentPage = resp.currentPage ?? resp.page ?? (pageIndex + 1);
      const total = resp.total ?? items.length;

      if (Array.isArray(items)) {
        const dataWithIds = items.map((myGive, index) => ({
          ...myGive,
          id: (currentPage - 1) * pageSize + index + 1,
        }));
        setMyGives(dataWithIds);

        // Calculate pageCount based on the total count (fallback to items length)
        setPageCount(Math.max(1, Math.ceil(total / pageSize)));

        // If data on the last page is deleted and becomes empty, adjust pageIndex
        if (pageIndex > 0 && items.length === 0) {
          setPageIndex(pageIndex - 1);
        }
      } else {
        console.error("Unexpected response structure:", response.data);
      }
    } catch (error) {
      console.error("Error fetching My Gives:", error);
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
            await axios.delete(`/api/myGives/deletemyGivesById?id=${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            // Show success alert
            Swal.fire({
                title: 'Deleted!',
                text: 'Your give has been deleted.',
                icon: 'success',
                confirmButtonText: 'Ok',
            });

            // Fetch data again after deletion
            fetchMyGives(); 
        } catch (error) {
            console.error("Error deleting My Gives:", error);
            // Show error alert
            Swal.fire({
                title: 'Error!',
                text: 'There was a problem deleting your give.',
                icon: 'error',
                confirmButtonText: 'Ok',
            });
        }
    }
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
        <Link className="font-semibold text-red-500">My Gives</Link>
      </nav>
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h1 className="text-xl font-bold mb-3 ml-2">My Gives List</h1>
        <button className="px-4 py-2 mt-3 bg-[#CF2030] text-white rounded transition duration-300">
          <Link to={`/createMyGives/${userId}`}>Add New My Give</Link>
        </button>
      </div>

      {myGives.length > 0 ? (
        <>
          <table className="w-full mt-4 border-collapse shadow-lg overflow-x-scroll">
            <thead>
              <tr className="bg-[#CF2030] text-white text-left uppercase font-serif text-[14px]">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Company Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Department</th>
                <th className="py-2 px-4">Phone Number</th>
                <th className="py-2 px-4">Web URL</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myGives.map((myGive) => (
                <tr
                  key={myGive._id}
                  className="bg-gray-50 border-b border-gray-300 hover:bg-gray-100 transition duration-150"
                >
                  <td className="py-2 px-4">{myGive.id}</td>
                  <td className="py-2 px-4">{myGive.companyName}</td>
                  <td className="py-2 px-4">{myGive.email}</td>
                  <td className="py-2 px-4">{myGive.dept?.name || myGive.dept}</td>
                  <td className="py-2 px-4">{myGive.phoneNumber}</td>
                  <td className="py-2 px-4">{myGive.webURL}</td>
                  <td className="py-2 px-4">
                    <div className="flex py-1 px-4 items-center space-x-2">
                      <button>
                        <Link to={`/editMyGives/${userId}/${myGive._id}`}>
                          <FaEdit className="text-blue-500 text-lg" />
                        </Link>
                      </button>
                      <button onClick={() => handleDelete(myGive._id)}>
                        <FaTrashAlt className="text-red-500 text-lg" />
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
        <div className="text-center text-gray-500 mt-4">No My Gives found.</div>
      )}
    </div>
  );
};

export default MyGivesList;
