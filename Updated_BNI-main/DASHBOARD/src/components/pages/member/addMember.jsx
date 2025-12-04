import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Country } from "country-state-city";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "react-hot-toast";

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
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [errors, setErrors] = useState({});
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image type file only (e.g., JPG, PNG).");
        e.target.value = null; // Reset the file input
        setProfileImg(null);
        return;
      }
      setProfileImg(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validate all fields
    if (!validate()) return;

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
      toast.success("Member created successfully");
      setTimeout(() => navigate("/memberList"), 900);
    } catch (error) {
      console.error(
        "Failed to create user:",
        error.response ? error.response.data : error.message
      );
      const msg = error?.response?.data?.message || "Failed to create member";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (!namePattern.test(name)) {
      newErrors.name = "Invalid name. Please enter alphabetic characters only.";
    }

    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Invalid email format. Please enter a valid email address.";
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordPattern.test(password)) {
      newErrors.password = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match. Please re-enter.";
    }

    if (!country) newErrors.country = "Please select a country.";
    if (!city) newErrors.city = "Please select a city.";

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!mobilePattern.test(mobile)) {
      newErrors.mobile = "Invalid mobile number. Please enter a valid 10-digit number.";
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (facebook && !urlPattern.test(facebook)) newErrors.facebook = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    if (linkedin && !urlPattern.test(linkedin)) newErrors.linkedin = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    if (twitter && !urlPattern.test(twitter)) newErrors.twitter = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    
    setErrors(newErrors);
    // show first error as toast as well
    const firstKey = Object.keys(newErrors)[0];
    if (firstKey) {
      toast.error(newErrors[firstKey]);
    }
    return Object.keys(newErrors).length === 0;
  };

  return (
    <>
      <Toaster />
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
          <Link className="font-bold text-gray-600"> Insert User</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Create User</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Name <span className="text-gray-600">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]"
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-gray-600 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Email <span className="text-gray-600">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="text-gray-600 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]" // Apply same background
            />
            {errors.whatsapp && <p className="text-gray-600 text-sm mt-1">{errors.whatsapp}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Facebook
            </label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]" // Apply same background
            />
            {errors.facebook && <p className="text-gray-600 text-sm mt-1">{errors.facebook}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              LinkedIn
            </label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]" // Apply same background
            />
            {errors.linkedin && <p className="text-gray-600 text-sm mt-1">{errors.linkedin}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Twitter
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]" // Apply same background
            />
            {errors.twitter && <p className="text-gray-600 text-sm mt-1">{errors.twitter}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Password <span className="text-gray-600">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]"
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && <p className="text-gray-600 text-sm mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Confirm Password <span className="text-gray-600">*</span></label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            {errors.confirmPassword && <p className="text-gray-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Country <span className="text-gray-600">*</span></label>
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
                  error={!!errors.country}
                  helperText={errors.country || ""}
                />
              )}
            />
            {errors.country && <p className="text-gray-600 text-sm mt-1">{errors.country}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">City <span className="text-gray-600">*</span></label>
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
                  error={!!errors.city}
                  helperText={errors.city || ""}
                />
              )}
            />
            {errors.city && <p className="text-gray-600 text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Mobile Number <span className="text-gray-600">*</span></label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              minLength={10}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]"
              maxLength={10}
            />
            {errors.mobile && <p className="text-gray-600 text-sm mt-1">{errors.mobile}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Profile Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-white border-[#aeabab]"
              accept="image/*"
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
