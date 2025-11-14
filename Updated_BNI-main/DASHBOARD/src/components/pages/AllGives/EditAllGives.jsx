import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const EditAllMyGives = () => {
  const { id, userId } = useParams();
  const [myGive, setMyGive] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    webURL: "",
    dept: "",
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
    fetchMyGive();
    fetchDepartments();
  }, [id]);

  const fetchMyGive = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/myGives/getmyGivesById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("API response:", response);

      const myGiveData = response.data.data;

      if (myGiveData) {
        setMyGive(myGiveData);
        if (myGiveData.companyName) {
          setSelectedCompany({ companyName: myGiveData.companyName });
        }
      } else {
        console.error("No My Gives data found");
      }
    } catch (error) {
      console.error("Error fetching My Gives data:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/department/getAllDepartment`,
         {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
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
    setMyGive((prevMyGive) => ({
      ...prevMyGive,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getCookie("token");
      await axios.put(`/api/myGives/updateMyGives?id=${id}`, myGive, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      navigate(`/allGives`);
    } catch (error) {
      console.error(
        "Failed to update My Gives:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const fetchCompanyOptions = async (searchTerm) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/company/getFilteredGives?companyName=${searchTerm}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }, withCredentials: true }
      );
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
            to={`/allGives`}
            className="mr-2 text-red-300 hover:text-red-500"
          >
            My Gives /
          </Link>
          <Link className="font-semibold text-red-500"> Edit My Gives</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit My Gives</h1>
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
          {Object.keys(myGive).map(
            (key) =>
              key !== "_id" &&
              key !== "createdAt" &&
              key !== "updatedAt" &&
              key !== "user" &&
              key !== "__v" &&
              key !== "companyName" && ( // Exclude the companyName field here
                <div className="mb-4" key={key}>
                  <label htmlFor={key} className="block font-semibold mb-2">
                    {key.charAt(0).toUpperCase() +
                      key.slice(1).replace("_", " ")}
                  </label>
                  {key === "dept" ? (
                    <select
                      id={key}
                      name={key}
                      value={myGive[key]}
                      onChange={handleChange}
                      className="w-1/2 p-2 border rounded focus:outline-none focus:border-red-500"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id={key}
                      name={key}
                      value={myGive[key]}
                      onChange={handleChange}
                      className="w-1/2 p-2 border rounded focus:outline-none focus:border-red-500"
                      required
                    />
                  )}
                </div>
              )
          )}
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

export default EditAllMyGives;
