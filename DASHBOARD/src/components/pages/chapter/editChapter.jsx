import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { TextField, Autocomplete, Button } from "@mui/material";
import { Country, City } from "country-state-city";

const EditChapter = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchChapter();
  }, [id]);

  const fetchChapter = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/chapter/getchapterById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const { name, countryName, city } = response.data;

      setName(name);
      setCountry({ name: countryName }); // Pre-fill country object with name
      setCity(city);

      // Fetch all countries and find the selected country by name
      const allCountries = Country.getAllCountries();
      const selectedCountry = allCountries.find((c) => c.name === countryName);

      // Fetch cities for the pre-selected country
      if (selectedCountry) {
        const citiesOfCountry = City.getCitiesOfCountry(
          selectedCountry.isoCode
        );
        setCities(citiesOfCountry.map((city) => city.name));
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
    }
  };

  useEffect(() => {
    // Fetch cities based on selected country
    const fetchCities = async () => {
      if (country) {
        const countryInfo = Country.getCountryByCode(country.isoCode);
        if (countryInfo) {
          const citiesOfCountry = City.getCitiesOfCountry(countryInfo.isoCode);
          setCities(citiesOfCountry.map((city) => city.name));
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [country]);

  const handleCountryChange = (event, value) => {
    setCountry(value);
    setCity(null); // Reset city selection when country changes

    // Fetch all cities for the selected country
    if (value) {
      const countryInfo = Country.getCountryByCode(value.isoCode);
      if (countryInfo) {
        const citiesOfCountry = City.getCitiesOfCountry(countryInfo.isoCode);
        setCities(citiesOfCountry.map((city) => city.name));
      }
    } else {
      setCities([]);
    }
  };

  const handleCityChange = (event, value) => {
    setCity(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const chapterData = {
      id,
      name,
      countryName: country?.name,
      city,
    };

    try {
      const token = getCookie("token");
      await axios.put(`/api/chapter/updateChapter?id=${id}`, chapterData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setName("");
      setCountry(null);
      setCity(null);
      navigate("/ChapterList");
    } catch (error) {
      console.error(
        "Failed to update chapter:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Fetch all countries with their short codes
  const countryData = Country.getAllCountries().map((country) => ({
    isoCode: country.isoCode,
    name: `${country.name} (${country.isoCode})`,
  }));

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-500">
            Dashboard /
          </Link>
          <Link
            to="/ChapterList"
            className="mr-2 text-red-300 hover:text-red-500"
          >
            {" "}
            Chapters /
          </Link>
          <span className="font-semibold text-red-500"> Edit Chapter</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit Chapter</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Country
            </label>
            <Autocomplete
              options={countryData}
              getOptionLabel={(option) => option.name}
              value={country}
              onChange={handleCountryChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Country"
                  className="w-1/2"
                  required
                />
              )}
            />
          </div>
          {country && (
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">City</label>
              <Autocomplete
                options={cities}
                value={city}
                onChange={handleCityChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select City"
                    className="w-1/2"
                    required
                  />
                )}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Chapter name
            </label>
            <TextField
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-1/2"
              required
            />
          </div>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </form>
      </div>
    </>
  );
};

export default EditChapter;
