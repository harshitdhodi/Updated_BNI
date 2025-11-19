import React, { useState, useEffect, useRef } from "react";
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
  const [profileImg, setProfileImg] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  // Profile image preview only
  const [profilePreview, setProfilePreview] = useState(null);
  const profileUrlRef = useRef(null);

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

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (profileUrlRef.current) {
        URL.revokeObjectURL(profileUrlRef.current);
      }
    };
  }, []);

  // Handle Profile Image + Preview
  const handleProfileImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);

      // Revoke old URL
      if (profileUrlRef.current) {
        URL.revokeObjectURL(profileUrlRef.current);
      }

      const url = URL.createObjectURL(file);
      profileUrlRef.current = url;
      setProfilePreview(url);
    } else {
      setProfileImg(null);
      if (profileUrlRef.current) {
        URL.revokeObjectURL(profileUrlRef.current);
        profileUrlRef.current = null;
      }
      setProfilePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    formData.append("email", email);
    formData.append("mobile", mobile);

    if (profileImg) formData.append("profileImg", profileImg);
    if (catalog) formData.append("catalog", catalog);

    try {
      const token = getCookie("token");
      await axios.post(`/api/business/createProfile?userId=${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      navigate(`/business/${userId}`);
    } catch (error) {
      console.error("Error creating business:", error.response?.data || error.message);
    }
  };

  return (
    <>
      <div className="w-full p-4 bg-gray-50 min-h-screen">
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-gray-900">Dashboard</Link> → 
          <Link to={`/myBusiness/${userId}`} className="mx-2 hover:text-gray-900">My Business</Link> → 
          <span className="font-bold text-gray-800"> Add Business</span>
        </nav>

        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Create Business Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Profile Image Section */}
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-300">
              <label className="block text-lg font-semibold text-gray-700 mb-4">Profile Image (Logo)</label>
              <input
                type="file" accept="image/*" onChange={handleProfileImgChange} className="block w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
              
              {profilePreview && (
                <div className="mt-6 flex justify-center">
                  <img src={profilePreview} alt="Logo preview" className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-2xl" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Company Name *</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="Enter company name" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition" />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="contact@example.com" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200" />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Mobile *</label>
                  <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} required minLength="10" maxLength="10" placeholder="9876543210" className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200" />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">WhatsApp</label>
                  <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 98765 43210" className="w-full px-5 py-3 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Facebook</label>
                  <input type="url" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" className="w-full px-5 py-3 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">LinkedIn</label>
                  <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/company/yourcompany" className="w-full px-5 py-3 border border-gray-300 rounded-lg" />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Industry *</label>
                  <select value={industryName} onChange={(e) => setIndustryName(e.target.value)} required className="w-full px-5 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-200">
                    <option value="" disabled>Select Industry</option>
                    {industries.map((ind) => (
                      <option key={ind._id} value={ind._id}>{ind.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Designation *</label>
                  <input type="text" value={designation} onChange={(e) => setDesignation(e.target.value)} required placeholder="CEO, Founder, etc." className="w-full px-5 py-3 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">About Company *</label>
                  <textarea value={aboutCompany} onChange={(e) => setAboutCompany(e.target.value)} rows="5" required placeholder="Brief description about your company..." className="w-full px-5 py-3 border border-gray-300 rounded-lg resize-none focus:ring-4 focus:ring-blue-200"></textarea>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Company Address *</label>
                  <input type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} required placeholder="Full address" className="w-full px-5 py-3 border border-gray-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Catalog (PDF Optional)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setCatalog(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-lg file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 text-start">
              <button type="submit" className="px-16 py-4 bg-gradient-to-r from-blue-100 to-blue-50 text-black font-medium text-lg rounded-xl  transform hover:scale-105 transition duration-300 shadow-xl">
                Create Business 
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddBusiness;