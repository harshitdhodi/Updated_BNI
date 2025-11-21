import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Toaster, toast } from "react-hot-toast";

const EditMember = () => {
  const { id } = useParams();
  const [member, setMember] = useState({
    name: "",
    email: "",
    mobile: "",
    country: "",
    city: "",
    chapter: "",
    keyword: [],
    password: "",
    confirm_password: "",
    profileImg: "", // State for profile image
  });
  
  // New state for social links
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [chapters, setChapters] = useState([]);
  const [profilePreview, setProfilePreview] = useState("");
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    fetchMember();
    fetchCountries();
  }, [id]);

  useEffect(() => {
    if (member.country) {
      fetchCities(member.country);
    }
  }, [member.country]);

  useEffect(() => {
    if (member.city) {
      fetchChapters(member.city);
    }
  }, [member.city]);

  const fetchMember = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/member/getUserById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const memberData = response.data.data;
      setMember(memberData);
      setProfilePreview(memberData.profileImg ? `/api/image/download/${memberData.profileImg}` : "");
      setWhatsapp(memberData.whatsapp || "");  // Set social links
      setFacebook(memberData.facebook || "");
      setLinkedin(memberData.linkedin || "");
      setTwitter(memberData.twitter || "");
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  };

  const fetchCountries = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/country/getCountry?page=1&limit=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setCountries(response.data.data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchCities = async (country) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/city/getAllCity?country=${country}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setCities(response.data.data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  const fetchChapters = async (city) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/chapter/getChapterByCity?city=${city}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      setChapters(response.data || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setChapters([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMember((prevMember) => ({
      ...prevMember,
      [name]: value,
    }));
  };

  const handleCountryChange = (event, newValue) => {
    const selectedCountry = newValue ? newValue.name : "";
    setMember((prevMember) => ({
      ...prevMember,
      country: selectedCountry,
      city: "",
    }));
    if (selectedCountry) {
      fetchCities(selectedCountry);
    } else {
      setCities([]);
    }
  };

 

  const handleCityChange = (value) => {
    setMember((prevState) => ({
      ...prevState,
      city: value ? value.name : "", // Assuming value has a 'name' property
    }));
  };
  
  const handleChapterChange = (event, newValue) => {
    setMember((prevMember) => ({
      ...prevMember,
      chapter: newValue ? newValue.name : "",
    }));
  };

  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image type file only.");
        e.target.value = null; // Reset the file input
        return;
      }

      setMember((prevMember) => ({
        ...prevMember,
        profileImg: file,
      }));
      // revoke old preview if it was a blob URL
      if (profilePreview && profilePreview.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(profilePreview);
        } catch (err) {}
      }
      // create preview URL for selected file
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!member.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!namePattern.test(member.name)) {
      newErrors.name = "Invalid name. Please enter alphabetic characters only.";
    }

    const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!member.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(member.email)) {
      newErrors.email = "Invalid email format. Please enter a valid email address.";
    }

    // Password is optional on edit, but if entered, it must be valid and confirmed
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (member.password) {
      if (!passwordPattern.test(member.password)) {
        newErrors.password = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
      } else if (member.password !== confirmPassword) {
        newErrors.confirm_password = "Passwords do not match. Please re-enter.";
      }
    } else if (confirmPassword) { // If confirm password is provided but password isn't
        newErrors.password = "Password is required if confirm password is entered.";
    }

    if (!member.country) newErrors.country = "Please select a country.";
    if (!member.city) newErrors.city = "Please select a city.";

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!member.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!mobilePattern.test(member.mobile)) {
      newErrors.mobile = "Invalid mobile number. Please enter a valid 10-digit number.";
    }

    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (whatsapp && !urlPattern.test(whatsapp)) newErrors.whatsapp = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    if (facebook && !urlPattern.test(facebook)) newErrors.facebook = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    if (linkedin && !urlPattern.test(linkedin)) newErrors.linkedin = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    if (twitter && !urlPattern.test(twitter)) newErrors.twitter = "Invalid URL. Please enter a valid link starting with http:// or https://.";

    setErrors(newErrors);
    const firstKey = Object.keys(newErrors)[0];
    if (firstKey) {
      toast.error(newErrors[firstKey]);
    }
    // If there are errors, prevent form submission
    if (Object.keys(newErrors).length > 0) {
      return false;
    }
    return Object.keys(newErrors).length === 0;
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
      if (member.password) {
        formData.append("password", member.password);
        formData.append("confirm_password", confirmPassword);
      }
      formData.append("keyword", member.keyword);
      // only append profileImg if a File was selected (avoid sending existing filename string)
      if (member.profileImg instanceof File) {
        formData.append("profileImg", member.profileImg);
      }
   
      // Append social links
      formData.append("whatsapp", whatsapp);
      formData.append("facebook", facebook);
      formData.append("linkedin", linkedin);
      formData.append("twitter", twitter);

      await axios.put(`/api/member/updatememberById?id=${id}`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Member updated successfully");
      setTimeout(() => navigate("/memberList"), 900);
    } catch (error) {
      console.error(
        "Failed to update member:",
        error.response ? error.response.data : error.message
      );
      const msg = error?.response?.data?.message || "Failed to update member";
      toast.error(msg);
    }
  };

  return (
    <>
    <Toaster position="top-right" />
    <div className="w-full p-2">
      <nav>
        <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
          Dashboard /
        </Link>
        <Link to="/memberList" className="mr-2 text-gray-400 hover:text-gray-500">
          Members /
        </Link>
        <Link className="font-semibold text-gray-600"> Edit Member</Link>
      </nav>
    </div>
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Edit Member</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {Object.keys(member).map(
          (key) =>
            key !== "_id" &&
      key !== "resetOTP" &&
      key !== "deviceTokens" && // Exclude deviceToken field
     
      key !== "confirm_password" &&
      key !== "ref_member" &&
      key !== "approvedByadmin" &&
      key !== "approvedBymember" &&  
      key !== "refral_code" &&
      key !== "whatsapp" &&
      key !== "facebook" &&
      key !== "confirm_password" &&
      key !== "linkedin" &&
      key !== "twitter" && 
      key !== "profileImg" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "created_at" &&
        key !== "updated_at" &&
        key !== "bannerImg" &&
      key !== "chapter" &&
      key !== "__v" && (
              <div className="mb-4" key={key}>
                <label htmlFor={key} className="block font-semibold mb-2">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")} {["name", "email", "mobile", "country", "city"].includes(key) && <span className="text-gray-600">*</span>}
                </label>
                {key === "country" ? (
                  <Autocomplete
                    id={key}
                    options={countries}
                    getOptionLabel={(option) => option.name}
                    value={
                      countries.find((country) => country.name === member.country) ||
                      null
                    }
                    onChange={handleCountryChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        className="w-full "
                        error={!!errors.country}
                        helperText={errors.country}
                      />
                    )}
                  />
                ) : key === "city" ? (
                  <Autocomplete
                    id={key}
                    options={cities}
                    getOptionLabel={(option) => option.name}
                    value={
                      cities.find((city) => city.name === member.city) || null
                    }
                    onChange={(_, value) => handleCityChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        className="w-full "
                        error={!!errors.city}
                        helperText={errors.city}
                      />
                    )}
                  />
                ) : key === "chapter" ? (
                  <Autocomplete
                    id={key}
                    options={chapters}
                    getOptionLabel={(option) => option.name}
                    value={
                      chapters.find((chapter) => chapter.name === member.chapter) ||
                      null
                    }
                    onChange={(_, value) => handleChapterChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        className="w-full p-2 border rounded focus:outline-none hover:border-red-500"
                      />
                    )}
                  />
                ) : key === "password" ? (
                  <div className="mb-4">
                    <input
                      type="password"
                      id="password"
                      name="password"
            onChange={(e) => {
              handleChange(e); if (errors.password) setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
            }}
                      value={member.password || ""}
                      placeholder="Enter new password"
                      className={`w-full p-4 border rounded focus:outline-none focus:border-red-500  border-[#aeabab] ${errors.password ? 'border-red-500' : ''}`}
          />
                    {errors.password && <p className="text-gray-600 text-sm mt-1">{errors.password}</p>}
                  </div>
                ) : (
                  <input
                    type="text"
                    id={key}
              name={key} // Ensure name attribute is present for handleChange
              onChange={(e) => {
                handleChange(e); if (errors[key]) setErrors((prevErrors) => ({ ...prevErrors, [key]: '' }));
              }}
                    value={member[key]}
                    className={`w-full p-4 border rounded focus:outline-none focus:border-red-500  border-[#aeabab] ${errors[key] ? 'border-red-500' : ''}`}
                  />
                )}
                {errors[key] && (
                  <p className="text-gray-600 text-sm mt-1">{errors[key]}</p>
                )}
              </div>
            )
        )}

        <div className="mb-4">
          <label htmlFor="confirm_password" className="block font-semibold mb-2">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            onChange={(e) => {
              setConfirmPassword(e.target.value); if (errors.confirm_password) setErrors((prevErrors) => ({ ...prevErrors, confirm_password: '' }));
            }}
            value={confirmPassword}
            className={`w-full p-4 border rounded focus:outline-none focus:border-red-500  border-[#aeabab] ${errors.confirm_password ? 'border-red-500' : ''}`}
          />
          {errors.confirm_password && <p className="text-gray-600 text-sm mt-1">{errors.confirm_password}</p>}
        </div>
        {/* profile image will render after social fields */}
      
        {/* Social media fields */}
        <div className="mb-4">
          <label htmlFor="whatsapp" className="block font-semibold mb-2">
            WhatsApp
          </label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp" // Added name attribute
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value); if (errors.whatsapp) setErrors((prevErrors) => ({ ...prevErrors, whatsapp: '' }));
            }}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500 "
          />
          {errors.whatsapp && <p className="text-gray-600 text-sm mt-1">{errors.whatsapp}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="facebook" className="block font-semibold mb-2">
            Facebook
          </label>
          <input
            type="text"
            id="facebook"
            name="facebook" // Added name attribute
            value={facebook}
            onChange={(e) => {
              setFacebook(e.target.value); if (errors.facebook) setErrors((prevErrors) => ({ ...prevErrors, facebook: '' }));
            }}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500 "
          />
          {errors.facebook && <p className="text-gray-600 text-sm mt-1">{errors.facebook}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="linkedin" className="block font-semibold mb-2">
            LinkedIn
          </label>
          <input
            type="text"
            id="linkedin"
            name="linkedin" // Added name attribute
            value={linkedin}
            onChange={(e) => {
              setLinkedin(e.target.value); if (errors.linkedin) setErrors((prevErrors) => ({ ...prevErrors, linkedin: '' }));
            }}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500 "
          />
          {errors.linkedin && <p className="text-gray-600 text-sm mt-1">{errors.linkedin}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="twitter" className="block font-semibold mb-2">
            Twitter
          </label>
          <input
            type="text"
            id="twitter"
            name="twitter" // Added name attribute
            value={twitter}
            onChange={(e) => {
              setTwitter(e.target.value); if (errors.twitter) setErrors((prevErrors) => ({ ...prevErrors, twitter: '' }));
            }}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500 "
          />
          {errors.twitter && <p className="text-gray-600 text-sm mt-1">{errors.twitter}</p>}
        </div>
        {/* Profile image input rendered after social fields */}
        <div className="mb-4 col-span-2">
          <label htmlFor="profileImg" className="block font-semibold mb-2">Profile Image</label>
          <input
            type="file"
            id="profileImg"
            name="profileImg"
            accept="image/*"
            onChange={handleProfileImgChange}
            className="w-full p-2"
          />
          {profilePreview && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Preview:</p>
              <img src={profilePreview} alt="Profile preview" className="max-w-xs max-h-40 object-cover rounded" />
            </div>
          )}
        </div>

        <div className="col-span-2 mb-4">
          <button
            type="submit"
            className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded"
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
