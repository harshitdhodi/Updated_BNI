import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EditCompany = () => {
  const { id, userId } = useParams();
  const [company, setCompany] = useState({
    bannerImg: "",
    profileImg: "",
    companyName: "",
    whatsapp: "",
    facebook: "",
    linkedin: "",
    twitter: "",
    companyAddress: "",
  });
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/company/getCompanyById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
        timeout: 10000,
      });
      const companyData = response.data.data;

      if (companyData) {
        setCompany({
          bannerImg: companyData.bannerImg || "",
          profileImg: companyData.profileImg || "",
          companyName: companyData.companyName || "",
          whatsapp: companyData.whatsapp || "",
          facebook: companyData.facebook || "",
          linkedin: companyData.linkedin || "",
          twitter: companyData.twitter || "",
          companyAddress: companyData.companyAddress || "",
        });
      } else {
        console.error("No Company data found");
      }
    } catch (error) {
      console.error("Error fetching Company data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prevCompany) => ({
      ...prevCompany,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setCompany((prevCompany) => ({
      ...prevCompany,
      [name]: files[0],
    }));
  };

  const handleResetFile = (fieldName) => {
    setCompany((prevCompany) => ({
      ...prevCompany,
      [fieldName]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append fields to FormData
    Object.keys(company).forEach((key) => {
      if (key === "bannerImg" || key === "profileImg") {
        if (company[key]) {
          formData.append(key, company[key]);
        }
      } else {
        formData.append(key, company[key]);
      }
    });

    try {
      const token = getCookie("token");
      const response = await axios.put(
        `/api/company/updateCompanyById?id=${id}`,
        formData,
        {
          
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" ,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        navigate(`/company`);
      }
    } catch (error) {
      console.error(
        "Failed to update Company:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
            Dashboard /
          </Link>
          <Link
            to={`/company`}
            className="mr-2 text-gray-400 hover:text-gray-500"
          >
            Company /
          </Link>
          <span className="font-semibold text-gray-600"> Edit Company</span>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit Company</h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="mb-4">
            <label htmlFor="bannerImg" className="block font-semibold mb-2">
              Banner Image
            </label>
            <input
              type="file"
              id="bannerImg"
              name="bannerImg"
              onChange={handleFileChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
            />
            {company.bannerImg && (
              <img
                src={`/api/image/download/${company.bannerImg}`}
                alt="Banner"
                width="100"
                height="100"
                className="object-cover mt-2"
              />
            )}
            {/* {company.bannerImg && (
              <button
                type="button"
                onClick={() => handleResetFile('bannerImg')}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300 mt-2"
              >
                Reset Banner Image
              </button>
            )} */}
          </div>

          <div className="mb-4">
            <label htmlFor="profileImg" className="block font-semibold mb-2">
              Profile Image
            </label>
            <input
              type="file"
              id="profileImg"
              name="profileImg"
              onChange={handleFileChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
            />
            {company.profileImg && (
              <img
                src={`/api/image/download/${company.profileImg}`}
                alt="Profile"
                width="100"
                height="100"
                className="object-cover mt-2"
              />
            )}
            {/* {company.profileImg && (
              <button
                type="button"
                onClick={() => handleResetFile('profileImg')}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-300 mt-2"
              >
                Reset Profile Image
              </button>
            )} */}
          </div>

          <div className="mb-4">
            <label htmlFor="companyName" className="block font-semibold mb-2">
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={company.companyName || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="whatsapp" className="block font-semibold mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              id="whatsapp"
              name="whatsapp"
              value={company.whatsapp || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="facebook" className="block font-semibold mb-2">
              Facebook
            </label>
            <input
              type="text"
              id="facebook"
              name="facebook"
              value={company.facebook || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="linkedin" className="block font-semibold mb-2">
              LinkedIn
            </label>
            <input
              type="text"
              id="linkedin"
              name="linkedin"
              value={company.linkedin || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="twitter" className="block font-semibold mb-2">
              Twitter
            </label>
            <input
              type="text"
              id="twitter"
              name="twitter"
              value={company.twitter || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="companyAddress"
              className="block font-semibold mb-2"
            >
              Company Address
            </label>
            <input
              type="text"
              id="companyAddress"
              name="companyAddress"
              value={company.companyAddress || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-fit bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Save Changes
          </button>
        </form>
      </div>
    </>
  );
};

export default EditCompany;
