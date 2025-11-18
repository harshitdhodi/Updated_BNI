import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

const EditMyGives = () => {
  const { id, userId } = useParams();
  const [myGive, setMyGive] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    webURL: "",
    dept: "",
  });
  const [errors, setErrors] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    webURL: "",
    dept: "",
  });
  const [departments, setDepartments] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
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

  // Validators
  const validateCompanyName = (val) => {
    if (!val || String(val).trim() === "") return "Company name is required";
    return "";
  };
  const validateEmail = (val) => {
    if (!val) return "Email is required";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) return "Enter a valid email";
    return "";
  };
  const validatePhone = (val) => {
    if (!val) return "Phone number is required";
    const digits = String(val).replace(/\D/g, "");
    if (digits.length !== 10) return "Phone number must be 10 digits";
    return "";
  };
  const validateURL = (val) => {
    if (!val) return "Website URL is required";
    const trimmedVal = String(val).trim();
    if (!trimmedVal) return "Website URL is required";
    try {
      // Accept without protocol by adding http when missing
      /* eslint-disable no-new */
      new URL(trimmedVal.startsWith("http://") || trimmedVal.startsWith("https://") ? trimmedVal : `http://${trimmedVal}`);
      return "";
    } catch {
      return "Enter a valid URL";
    }
  };
  const validateDept = (val) => {
    if (!val || (typeof val === 'object' && !val._id) || (typeof val === 'string' && val.trim() === "")) return "Department is required";
    return "";
  };

  const isFormValid = () => {
    if (!myGive) return false;
    const e1 = validateCompanyName(myGive.companyName);
    const e2 = validateEmail(myGive.email);
    const e3 = validatePhone(myGive.phoneNumber);
    const e4 = validateURL(myGive.webURL);
    const e5 = validateDept(myGive.dept);
    // Also check for any existing errors in state
    const hasErrors = Object.values(errors).some(e => e);
    return !(e1 || e2 || e3 || e4 || e5 || hasErrors);
  };

  const fetchMyGive = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/myGives/getmyGivesById?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      const myGiveData = response.data.data;
console.log("Fetched My Gives Data:", myGiveData);  
      if (myGiveData) {
        setMyGive(myGiveData);
        // Fetch company options with the initially selected company
        fetchCompanyOptions(myGiveData.companyName);
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
    let error = "";
    switch (name) {
      case "companyName":
        error = validateCompanyName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phoneNumber":
        error = validatePhone(value);
        break;
      case "webURL":
        error = validateURL(value);
        break;
      case "dept":
        error = validateDept(value);
        break;
      default:
        break;
    }
    setMyGive((prevMyGive) => ({
      ...prevMyGive,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      return; // Prevent submission if form is invalid
    }
    // Prepare the data for submission, ensuring dept is an ID
    const submissionData = {
      ...myGive,
      dept: myGive.dept._id || myGive.dept, // Send ID if dept is an object, otherwise send original value
    };

    try {
      const token = getCookie("token");
      await axios.put(`/api/myGives/updateMyGives?id=${id}`, submissionData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      navigate(`/myGives/${userId}`);
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
        { headers: {
          Authorization: `Bearer ${token}`,
        }, withCredentials: true }
      );
      const companies = response.data.companies || [];
      // Ensure the current company name is in the options if it's not already
      if (myGive.companyName && !companies.some(c => c.companyName === myGive.companyName)) {
        companies.unshift({ companyName: myGive.companyName });
      }
      setCompanyOptions(companies);
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
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
            Dashboard /
          </Link>
          <Link
            to={`/myGives/${userId}`}
            className="mr-2 text-gray-400 hover:text-gray-500"
          >
            My Gives /
          </Link>
          <Link className="font-semibold text-gray-600"> Edit My Gives</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Edit My Gives</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {Object.keys(myGive).map(
            (key) =>
              key !== "_id" &&
              key !== "createdAt" &&
              key !== "updatedAt" &&
              key !== "user" &&
              key !== "__v" && (
                <div key={key}>
                  <label
                    htmlFor={key}
                    className="block text-gray-700 font-bold mb-2"
                  >
                    {key.charAt(0).toUpperCase() +
                      key.slice(1).replace("_", " ")}
                  </label>
                  {key === "dept" ? (
                    <>
                      <Autocomplete
                        options={departments}
                        getOptionLabel={(option) => option.name || ""}
                        value={
                          departments.find((dept) => dept._id === myGive.dept?._id) ||
                          null
                        }
                        onChange={(event, newValue) => {
                          handleChange({
                            target: {
                              name: "dept",
                              value: newValue,
                            },
                          });
                        }}
                        onBlur={() => setErrors(prev => ({...prev, dept: validateDept(myGive.dept)}))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Department"
                            variant="outlined"
                            className="w-full"
                            required
                          />
                        )}
                      />
                      {errors.dept && <p className="text-sm text-red-600 mt-1">{errors.dept}</p>}
                    </>
                  ) : key === "companyName" ? (
                    <>
                      <Autocomplete
                        freeSolo
                        options={companyOptions}
                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.companyName)}
                        value={myGive[key] || ""}
                        onInputChange={(event, newInputValue) => {
                          handleChange({ target: { name: "companyName", value: newInputValue } });
                          fetchCompanyOptions(newInputValue);
                        }}
                        onChange={(event, newValue) => {
                          handleChange({
                            target: {
                              name: "companyName",
                              value: newValue ? (typeof newValue === 'string' ? newValue : newValue.companyName) : "",
                            },
                          });
                        }}
                        onBlur={() => setErrors(prev => ({...prev, companyName: validateCompanyName(myGive.companyName)}))}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Company"
                            variant="outlined"
                            className="w-full"
                            required
                          />
                        )}
                      />
                      {errors.companyName && <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>}
                    </>
                  ) : (
                    <>
                      <input
                        type={key === 'email' ? 'email' : key === 'phoneNumber' ? 'tel' : 'text'}
                        id={key}
                        name={key}
                        value={myGive[key] || ''}
                        onChange={handleChange}
                        onBlur={(e) => {
                          if (key === 'webURL') {
                            const trimmedValue = e.target.value.trim();
                            if (trimmedValue && !trimmedValue.startsWith("http://") && !trimmedValue.startsWith("https://")) {
                              handleChange({ target: { name: 'webURL', value: `http://${trimmedValue}` } });
                            } else if (trimmedValue !== myGive.webURL) {
                              handleChange({ target: { name: 'webURL', value: trimmedValue } });
                            }
                          }
                        }}
                        className="w-full p-4 border bg-[#F1F1F1] border-[#aeabab] rounded focus:outline-none focus:border-red-500 transition duration-300"
                        required
                        minLength={key === 'phoneNumber' ? 10 : undefined}
                        maxLength={key === 'phoneNumber' ? 10 : undefined}
                      />
                      {errors[key] && <p className="text-sm text-red-600 mt-1">{errors[key]}</p>}
                    </>
                  )}
                </div>
              )
          )}
          <div className="col-span-2">
            <button
              type="submit"
              className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition duration-300 disabled:opacity-50"
              disabled={!isFormValid()}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditMyGives;
