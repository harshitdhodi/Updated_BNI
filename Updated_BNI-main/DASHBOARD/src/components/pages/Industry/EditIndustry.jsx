import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const EditIndustry = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchIndustry();
  }, [id]);

  const fetchIndustry = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/industry/getIndustryById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const { name } = response.data;
      setName(name);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Industry name cannot be empty.");
      return;
    }

    const loadingToast = toast.loading("Updating industry...");
    const industryData = { name };

    try {
      const token = getCookie("token");
      await axios.put(`/api/industry/updateIndustry?id=${id}`, industryData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Industry updated successfully!", { id: loadingToast });
      setTimeout(() => {
        navigate("/industryList");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update industry.";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
            Dashboard /
          </Link>
          <Link
            to="/industryList"
            className="mr-2 text-gray-400 hover:text-gray-500"
          >
            Industries /
          </Link>
          <span className="font-semibold text-gray-600"> Edit Industry</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit Industry</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block font-semibold mb-2">
              Industry Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-1/2 p-2 border rounded focus:outline-none focus:border-red-500"
              required
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

export default EditIndustry;
