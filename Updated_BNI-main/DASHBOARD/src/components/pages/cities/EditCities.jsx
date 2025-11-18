import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import countryList from "country-list";
const EditCity = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [countryName, setCountryName] = useState("");
  const [countryOptions, setCountryOptions] = useState([]);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchCity();
    fetchCountryOptions();
  }, [id]);

  const fetchCity = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/city/getCityById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const { name, countryName } = response.data;
      console.log(response.data);

      console.log(name);
      setName(name);
      setCountryName(countryName); // Pre-fill country name for editing
    } catch (error) {
      console.error("Error fetching city:", error);
    }
  };

  const fetchCountryOptions = () => {
    // Use country-list or any other method to fetch countries
    const countries = countryList.getData();
    const formattedCountries = countries.map((country) => ({
      value: country.code,
      label: country.name,
    }));
    setCountryOptions(formattedCountries);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
    } else if (name === "countryName") {
      setCountryName(value);
    }
  };

  const handleCountryChange = (selectedOption) => {
    setCountryName(selectedOption.label);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cityData = { name, countryName };

    try {
      if (id) {
        const token = getCookie("token");
        // Update existing city
        await axios.put(`/api/city/updateCity?id=${id}`, cityData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
      } else {
        // Create new city
        await axios.post("/api/city/addCity", cityData);
      }
      setName("");
      setCountryName("");
      navigate("/cities");
    } catch (error) {
      console.error(
        "Failed to save city:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-600">
            Dashboard /
          </Link>
          <Link to="/cities" className="mr-2 text-gray-400 hover:text-gray-600">
            {" "}
            Cities /
          </Link>
          <span className="font-bold text-gray-600">
            {id ? "Edit City" : "Insert City"}
          </span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">
          {id ? "Edit City" : "Create City"}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Select Country
            </label>
            <Select
              options={countryOptions}
              onChange={handleCountryChange}
              value={countryOptions.find(
                (option) => option.label === countryName
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
              value={name}
              onChange={handleInputChange}
              className="w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
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

export default EditCity;
