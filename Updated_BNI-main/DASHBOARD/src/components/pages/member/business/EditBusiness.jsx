import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditBusiness = () => {
  const { id, userId } = useParams();
  const navigate = useNavigate();

  // Form fields
  const [companyName, setCompanyName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [twitter, setTwitter] = useState("");
  const [industryId, setIndustryId] = useState(""); // ← Now we store ID
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

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Fetch business details + pre-fill form
  useEffect(() => {
    const fetchBusinessDetails = async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(`/api/business/getBusinessBymyId?id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const data = response.data.data;

        setCompanyName(data.companyName || "");
        setWhatsapp(data.whatsapp || "");
        setFacebook(data.facebook || "");
        setLinkedin(data.linkedin || "");
        setTwitter(data.twitter || "");
        setIndustryId(data.industry?._id || data.industry || ""); // ← Important: get ID
        setDesignation(data.designation || "");
        setAboutCompany(data.aboutCompany || "");
        setCompanyAddress(data.companyAddress || "");
        setEmail(data.email || "");
        setMobile(data.mobile || "");

        // Image URLs
        if (data.bannerImg) setBannerImgUrl(`/api/image/download/${data.bannerImg}`);
        if (data.profileImg) setProfileImgUrl(`/api/image/download/${data.profileImg}`);
        if (data.catalog) setCatalogUrl(`/api/pdf/download/${data.catalog}`);
      } catch (error) {
        console.error("Error fetching business:", error);
      }
    };

    if (id) fetchBusinessDetails();
  }, [id]);

  // Fetch all industries
  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get("/api/industry/getAllIndustry", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setIndustries(response.data.data || []);
      } catch (error) {
        console.error("Error fetching industries:", error);
        setIndustries([]);
      }
    };

    fetchIndustries();
  }, []);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (profileImgUrl?.startsWith("blob:")) URL.revokeObjectURL(profileImgUrl);
      if (bannerImgUrl?.startsWith("blob:")) URL.revokeObjectURL(bannerImgUrl);
    };
  }, [profileImgUrl, bannerImgUrl]);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (profileImgUrl?.startsWith("blob:")) URL.revokeObjectURL(profileImgUrl);
    setProfileImg(file);
    setProfileImgUrl(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (bannerImgUrl?.startsWith("blob:")) URL.revokeObjectURL(bannerImgUrl);
    setBannerImg(file);
    setBannerImgUrl(URL.createObjectURL(file));
  };

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
    formData.append("industry", industryId);           // ← Send ID, not name!
    formData.append("designation", designation);
    formData.append("aboutCompany", aboutCompany);
    formData.append("companyAddress", companyAddress);

    if (profileImg) formData.append("profileImg", profileImg);
    if (bannerImg) formData.append("bannerImg", bannerImg);
    if (catalog) formData.append("catalog", catalog);

    try {
      const token = getCookie("token");
      await axios.put(
        `/api/business/updateBusinessProfile?businessId=${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Navigate back correctly
      const isAdminEdit = window.location.pathname.includes("editMyBusiness");
      navigate(isAdminEdit ? "/business" : `/myBusiness/${userId}`);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert("Failed to update business. Check console for details.");
    }
  };

  return (
    <>
      <div className="w-full p-4 bg-gray-50 border-b">
        <nav className="text-sm">
          <Link to="/" className="text-gray-500 hover:text-gray-700">Dashboard</Link> /
          <Link to="/business" className="mx-2 text-gray-500 hover:text-gray-700">Business List</Link> /
          <span className="text-gray-800 font-semibold"> Edit Business</span>
        </nav>
      </div>

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Edit Business</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Mobile *</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                minLength={10}
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 border rounded-lg"
                minLength={10}
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Facebook</label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">LinkedIn</label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Twitter</label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full px-4 py-3 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Catalog (PDF)</label>
              {catalogUrl && (
                <div className="mb-3">
                  <a
                    href={catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Current Catalog (Click to view)
                  </a>
                </div>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setCatalog(e.target.files[0] || null)}
                className="w-full"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Industry *</label>
              <select
                value={industryId}
                onChange={(e) => setIndustryId(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Industry</option>
                {industries.map((industry) => (
                  <option key={industry._id} value={industry._id}>
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
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">About Company *</label>
              <textarea
                value={aboutCompany}
                onChange={(e) => setAboutCompany(e.target.value)}
                rows="5"
                className="w-full px-4 py-3 border rounded-lg resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Company Address *</label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Profile Image (Logo)</label>
              {profileImgUrl && (
                <div className="mb-4">
                  <img
                    src={profileImgUrl}
                    alt="Logo preview"
                    className="w-32 h-32 object-cover rounded-full border-4 border-gray-200 shadow"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Banner Image</label>
              {bannerImgUrl && (
                <div className="mb-4">
                  <img
                    src={bannerImgUrl}
                    alt="Banner preview"
                    className="w-full h-48 object-cover rounded-lg shadow"
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="w-full"
              />
            </div>
          </div>
        </form>

        {/* Submit Button */}
        <div className="mt-10 text-left">
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition duration-300"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default EditBusiness;