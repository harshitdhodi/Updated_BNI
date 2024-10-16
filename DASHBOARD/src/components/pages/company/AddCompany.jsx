import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const AddCompany = () => {
  const [companyName, setCompanyName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [bannerImg, setBannerImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [error, setError] = useState(null); // State to hold error messages
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyNameFromURL = queryParams.get("name"); // Extract company name from URL
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    if (companyNameFromURL) {
      setCompanyName(companyNameFromURL);
    }
  }, [companyNameFromURL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("companyName", companyName);
    formData.append("whatsapp", whatsapp);
    formData.append("facebook", facebook);
    formData.append("linkedin", linkedin);
    formData.append("twitter", twitter);
    formData.append("companyAddress", companyAddress);
    if (bannerImg) formData.append("bannerImg", bannerImg);
    if (profileImg) formData.append("profileImg", profileImg);

    try {
      const token = getCookie("token");
      const response = await axios.post(`/api/company/createCompany`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("Company profile created:", response.data);
      navigate(`/company`);
    } catch (error) {
      console.error(
        "Error creating company profile:",
        error.response ? error.response.data : error.message
      );
      setError("Error creating company profile. Please try again."); // Set error message
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
            to={`/company`}
            className="mr-2 text-red-300 hover:text-red-600"
          >
            CompanyList /
          </Link>
          <span className="font-bold text-red-500"> Add Business</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Add Business</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}{" "}
        {/* Display error message */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Contact Links
            </label>
            <div className="flex flex-wrap mb-2">
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp"
                className="lg:w-1/2 w-full px-4 py-2 border rounded-md mb-2 mr-2 focus:outline-none focus:border-red-500 transition duration-300"
              />
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="Facebook"
                className="lg:w-1/2 w-full px-4 py-2 border rounded-md mb-2 mr-2 focus:outline-none focus:border-red-500 transition duration-300"
              />
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="LinkedIn"
                className="lg:w-1/2 w-full px-4 py-2 border rounded-md mb-2 mr-2 focus:outline-none focus:border-red-500 transition duration-300"
              />
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="Twitter"
                className="lg:w-1/2 w-full px-4 py-2 border rounded-md mb-2 mr-2 focus:outline-none focus:border-red-500 transition duration-300"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Company Address
            </label>
            <input
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Banner Image
            </label>
            <input
              type="file"
              onChange={(e) => setBannerImg(e.target.files[0])}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Profile Image
            </label>
            <input
              type="file"
              onChange={(e) => setProfileImg(e.target.files[0])}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Create Business Profile
          </button>
        </form>
      </div>
    </>
  );
};

export default AddCompany;
