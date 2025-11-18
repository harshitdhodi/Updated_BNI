import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditBusiness = () => {
  const { id, userId } = useParams();
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
  const [bannerImgUrl, setBannerImgUrl] = useState("");
  const [profileImg, setProfileImg] = useState(null);
  const [profileImgUrl, setProfileImgUrl] = useState("");
  const [catalog, setCatalog] = useState(null);
  const [catalogUrl, setCatalogUrl] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `/api/business/getBusinessBymyId?id=${id}`,
          { headers: {
            Authorization: `Bearer ${token}`,
          }, withCredentials: true }
        );
        const businessData = response.data.data;
        setCompanyName(businessData.companyName);
        setWhatsapp(businessData.whatsapp || "");
        setFacebook(businessData.facebook || "");
        setLinkedin(businessData.linkedin || "");
        setTwitter(businessData.twitter || "");
        setIndustryName(businessData.industryName);
        setDesignation(businessData.designation);
        setAboutCompany(businessData.aboutCompany);
        setCompanyAddress(businessData.companyAddress);
        setBannerImgUrl(`/api/image/download/${businessData.bannerImg}`);
        setProfileImgUrl(`/api/image/download/${businessData.profileImg}`);
        setCatalogUrl(`/api/pdf/download/${businessData.catalog}`);
        setEmail(businessData.email || "");
        setMobile(businessData.mobile || "");

      } catch (error) {
        console.error("Error fetching business details:", error);
      }
    };

    fetchBusinessDetails();
  }, [id]);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const token = getCookie("token")
        const response = await axios.get("/api/industry/getAllIndustry" , {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        setIndustries(response.data.data);
      } catch (error) {
        console.error("Error fetching industries:", error);
        setIndustries([]);
      }
    };

    fetchIndustries();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("companyName", companyName);
    formData.append("whatsapp", whatsapp);
    formData.append("facebook", facebook);
    formData.append("linkedin", linkedin);
    formData.append("twitter", twitter);
    formData.append("email", email);
formData.append("mobile", mobile);

    formData.append("industryName", industryName);
    formData.append("designation", designation);
    formData.append("aboutCompany", aboutCompany);
    formData.append("companyAddress", companyAddress);
    if (bannerImg) formData.append("bannerImg", bannerImg);
    if (profileImg) formData.append("profileImg", profileImg);
    if (catalog) formData.append("catalog", catalog);

    try {
      const token = getCookie("token");
      const response = await axios.put(
        `/api/business/updateBusinessById?id=${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
      console.log("Business updated:", userId);
      if (
        window.location.href === `http://localhost:5173/editMyBusiness/${id}`
      ) {
        navigate(`/business`);
      } else {
        navigate(`/myBusiness/${userId}`);
      }
    } catch (error) {
      console.error(
        "Error updating business:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-600">
            Dashboard /
          </Link>
          <Link
            to={
              window.location.href.includes(
                `http://localhost:5173/editMyBusiness/${id}`
              )
                ? `/business`
                : `/myBusiness/${userId}`
            }
            className="mr-2 text-gray-400 hover:text-gray-600"
          >
            My Business /
          </Link>
          <span className="font-bold text-gray-600"> Edit Business</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit Business</h1>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
  {/* 2×2 Grid Layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

    {/* Left Column */}
    <div className="space-y-6">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Company Name *</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          required
          placeholder="Enter company name"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Email *</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          required
          placeholder="company@example.com"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Mobile *</label>
        <input
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          required
          placeholder="+91 98765 43210"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">WhatsApp</label>
        <input
          type="text"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          placeholder="+91 98765 43210"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Facebook</label>
        <input
          type="url"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          placeholder="https://facebook.com/yourpage"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">LinkedIn</label>
        <input
          type="url"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          placeholder="https://linkedin.com/company/yourcompany"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Twitter</label>
        <input
          type="url"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          placeholder="https://twitter.com/yourhandle"
        />
      </div>
        {/* Catalog */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Catalog (PDF)</label>
        {catalogUrl && (
          <div className="mb-3">
            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Download Current Catalog
            </a>
          </div>
        )}
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setCatalog(e.target.files[0])}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
        />
      </div>
    </div>

    {/* Right Column */}
    <div className="space-y-6">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Industry Name *</label>
        <select
          value={industryName}
          onChange={(e) => setIndustryName(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          required
        >
          <option value="" disabled>Select Industry</option>
          {industries.map((industry) => (
            <option key={industry._id} value={industry.name}>
              {industry.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Designation *</label>
        <input
          type="text"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          required
          placeholder="CEO, Manager, etc."
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">About Company *</label>
        <textarea
          value={aboutCompany}
          onChange={(e) => setAboutCompany(e.target.value)}
          rows="5"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition resize-none"
          required
          placeholder="Tell us about your company..."
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-2">Company Address *</label>
        <input
          type="text"
          value={companyAddress}
          onChange={(e) => setCompanyAddress(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition"
          required
          placeholder="123 Business St, City, Country"
        />
      </div>

    

      {/* Profile Image */}
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Profile Image (Logo)</label>
        {profileImgUrl && (
          <div className="mb-3">
            <img
              src={profileImgUrl}
              alt="Current Logo"
              className="w-32 h-32 object-cover rounded-full shadow-md border-4 border-white"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfileImg(e.target.files[0])}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition"
        />
      </div>

    
    </div>
  </div>

  {/* Action Buttons */}
  <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
    <button
      type="submit"
      className="px-8 py-3 bg-gradient-to-r from-blue-100 to-blue-50 text-gray-700 font-medium text-lg rounded-lg shadow-lg hover:from-blue-50 hover:to-blue-700 transform hover:scale-105 transition duration-300"
    >
      Save Changes
    </button>
    <Link
      to={window.location.href.includes("editMyBusiness") ? `/business` : `/myBusiness/${userId}`}
      className="px-8 py-3 bg-gray-300 border border-gray-300 text-gray-700 font-medium text-lg rounded-lg hover:bg-gray-300 transition text-center"
    >
      Cancel
    </Link>
  </div>
</form>
      </div>
    </>
  );
};

export default EditBusiness;
