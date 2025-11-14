import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Country } from "country-state-city";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const CreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState(null);
  const [city, setCity] = useState(null);
  const [mobile, setMobile] = useState("");
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [profileImg, setProfileImg] = useState(null);
  const [bannerImg, setBannerImg] = useState(null);
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (country) {
      const token = getCookie("token");
      axios
        .get(`/api/city/getCityByCountry?countryName=${country.name}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        .then((response) => {
          const citiesData = response.data;
          if (Array.isArray(citiesData)) {
            setCities(citiesData);
          } else {
            setCities([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching cities:", error);
          setCities([]);
        });
    } else {
      setCities([]);
    }
  }, [country]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirm_password", confirmPassword);
    formData.append("country", country ? country.name : "");
    formData.append("city", city ? city.name : "");
    formData.append("mobile", mobile);
    formData.append("whatsapp", whatsapp);
    formData.append("facebook", facebook);
    formData.append("linkedin", linkedin);
    formData.append("twitter", twitter);
    if (profileImg) formData.append("profileImg", profileImg);
    if (bannerImg) formData.append("bannerImg", bannerImg);

    try {
      const token = getCookie("token");
      setLoading(true);
      const response = await axios.post("/api/member/member-register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);

      navigate("/memberList");
    } catch (error) {
      console.error(
        "Failed to create user:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-600">
            Dashboard /
          </Link>
          <Link
            to="/memberList"
            className="mr-2 text-red-300 hover:text-red-600"
          >
            Members /
          </Link>
          <Link className="font-bold text-red-500"> Insert User</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Create User</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Facebook
            </label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              LinkedIn
            </label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Twitter
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Country</label>
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => option.name}
              value={country}
              onChange={(event, newValue) => setCountry(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Country"
                  variant="outlined"
                  className="w-full"
                  required
                />
              )}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">City</label>
            <Autocomplete
              options={cities}
              getOptionLabel={(option) => option.name}
              value={city}
              onChange={(event, newValue) => setCity(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select City"
                  variant="outlined"
                  className="w-full"
                  required
                  disabled={!country}
                />
              )}
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Mobile Number
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Profile Image</label>
            <input
              type="file"
              onChange={(e) => setProfileImg(e.target.files[0])}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Banner Image</label>
            <input
              type="file"
              onChange={(e) => setBannerImg(e.target.files[0])}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
            />
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="w-1/4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600 transition duration-300"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateUser;
