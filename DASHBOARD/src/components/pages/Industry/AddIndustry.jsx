import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const CreateIndustry = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const industryData = { name };

    try {
      const token = getCookie("token");
      const response = await axios.post("/api/industry/addIndustry", industryData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      const { industry, message } = response.data; // Destructure industry and message from response.data

      console.log(industry); // Log the returned industry object

      navigate("/industryList");
    } catch (error) {
      console.error(
        "Failed to create industry:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-500">
            Dashboard /
          </Link>
          <Link
            to="/industryList"
            className="mr-2 text-red-300 hover:text-red-500"
          >
            Industries /
          </Link>
          <span className="font-semibold text-red-500"> Insert Industry</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Create Industry</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Industry Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
              minLength={2}
              maxLength={25}
             
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

export default CreateIndustry;
