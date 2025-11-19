import React, { useState, useEffect } from "react";
import axios from "axios";
import countryList from "country-list";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";

const CityForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    countryName: "",
  });
  const [countryOptions, setCountryOptions] = useState([]);
  const navigate = useNavigate();
  
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  // Fetch country data on component mount
  useEffect(() => {
    const countries = countryList.getData();
    const formattedCountries = countries.map((country) => ({
      value: country.code,
      label: country.name,
    }));
    setCountryOptions(formattedCountries);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCountryChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      countryName: selectedOption.label,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.countryName.trim()) {
      toast.error("Both country and city name are required.");
      return;
    }

    const loadingToast = toast.loading("Saving city...");

    try {
      const token = getCookie("token");
      await axios.post("/api/city/addCity", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      toast.success("City added successfully!", { id: loadingToast });

      setTimeout(() => {
        navigate("/cities");
      }, 1500); // Delay navigation to allow user to see the success message
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to add city. Please try again.";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full p-2 rounded-md">
        <nav>
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
            Dashboard /
          </Link>
          <Link to="/cities" className="mr-2 text-gray-400 hover:text-gray-500">
            Cities /
          </Link>
          <span className="font-semibold text-gray-600">Insert City</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Create City</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Select Country
            </label>
            <Select
              options={countryOptions}
              onChange={handleCountryChange}
              value={countryOptions.find(
                (option) => option.label === formData.countryName
              )}
              className="w-1/2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              City Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-1/2 p-2 border rounded focus:outline-none focus:border-blue-500"
              placeholder="Enter city name"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 font-medium rounded hover:shadow-lg shadow-md border border-gray-300 transition duration-300"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default CityForm;
