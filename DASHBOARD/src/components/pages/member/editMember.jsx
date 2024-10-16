import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

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
    bannerImg: "", // State for banner image
  });
  
  // New state for social links
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [password, setPassword] = useState(""); // Store the password value
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [chapters, setChapters] = useState([]);
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
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
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

  // const handleCityChange = (event, newValue) => {
  //   const selectedCity = newValue ? newValue.name : "";
  //   setMember((prevMember) => ({
  //     ...prevMember,
  //     city: selectedCity,
  //     chapter: "",
  //   }));
  //   if (selectedCity) {
  //     fetchChapters(selectedCity);
  //   } else {
  //     setChapters([]);
  //   }
  // };

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
      setMember((prevMember) => ({
        ...prevMember,
        profileImg: file,
      }));
    }
  };

  const handleBannerImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMember((prevMember) => ({
        ...prevMember,
        bannerImg: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getCookie("token");
      const formData = new FormData();
      formData.append("name", member.name);
      formData.append("email", member.email);
      formData.append("mobile", member.mobile);
      formData.append("country", member.country);
      formData.append("city", member.city);
      formData.append("chapter", member.chapter);
      formData.append("password", member.password);
      formData.append("confirm_password", member.confirm_password);
      formData.append("keyword", member.keyword);
      formData.append("profileImg", member.profileImg); // Append profile image file
      formData.append("bannerImg", member.bannerImg); // Append banner image file

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
      navigate("/memberList");
    } catch (error) {
      console.error(
        "Failed to update member:",
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
        <Link to="/memberList" className="mr-2 text-red-300 hover:text-red-500">
          Members /
        </Link>
        <Link className="font-semibold text-red-500"> Edit Member</Link>
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
      key !== "linkedin" &&
      key !== "twitter" && 
      key !== "chapter" &&
      key !== "__v" && (
              <div className="mb-4" key={key}>
                <label htmlFor={key} className="block font-semibold mb-2">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace("_", " ")}
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
                    onChange={(_, value) => handleCountryChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        className="w-full p-2 border rounded focus:outline-none  focus:border-black-500"
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
                        className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
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
                ) : key === "profileImg" || key === "bannerImg" ? (
                  <>
                    <input
                      type="file"
                      id={key}
                      name={key}
                      onChange={
                        key === "profileImg"
                          ? handleProfileImgChange
                          : handleBannerImgChange
                      }
                      accept="image/*"
                      className="w-full p-4 border bg-[#F1F1F1] border-[#131212] rounded focus:outline-none focus:border-black hover:border-black"
                    />
                    {member[key] && (
                      <div className="mt-2">
                        <img
                          src={`/api/image/download/${member[key]}`}
                          alt=""
                          className="w-20 h-20 object-cover rounded"
                        />
                      </div>
                    )}
                  </>
      //           ) : key === "password" ? (
      //             <div className="mb-4">
      //   {/* <label htmlFor="password" className="block font-semibold mb-2">
      //     Password
      //   </label> */}
      //   <input
      //     type={showPassword ? "text" : "password"} // Toggle between text and password
      //     id="password"
      //     name="password"
      //     value={password} // Controlled input
      //     onChange={handlePasswordChange}
      //     placeholder="Enter new password"
      //     className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500"
      //   />
      //   <button
      //     type="button"
      //     onClick={() => setShowPassword(!showPassword)} // Toggle the password visibility
      //     className="mt-2 text-red-500 hover:text-red-700"
      //   >
      //     {showPassword ? "Hide Password" : "Show Password"}
      //   </button>
      // </div>
                ) : (
                  <input
                    type="text"
                    id={key}
                    name={key}
                    value={member[key]}
                    onChange={handleChange}
                    className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500"
                  />
                )}
              </div>
            )
        )}
      
        {/* Social media fields */}
        <div className="mb-4">
          <label htmlFor="whatsapp" className="block font-semibold mb-2">
            WhatsApp
          </label>
          <input
            type="text"
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="facebook" className="block font-semibold mb-2">
            Facebook
          </label>
          <input
            type="text"
            id="facebook"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="linkedin" className="block font-semibold mb-2">
            LinkedIn
          </label>
          <input
            type="text"
            id="linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="twitter" className="block font-semibold mb-2">
            Twitter
          </label>
          <input
            type="text"
            id="twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="w-full p-4 border border-[#aeabab] rounded focus:outline-none focus:border-red-500"
          />
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
