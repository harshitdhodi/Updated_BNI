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
    if (!name.trim()) newErrors.name = "Name is required";

    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!emailPattern.test(email)) newErrors.email = "Invalid email format";
    else {
      const domain = email.split("@")[1] || "";
      const labels = domain.split(".");
      if (labels.length < 2) newErrors.email = "Invalid email domain";
      else {
        const secondLevel = labels[labels.length - 2] || "";
        // Ensure second-level domain contains a letter (avoid emails like abc@2.com)
        if (!/[A-Za-z]/.test(secondLevel)) newErrors.email = "Email domain seems invalid";
      }
    }

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!confirmPassword) newErrors.confirmPassword = "Confirm password is required";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!country) newErrors.country = "Country is required";
    if (!city) newErrors.city = "City is required";

    const phonePattern = /^\+?\d{7,15}$/;
    if (!mobile) newErrors.mobile = "Mobile number is required";
    else if (!phonePattern.test(mobile)) newErrors.mobile = "Enter a valid mobile number (7-15 digits)";

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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]" // Apply same background
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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]" // Apply same background
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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]" // Apply same background
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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]" // Apply same background
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Password <span className="text-gray-600">*</span></label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
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
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
              aria-invalid={errors.mobile ? "true" : "false"}
              minLength={10}
              maxLength={10}
            />
            {errors.mobile && <p className="text-gray-600 text-sm mt-1">{errors.mobile}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Profile Image</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-[10px] border rounded focus:outline-none focus:border-red-500 transition duration-300 bg-[#F1F1F1] border-[#aeabab]"
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
