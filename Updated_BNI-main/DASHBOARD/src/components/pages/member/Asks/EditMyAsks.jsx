import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Autocomplete, TextField } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

const EditMyAsk = () => {
  const { id, userId } = useParams();
  const [myAsk, setMyAsk] = useState({
    companyName: "",
    dept: "",
    message: "",
  });
  const [departments, setDepartments] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchMyAsk();
    fetchDepartments();
  }, [id]);

  const fetchMyAsk = async () => {
    const token = getCookie("token");
    try {
      const response = await axios.get(`/api/myAsk/getMyAskById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("API response:", response);

      const myAskData = response.data.data;
      if (myAskData) {
        setMyAsk(myAskData);
        if (myAskData.companyName) {
          setSelectedCompany({ companyName: myAskData.companyName });
        }
      } else {
        console.error("No My Ask data found");
      }
    } catch (error) {
      console.error("Error fetching My Ask data:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get("/api/department/getAllDepartment" ,  {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setDepartments(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch departments:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMyAsk((prevMyAsk) => ({
      ...prevMyAsk,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getCookie("token");
      await axios.put(`/api/myAsk/updateMyAsk?id=${id}`, myAsk, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      toast.success("My Ask updated successfully");
      // If userId is not in the URL, we assume it's an admin editing from a general list.
      if (!userId) {
        navigate(`/allAsks`);
      } else {
        navigate(`/myAsks/${userId}`);
      }
    } catch (error) {
      console.error(
        "Failed to update My Ask:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to update My Ask");
    }
  };

  const fetchCompanyOptions = async (searchTerm) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/company/getFilteredGives?companyName=${searchTerm}`,
        { headers: {
          Authorization: `Bearer ${token}`,
        }, withCredentials: true }
      );
      console.log(response.data.companies);
      setCompanyOptions(response.data.companies || []);
    } catch (error) {
      console.error(
        "Failed to fetch company options:",
        error.response ? error.response.data : error.message
      );
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex items-center text-sm font-medium text-gray-500">
        <Link to="/" className="hover:text-gray-700">
          Dashboard
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <Link to={`/myAsks/${userId}`} className="hover:text-gray-700">
          My Asks
        </Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="text-gray-700">Edit My Ask</span>
      </nav>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
          Edit My Ask
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Company Name
            </label>
            <Autocomplete
              options={companyOptions}
              getOptionLabel={(option) => option.companyName || ""}
              value={selectedCompany}
              onInputChange={(event, newInputValue) => {
                fetchCompanyOptions(newInputValue);
              }}
              onChange={(event, newValue) => {
                setSelectedCompany(newValue);
                handleChange({
                  target: {
                    name: "companyName",
                    value: newValue ? newValue.companyName : "",
                  },
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select or type to search company"
                  variant="outlined"
                  required
                />
              )}
            />
          </div>

          {/* Department */}
          <div>
            <label
              htmlFor="dept"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Department
            </label>
            <select
              id="dept"
              name="dept"
              value={typeof myAsk.dept === 'object' ? myAsk.dept?._id : myAsk.dept || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              required
            >
              <option value="">Select a Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={myAsk.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              rows="5"
              required
              placeholder="Enter your ask message here..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Update Ask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMyAsk;
