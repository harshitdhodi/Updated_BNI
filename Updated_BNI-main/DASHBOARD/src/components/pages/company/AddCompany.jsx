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
  const [errors, setErrors] = useState({}); // Field-specific errors
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyNameFromURL = queryParams.get("name");

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

  // Regex patterns
  const strictUrlPattern = /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/i;
  const companyNamePattern = /^[a-zA-Z0-9\s.,'&()-]+$/;
  const addressPattern = /^[a-zA-Z0-9\s.,'#\-\/()]+$/;

  const validateForm = () => {
    const newErrors = {};

    // Company Name validation
    if (!companyName.trim()) {
      newErrors.companyName = "Company Name is required";
    } else if (!companyNamePattern.test(companyName)) {
      newErrors.companyName = "Invalid characters in Company Name. Only letters, numbers, and basic punctuation (.,'&-) are allowed.";
    }

    // Company Address validation
    if (!companyAddress.trim()) {
      newErrors.companyAddress = "Company Address is required";
    } else if (!addressPattern.test(companyAddress)) {
      newErrors.companyAddress = "Invalid characters in Address. Only letters, numbers, and basic punctuation (.,'#-) are allowed.";
    }

    // Social Links Validation
    if (facebook && !strictUrlPattern.test(facebook.trim())) {
      newErrors.facebook = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    }

    if (linkedin && !strictUrlPattern.test(linkedin.trim())) {
      newErrors.linkedin = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    }

    if (twitter && !strictUrlPattern.test(twitter.trim())) {
      newErrors.twitter = "Invalid URL. Please enter a valid link starting with http:// or https://.";
    }

    if (whatsapp) {
      const cleaned = whatsapp.trim();
      // Check if it's a valid URL or a phone number
      if (!strictUrlPattern.test(cleaned) && !/^\+?\d{10,15}$/.test(cleaned.replace(/\s/g, ''))) {
        newErrors.whatsapp = "Invalid WhatsApp. Enter a valid URL or a 10-15 digit phone number.";
      }
    }

    // Optional: Image size validation (max 5MB)
    if (bannerImg && bannerImg.size > 5 * 1024 * 1024) {
      newErrors.bannerImg = "Banner image must be under 5MB";
    }
    if (profileImg && profileImg.size > 5 * 1024 * 1024) {
      newErrors.profileImg = "Profile image must be under 5MB";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("companyName", companyName.trim());
    formData.append("whatsapp", whatsapp.trim());
    formData.append("facebook", facebook.trim());
    formData.append("linkedin", linkedin.trim());
    formData.append("twitter", twitter.trim());
    formData.append("companyAddress", companyAddress.trim());
    if (bannerImg) formData.append("bannerImg", bannerImg);
    if (profileImg) formData.append("profileImg", profileImg);

    try {
      const token = getCookie("token");
      await axios.post("/api/company/createCompany", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      navigate("/company");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setErrors({ submit: error.response?.data?.message || "Failed to create company. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-600">Dashboard /</Link>
          <Link to="/company" className="mr-2 text-red-300 hover:text-red-600">CompanyList /</Link>
          <span className="font-bold text-gray-600"> Add Business</span>
        </nav>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add Business Profile</h1>

        {errors.submit && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Company Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full lg:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 ${
                errors.companyName ? "border-red-500" : ""
              }`}
              placeholder="Acme Corp"
            />
            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
          </div>

          {/* Contact Links */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Contact Links (Optional)</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp (+1234567890 or wa.me link)"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 ${
                    errors.whatsapp ? "border-red-500" : ""
                  }`}
                />
                {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
              </div>

              <div>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook URL"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 ${
                    errors.facebook ? "border-red-500" : ""
                  }`}
                />
                {errors.facebook && <p className="text-red-500 text-sm mt-1">{errors.facebook}</p>}
              </div>

              <div>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn URL"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 ${
                    errors.linkedin ? "border-red-500" : ""
                  }`}
                />
                {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
              </div>

              <div>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter/X URL"
                  className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 ${
                    errors.twitter ? "border-red-500" : ""
                  }`}
                />
                {errors.twitter && <p className="text-red-500 text-sm mt-1">{errors.twitter}</p>}
              </div>
            </div>
          </div>

          {/* Company Address */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Company Address *</label>
            <textarea
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              rows="4"
              className={`w-full lg:w-1/2 px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 ${
                errors.companyAddress ? "border-red-500" : ""
              }`}
              placeholder="123 Business St, City, Country"
            />
            {errors.companyAddress && <p className="text-red-500 text-sm mt-1">{errors.companyAddress}</p>}
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Banner Image (Optional, &lt;5MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerImg(e.target.files[0])}
                className="w-full"
              />
              {errors.bannerImg && <p className="text-red-500 text-sm mt-1">{errors.bannerImg}</p>}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Profile Image (Optional, &lt;5MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImg(e.target.files[0])}
                className="w-full"
              />
              {errors.profileImg && <p className="text-red-500 text-sm mt-1">{errors.profileImg}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md text-white font-medium transition ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isSubmitting ? "Creating..." : "Create Business Profile"}
          </button>
        </form>
      </div>
    </>
  );
};

export default AddCompany;