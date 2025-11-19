import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const CreateIndustry = () => {
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const loadingToast = toast.loading("Creating industry...");

    const industryData = { name };

    try {
      const token = getCookie("token");
      await axios.post("/api/industry/addIndustry", industryData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      toast.success("Industry created successfully!", { id: loadingToast });
      setTimeout(() => {
      navigate("/industryList");
      }, 1500);
    } catch (error) {
       const errorMessage =
        error.response?.data?.message || "Failed to create industry.";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  const validate = () => {
    const newErrors = {};
    const nameTrimmed = name.trim();
    const invalidCharPattern = /[<>"'{}]/g; // Block potentially harmful characters

    if (!nameTrimmed) {
      newErrors.name = "Industry name is required.";
    } else if (nameTrimmed.length < 2 || nameTrimmed.length > 100) {
      newErrors.name = "Industry name must be between 2 and 100 characters.";
    } else if (invalidCharPattern.test(nameTrimmed)) {
      newErrors.name = "Industry name contains invalid characters (e.g., <, >, {, }).";
    } else if (/^\d+$/.test(nameTrimmed)) {
      newErrors.name = "Industry name cannot be only numbers.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
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
          <span className="font-semibold text-gray-600"> Insert Industry</span>
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
              className={`w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
