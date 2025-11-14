import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { TextField, Autocomplete, Button } from "@mui/material";
import { Country } from "country-state-city";

const CreateChapter = () => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const fetchCountryData = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/country/getCountry` , {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log(response.data.data);
      const countryList = response.data.data.map((country) => ({
        isoCode: country.isoCode,
        name: `${country.name}`,
      }));
      setCountryData(countryList);
    } catch (error) {
      setError("Failed to fetch countries");
      console.error(
        "Failed to fetch countries:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async (countryName) => {
    if (countryName) {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `/api/city/getCityByCountry?countryName=${countryName}`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        console.log(response);
        const cityData = response.data;
        setCities(cityData.map((city) => ({ name: city.name })));
      } catch (error) {
        console.error(
          "Failed to fetch cities:",
          error.response ? error.response.data : error.message
        );
      }
    } else {
      setCities([]);
    }
  };

  useEffect(() => {
    fetchCountryData();
  }, []);

  useEffect(() => {
    setCity(null);
    if (country) {
      fetchCities(country.name);
    } else {
      setCities([]);
    }
  }, [country]);

  const handleCityInputChange = (event, newValue) => {
    setCity(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const chapterData = {
      name,
      countryName: country?.name,
      city: city?.name,
    };

    try {
      const token = getCookie("token");
      const response = await axios.post(
        "/api/chapter/addChapter",
        chapterData,
        { withCredentials: true },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { data } = response.data;

      console.log(data);

      navigate("/ChapterList");
    } catch (error) {
      console.error(
        "Failed to create chapter:",
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
            to="/ChapterList"
            className="mr-2 text-red-300 hover:text-red-500"
          >
            {" "}
            Chapters /
          </Link>
          <span className="font-semibold text-red-500"> Insert Chapter</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Create Chapter</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4 w-1/2">
              <label className="block text-gray-700 font-bold mb-2">
                Country
              </label>
              <Autocomplete
                options={countryData}
                getOptionLabel={(option) => option.name}
                value={country}
                onChange={(event, newValue) => setCountry(newValue)}
                filterOptions={(options, state) =>
                  options.filter((option) =>
                    option.name
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase())
                  )
                }
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
            <div className="mb-4 w-1/2">
              <label className="block text-gray-700 font-bold mb-2">City</label>
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => option.name}
                value={city}
                onChange={handleCityInputChange}
                filterOptions={(options, state) =>
                  options.filter((option) =>
                    option.name
                      .toLowerCase()
                      .includes(state.inputValue.toLowerCase())
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select City"
                    className="w-1/2"
                    required
                    disabled={!country}
                  />
                )}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                Chapter Name
              </label>
              <TextField
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-1/2"
                required
              />
            </div>
            <Button type="submit" variant="contained" color="primary">
              Create Chapter
            </Button>
          </form>
        )}
      </div>
    </>
  );
};

export default CreateChapter;
