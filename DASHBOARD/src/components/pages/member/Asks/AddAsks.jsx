import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import debounce from "lodash/debounce";
import axios from "axios";

const CreateMyAsk = () => {
  const [companyName, setCompanyName] = useState("");
  const [dept, setDept] = useState("");
  const [message, setMessage] = useState("");
  const [departments, setDepartments] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const navigate = useNavigate();
  const { userId } = useParams();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get("/api/department/getAllDepartment" ,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        setDepartments(response.data.data); // Assuming the API response has a data field with an array of departments
      } catch (error) {
        console.error(
          "Failed to fetch departments:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchDepartments();
  }, []);

  const fetchCompanies = async (searchTerm) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/company/getFilteredGives?companyName=${searchTerm}`,
        {    headers: {
          Authorization: `Bearer ${token}`,
        },withCredentials: true }
      );

      // Update to use response.data.companies
      setCompanyOptions(
        Array.isArray(response.data.companies)
          ? response.data.companies.map((company) => company.companyName)
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch companies:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const debouncedFetchCompanies = debounce((searchTerm) => {
    fetchCompanies(searchTerm);
  }, 300);

  const handleCompanyNameChange = (event, newValue) => {
    setCompanyName(newValue);
    if (newValue) {
      debouncedFetchCompanies(newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const myAskData = {
      companyName,
      dept,
      message,
    };

    try {
      const token = getCookie("token");
      const response = await axios.post(
        `/api/myAsk/addMyAsk?user=${userId}`,
        myAskData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("My Ask created successfully:", response.data);

      navigate(`/myAsks/${userId}`);
    } catch (error) {
      console.error(
        "Failed to create My Ask:",
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
            to={`/myAsks/${userId}`}
            className="mr-2 text-red-300 hover:text-red-600"
          >
            My Asks /
          </Link>
          <Link className="font-bold text-red-500"> Add My Ask</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Add My Ask</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 w-1/2">
            <label className="block text-gray-700 font-bold mb-2">
              Company Name
            </label>
            <Autocomplete
              freeSolo
              options={companyOptions}
              value={companyName}
              onInputChange={handleCompanyNameChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select or Add Company Name"
                  variant="outlined"
                  className="w-1/2"
                  required
                />
              )}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Department
            </label>
            <select
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="lg:w-1/2 w-full px-4 py-2 border rounded-md focus:outline-none focus:border-red-500 transition duration-300"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Add My Ask
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateMyAsk;
