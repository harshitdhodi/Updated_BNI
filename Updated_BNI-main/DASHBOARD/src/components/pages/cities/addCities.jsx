import React, { useState, useEffect } from "react";
import axios from "axios";
import countryList from "country-list";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";

const CityForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    countryName: "",
    cityName: "",
  });
  const [countryOptions, setCountryOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
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

  // Fetch cities based on selected country
  useEffect(() => {
    const fetchCities = async (countryName) => {
      if (countryName) {
        try {
          const token = getCookie("token");
          const response = await axios.get(
            `/api/city/getAllCity?countryName=${countryName}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
          const cityData = response.data.data;
          const formattedCities = cityData.map((city) => ({
            value: city.name,
            label: city.name,
          }));
          setCityOptions(formattedCities);
        } catch (error) {
          console.error(
            "Failed to fetch cities:",
            error.response ? error.response.data : error.message
          );
        }
      } else {
        setCityOptions([]);
      }
    };

    if (formData.countryName) {
      fetchCities(formData.countryName);
    }
  }, [formData.countryName]);

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

  const handleCityChange = (selectedOption) => {
    setFormData((prevData) => ({
      ...prevData,
      cityName: selectedOption.label,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/city/addCity", formData);
      console.log("City added successfully:", response.data);
      // Redirect to city list page after successful submission
      navigate("/cities");
    } catch (error) {
      console.error("Error adding city:", error);
    }
  };

  return (
    <>
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
              Select City
            </label>
            <Select
              options={cityOptions}
              onChange={handleCityChange}
              value={cityOptions.find(
                (option) => option.label === formData.cityName
              )}
              className="w-1/2"
              isDisabled={!formData.countryName} // Disable if no country is selected
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
