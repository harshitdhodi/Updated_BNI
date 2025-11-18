import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const AddBusiness = () => {
  const [companyName, setCompanyName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [industryName, setIndustryName] = useState("");
  const [industries, setIndustries] = useState([]);
  const [designation, setDesignation] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [bannerImg, setBannerImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [catalog, setCatalog] = useState(null);
  
  // New state variables
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get("/api/industry/getAllIndustry", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        if (response.data && response.data.data) {
          setIndustries(response.data.data);
        } else {
          setIndustries([]);
        }
      } catch (error) {
        console.error("Error fetching industries:", error);
        setIndustries([]);
      }
    };

    fetchIndustries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("userId:", userId);
    const formData = new FormData();

    formData.append("companyName", companyName);
    formData.append("whatsapp", whatsapp);
    formData.append("facebook", facebook);
    formData.append("linkedin", linkedin);
    formData.append("twitter", twitter);
    formData.append("industryName", industryName);
    formData.append("designation", designation);
    formData.append("aboutCompany", aboutCompany);
    formData.append("companyAddress", companyAddress);
    formData.append("email", email); // Append email
    formData.append("mobile", mobile); // Append mobile

    if (bannerImg) formData.append("bannerImg", bannerImg);
    if (profileImg) formData.append("profileImg", profileImg);
    if (catalog) formData.append("catalog", catalog);

    try {
      const token = getCookie("token");
      const response = await axios.post(
        `/api/business/createProfile?userId=${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("Business profile created:", response.data);

      if (window.location.href === "http://localhost:5173/business_form") {
        navigate(`/business`);
      } else {
        navigate(`/myBusiness/${userId}`);
      }
    } catch (error) {
      console.error(
        "Error creating business profile:",
        error.response ? error.response.data : error.message
      );
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
            to={
              window.location.href === "http://localhost:5173/business_form"
                ? `/business`
                : `/myBusiness/${userId}`
            }
            className="mr-2 text-red-300 hover:text-red-600"
          >
            My Business /
          </Link>
          <span className="font-bold text-gray-600"> Add Business</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Add Business</h1>
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
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
          </div>

          {/* Mobile Field */}
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Mobile
            </label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Facebook
            </label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              LinkedIn
            </label>
            <input
              type="text"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Twitter
            </label>
            <input
              type="text"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
  <label className="block text-gray-700 font-bold mb-2">
    Industry Name
  </label>
  <select
    value={industryName}
    onChange={(e) => setIndustryName(e.target.value)}
    className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
    required
  >
    <option value="" disabled>
      Select Industry
    </option>
    {industries && industries.length > 0 ? (
      industries.map((industry) => (
        <option key={industry._id} value={industry.name}>
          {industry.name}
        </option>
      ))
    ) : (
      <option disabled>No industries available</option>
    )}
  </select>
</div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Designation
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              About Company
            </label>
            <textarea
              value={aboutCompany}
              onChange={(e) => setAboutCompany(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
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
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Catalog (PDF)
            </label>
            <input
              type="file"
              onChange={(e) => setCatalog(e.target.files[0])}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white font-bold rounded-md hover:bg-red-600 transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddBusiness;
