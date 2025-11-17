import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
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
    <>
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-red-300 hover:text-red-500">
            Dashboard /
          </Link>
          <Link
            to={`/myAsks/${userId}`}
            className="mr-2 text-red-300 hover:text-red-500"
          >
            My Asks /
          </Link>
          <Link className="font-semibold text-red-500"> Edit My Ask</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit My Ask</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="companyName" className="block font-semibold mb-2">
              Company Name
            </label>
            <Autocomplete
              options={companyOptions}
              getOptionLabel={(option) => option.companyName}
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
                  label="Select Company"
                  variant="outlined"
                  className="w-1/2"
                  required
                />
              )}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="dept" className="block font-semibold mb-2">
              Department
            </label>
            <select
              id="dept"
              name="dept"
              value={typeof myAsk.dept === 'object' ? myAsk.dept?._id : myAsk.dept || ''}
              onChange={handleChange}
              className="w-1/2 p-2 border rounded focus:outline-none focus:border-red-500"
              required
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="message" className="block font-semibold mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={myAsk.message}
              onChange={handleChange}
              className="w-1/2 p-2 border rounded focus:outline-none focus:border-red-500"
              rows="4"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-300"
          >
            Save
          </button>
        </form>
      </div>
    </>
  );
};

export default EditMyAsk;
