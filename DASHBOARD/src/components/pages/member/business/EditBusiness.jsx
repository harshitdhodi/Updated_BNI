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
          <Link to="/" className="mr-2 text-red-300 hover:text-red-600">
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
            className="mr-2 text-red-300 hover:text-red-600"
          >
            My Business /
          </Link>
          <span className="font-bold text-red-500"> Edit Business</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit Business</h1>
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
              {industries.map((industry) => (
                <option key={industry._id} value={industry.name}>
                  {industry.name}
                </option>
              ))}
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
            {bannerImgUrl && (
              <div className="mb-2">
                <img src={bannerImgUrl} alt="Banner" className="max-w-xs" />
                <a
                  href={bannerImgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500"
                >
                  View
                </a>
              </div>
            )}
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
            {profileImgUrl && (
              <div className="mb-2">
                <img src={profileImgUrl} alt="Profile" className="max-w-xs" />
                <a
                  href={profileImgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-500"
                >
                  View
                </a>
              </div>
            )}
            <input
              type="file"
              onChange={(e) => setProfileImg(e.target.files[0])}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Catalog
            </label>
            {catalogUrl && (
              <div className="mb-2">
                <a
                  href={catalogUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500"
                >
                  Download Catalog
                </a>
              </div>
            )}
            <input
              type="file"
              onChange={(e) => setCatalog(e.target.files[0])}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
            />
          </div>
          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:bg-red-600 transition duration-300"
            >
              Save Changes
            </button>
            <Link
              to={`/myBusiness/${id}`}
              className="ml-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400 transition duration-300"
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
