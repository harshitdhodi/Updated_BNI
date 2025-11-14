import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { countries } from "countries-list"; // Use named import for countries

const CreateCountry = () => {
  const [name, setName] = useState("");
  const [photo, setphoto] = useState([]);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  // Extract countries into an array of objects suitable for react-select
  const countryOptions = Object.keys(countries).map((countryCode) => ({
    value: countryCode,
    label: countries[countryCode].name,
  }));

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setphoto([...photo, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    photo.forEach((image) => {
      formData.append("photo", image);
    });

    try {
      const token = getCookie("token");
      const response = await axios.post("/api/country/addCountry", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },     withCredentials: true,
      });

      console.log("Country created successfully:", response.data);

      navigate("/country");
    } catch (error) {
      console.error(
        "Failed to create country:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div className="w-full p-2 rounded-md">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-500">
            Dashboard /
          </Link>
          <Link to="/country" className="mr-2 text-red-300 hover:text-red-500">
            Countries /
          </Link>
          <span className="font-semibold text-red-500">Insert Country</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Create Country</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Country Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Select Country
            </label>
            <Select
              options={countryOptions}
              onChange={(selectedOption) => setName(selectedOption.label)}
              className="w-1/2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Upload photo
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="border rounded-md p-2 focus:outline-none bg-white w-1/2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#CF2030] text-white rounded hover:bg-red-900 transition duration-300"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateCountry;
