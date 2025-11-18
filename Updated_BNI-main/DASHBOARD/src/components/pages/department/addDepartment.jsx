import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
const CreateDepartment = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const departmentData = { name };

    try {
      const token = getCookie("token");
      const response = await axios.post(
        "/api/department/addDepartment",
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const { department, message } = response.data; // Destructure department and message from response.data

      console.log(department); // Log the returned department object
      setMessage(message); // Set the message state
      toast.success(message); // Show success toast
      navigate("/departmentList");
    } catch (error) {
      console.error(
        "Failed to create department:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div className="w-full  p-2">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-500">
            Dashboard /
          </Link>
          <Link
            to="/departmentList"
            className="mr-2 text-red-300 hover:text-red-500"
          >
            {" "}
            Departments /
          </Link>
          <Link className="font-semibold text-red-500"> Insert Department</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Create Department</h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}{" "}
        {/* Display message if available */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Department Name <span className="text-red-500">*</span>  
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
              minLength={2}
              maxLength={20}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateDepartment;
