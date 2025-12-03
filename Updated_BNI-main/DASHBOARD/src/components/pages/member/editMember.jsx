import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { Toaster, toast } from "react-hot-toast";

const EditMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    city: "",
    chapter: "",
    keyword: [], // Array for keywords
    password: "",
    profileImg: "", // Will hold File or existing filename
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [profilePreview, setProfilePreview] = useState("");
  const [errors, setErrors] = useState({});

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Fetch member + countries on load
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchMember(), fetchCountries()]);
    };
    loadInitialData();
  }, [id]);

  // Fetch cities when country changes
  useEffect(() => {
    if (member.country && countries.length > 0) {
      fetchCities(member.country);
    } else {
      setCities([]);
      setChapters([]);
    }
  }, [member.country, countries]);

  // Fetch chapters when city changes
  useEffect(() => {
    if (member.city && cities.length > 0) {
      fetchChapters(member.city);
    } else {
      setChapters([]);
    }
  }, [member.city, cities]);

  const fetchMember = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/member/getUserById?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const data = response.data.data;

      setMember({
        ...data,
        password: "",
        keyword: data.keyword || [],
        profileImg: data.profileImg || "",
      });

      setWhatsapp(data.whatsapp || "");
      setFacebook(data.facebook || "");
      setLinkedin(data.linkedin || "");
      setTwitter(data.twitter || "");

      setProfilePreview(
        data.profileImg ? `/api/image/download/${data.profileImg}` : ""
      );
    } catch (error) {
      console.error("Error fetching member:", error);
      toast.error("Failed to load member data");
    }
  };

  const fetchCountries = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/country/getCountry?page=1&limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCountries(response.data.data || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchCities = async (countryName) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/city/getAllCity?country=${countryName}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setCities(response.data.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  const fetchChapters = async (cityName) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/chapter/getChapterByCity?city=${cityName}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setChapters(response.data || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setChapters([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCountryChange = (event, newValue) => {
    const countryName = newValue ? newValue.name : "";
    setMember((prev) => ({ ...prev, country: countryName, city: "", chapter: "" }));
  };

  const handleCityChange = (event, newValue) => {
    const cityName = newValue ? newValue.name : "";
    setMember((prev) => ({ ...prev, city: cityName, chapter: "" }));
  };

  const handleChapterChange = (event, newValue) => {
    setMember((prev) => ({ ...prev, chapter: newValue ? newValue.name : "" }));
  };

  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = null;
      return;
    }

    setMember((prev) => ({ ...prev, profileImg: file || "" }));

    if (file) {
      if (profilePreview && profilePreview.startsWith("blob:")) {
        URL.revokeObjectURL(profilePreview);
      }
      setProfilePreview(URL.createObjectURL(file));
    } else {
      setProfilePreview(member.profileImg ? `/api/image/download/${member.profileImg}` : "");
    }
  };

  const validate = () => {
    const newErrors = {};
    const namePattern = /^[a-zA-Z\s]+$/;
    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const mobilePattern = /^[6-9]\d{9}$/;
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!member.name.trim()) newErrors.name = "Name is required";
    else if (!namePattern.test(member.name)) newErrors.name = "Name should contain only letters";

    if (!member.email.trim()) newErrors.email = "Email is required";
    else if (!emailPattern.test(member.email)) newErrors.email = "Invalid email format";

    if (!member.mobile) newErrors.mobile = "Mobile is required";
    else if (!mobilePattern.test(member.mobile)) newErrors.mobile = "Invalid 10-digit mobile number";

    if (!member.country) newErrors.country = "Country is required";
    if (!member.city) newErrors.city = "City is required";

    if (member.password) {
      if (!passwordPattern.test(member.password))
        newErrors.password = "Password too weak";
      else if (member.password !== confirmPassword)
        newErrors.confirm_password = "Passwords do not match";
    } else if (confirmPassword) {
      newErrors.password = "Please enter new password";
    }

    ["whatsapp", "facebook", "linkedin", "twitter"].forEach((field) => {
      const value = eval(field); // whatsapp, facebook, etc.
      if (value && !urlPattern.test(value)) {
        newErrors[field] = "Invalid URL";
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(newErrors[Object.keys(newErrors)[0]]);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const token = getCookie("token");
      const formData = new FormData();

      formData.append("name", member.name);
      formData.append("email", member.email);
      formData.append("mobile", member.mobile);
      formData.append("country", member.country);
      formData.append("city", member.city);
      formData.append("chapter", member.chapter || "");
      member.keyword.forEach((kw, i) => formData.append(`keyword[${i}]`, kw));

      if (member.password) {
        formData.append("password", member.password);
        formData.append("confirm_password", confirmPassword);
      }

      if (member.profileImg instanceof File) {
        formData.append("profileImg", member.profileImg);
      }

      formData.append("whatsapp", whatsapp);
      formData.append("facebook", facebook);
      formData.append("linkedin", linkedin);
      formData.append("twitter", twitter);

      await axios.put(`/api/member/updatememberById?id=${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("Member updated successfully!");
      setTimeout(() => navigate("/memberList"), 1000);
    } catch (error) {
      const msg = error.response?.data?.message || "Update failed";
      toast.error(msg);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">Dashboard /</Link>
          <Link to="/memberList" className="mr-2 text-gray-400 hover:text-gray-500">Members /</Link>
          <span className="font-semibold text-gray-600">Edit Member</span>
        </nav>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Member</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name */}
          <div>
            <label className="block font-semibold mb-2">Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={member.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.name ? "border-red-500" : "border-gray-300"} focus:outline-none focus:border-red-500`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-semibold mb-2">Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={member.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.email ? "border-red-500" : "border-gray-300"} focus:outline-none focus:border-red-500`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Mobile */}
          <div>
            <label className="block font-semibold mb-2">Mobile <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="mobile"
              value={member.mobile}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${errors.mobile ? "border-red-500" : "border-gray-300"} focus:outline-none focus:border-red-500`}
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          {/* Country */}
          <div>
            <label className="block font-semibold mb-2">Country <span className="text-red-500">*</span></label>
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => option.name || ""}
              value={countries.find(c => c.name === member.country) || null}
              onChange={handleCountryChange}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" error={!!errors.country} helperText={errors.country} />
              )}
            />
          </div>

          {/* City */}
          <div>
            <label className="block font-semibold mb-2">City <span className="text-red-500">*</span></label>
            <Autocomplete
              options={cities}
              getOptionLabel={(option) => option.name || ""}
              value={cities.find(c => c.name === member.city) || null}
              onChange={handleCityChange}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" error={!!errors.city} helperText={errors.city} />
              )}
            />
          </div>

          {/* Chapter */}
          {/* <div>
            <label className="block font-semibold mb-2">Chapter</label>
            <Autocomplete
              options={chapters}
              getOptionLabel={(option) => option.name || ""}
              value={chapters.find(ch => ch.name === member.chapter) || null}
              onChange={handleChapterChange}
              renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select Chapter" />}
            />
          </div> */}

          {/* Keywords */}
          <div>
            <label className="block font-semibold mb-2">Keywords</label>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={member.keyword}
              onChange={(e, newValue) => setMember(prev => ({ ...prev, keyword: newValue }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} key={index} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} variant="outlined" placeholder="Type and press Enter" />
              )}
            />
          </div>

          {/* New Password (Optional) */}
          <div>
            <label className="block font-semibold mb-2">New Password</label>
            <input
              type="password"
              value={member.password}
              onChange={(e) => {
                setMember(prev => ({ ...prev, password: e.target.value }));
                if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
              }}
              className={`w-full p-3 border rounded ${errors.password ? "border-red-500" : "border-gray-300"}`}
              placeholder="Leave blank to keep current password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-semibold mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirm_password) setErrors(prev => ({ ...prev, confirm_password: "" }));
              }}
              className={`w-full p-3 border rounded ${errors.confirm_password ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>}
          </div>

          {/* Social Links */}
          {["whatsapp", "facebook", "linkedin", "twitter"].map((platform) => (
            <div key={platform}>
              <label className="block font-semibold mb-2 capitalize">{platform}</label>
              <input
                type="url"
                value={eval(platform)}
                onChange={(e) => {
                  eval(`set${platform.charAt(0).toUpperCase() + platform.slice(1)}(e.target.value)`);
                  if (errors[platform]) setErrors(prev => ({ ...prev, [platform]: "" }));
                }}
                placeholder={`https://${platform}.com/yourprofile`}
                className={`w-full p-3 border rounded ${errors[platform] ? "border-red-500" : "border-gray-300"}`}
              />
              {errors[platform] && <p className="text-red-500 text-sm mt-1">{errors[platform]}</p>}
            </div>
          ))}

          {/* Profile Image */}
          <div className="md:col-span-2">
            <label className="block font-semibold mb-2">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImgChange}
              className="w-full p-2 border rounded"
            />
            {profilePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Current Preview:</p>
                <img src={profilePreview} alt="Profile" className="h-48 w-48 object-cover rounded-lg shadow" />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-8 py-3 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition"
            >
              Update Member
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditMember;