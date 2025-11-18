import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import debounce from "lodash/debounce";
import { toast } from "react-hot-toast";

const CreateMyGives = () => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [webURL, setWebURL] = useState("");
  const [dept, setDept] = useState("");
  const [selectedDept, setSelectedDept] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [errors, setErrors] = useState({
    companyName: "",
    email: "",
    phoneNumber: "",
    webURL: "",
    dept: "",
  });
  const navigate = useNavigate();
  const { userId } = useParams();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    fetchDepartments();
  }, []);

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
    if (!val || String(val).trim() === "") return "Department is required";
    return "";
  };

  const validateAll = () => {
    const newErrors = {
      companyName: validateCompanyName(companyName),
      email: validateEmail(email),
      phoneNumber: validatePhone(phoneNumber),
      webURL: validateURL(webURL),
      dept: validateDept(selectedDept),
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((e) => e);
  };

  // Pure form validity check (does NOT set state) — safe to call during render
  const isFormValid = () => {
    const e1 = validateCompanyName(companyName);
    const e2 = validateEmail(email);
    const e3 = validatePhone(phoneNumber);
    const e4 = validateURL(webURL);
    const e5 = validateDept(selectedDept);
    return !(e1 || e2 || e3 || e4 || e5);
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/department/getAllDepartment` , {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setDepartments(
        Array.isArray(response.data.data) ? response.data.data : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch departments:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Fetch companies based on search term
  const fetchCompanies = async (searchTerm) => {
    try {
      const token = getCookie("token");
      const response = await axios.get(
        `/api/company/getFilteredGives?companyName=${searchTerm}`,
        { 
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true }
      );
      setCompanyOptions(
        Array.isArray(response.data.companies) ? response.data.companies : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch companies:",
        error.response ? error.response.data : error.message
      );
    }
  };

  // Debounce company name fetch
  const debouncedFetchCompanies = debounce((searchTerm) => {
    fetchCompanies(searchTerm);
  }, 300);

  // Handle company name input change
  const handleCompanyNameChange = (event, newValue) => {
    const v = newValue || "";
    setCompanyName(v);
    setErrors((prev) => ({ ...prev, companyName: validateCompanyName(v) }));
    debouncedFetchCompanies(v);
  };

  // Also handle selection from options (Autocomplete onChange)
  const handleCompanySelect = (event, newValue) => {
    const v = newValue || "";
    setCompanyName(v);
    setErrors((prev) => ({ ...prev, companyName: validateCompanyName(v) }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const myGivesData = {
      companyName,
      email,
      phoneNumber,
      webURL,
      dept: selectedDept._id, // Pass department ID instead of name
    };

    try {
      const token = getCookie("token");
      const response = await axios.post(
        `/api/myGives/addMyGives?user=${userId}`,
        myGivesData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("My Gives created successfully:", response.data);
      toast.success("My Gives created successfully");

      navigate(`/myGives/${userId}`);
    } catch (error) {
      console.error(
        "Failed to create My Gives:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to create My Gives");
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
            to={`/myGives/${userId}`}
            className="mr-2 text-red-300 hover:text-red-600"
          >
            My Gives /
          </Link>
          <Link className="font-bold text-gray-600"> Add My Gives</Link>
        </nav>
      </div>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Add My Gives</h1>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Company Name <span className="text-gray-600">*</span>
            </label>
            <Autocomplete
              freeSolo
              options={companyOptions.map((company) => company.companyName)}
              value={companyName}
              onInputChange={handleCompanyNameChange}
              onChange={handleCompanySelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Add Company Name"
                  variant="outlined"
                  className="w-full"
                  required
                />
              )}
            />
            {errors.companyName && (
              <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Email <span className="text-gray-600">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
              }}
              className="w-full p-4 border bg-[#e8e8ebe6] border-[#aeabab] rounded focus:outline-none focus:border-black hover:border-black "
              required
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Phone Number <span className="text-gray-600">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                const v = e.target.value;
                setPhoneNumber(v);
                setErrors((prev) => ({ ...prev, phoneNumber: validatePhone(v) }));
              }}
              className="w-full p-4 border bg-[#e8e8ebe6] border-[#aeabab] rounded focus:outline-none focus:border-black hover:border-black "
              required
              minLength={10}
              maxLength={10}
            />
            {errors.phoneNumber && <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Website URL <span className="text-gray-600">*</span>
            </label>
            <input
              type="text"
              value={webURL}
              onChange={(e) => {
                setWebURL(e.target.value);
                setErrors((prev) => ({ ...prev, webURL: validateURL(e.target.value) }));
              }}
              onBlur={(e) => {
                const trimmedValue = e.target.value.trim();
                if (trimmedValue && !trimmedValue.startsWith("http://") && !trimmedValue.startsWith("https://")) {
                  setWebURL(`http://${trimmedValue}`);
                } else {
                  setWebURL(trimmedValue);
                }
              }}
              className="w-full p-4 border bg-[#e8e8ebe6] border-[#aeabab] rounded focus:outline-none focus:border-black hover:border-black "
              required
            />
            {errors.webURL && <p className="text-sm text-red-600 mt-1">{errors.webURL}</p>}
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Department <span className="text-gray-600">*</span>
            </label>
            <Autocomplete
              options={departments}
              getOptionLabel={(option) => option.name || ""}
              value={selectedDept}
              onInputChange={(event, newValue) => {
                setDept(newValue); // Keep track of typed value for free text
              }}
              onChange={(event, newValue) => {
                setSelectedDept(newValue);
                setErrors((prev) => ({ ...prev, dept: validateDept(newValue) }));
              }}
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
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 disabled:opacity-50"
              disabled={!isFormValid()}
            >
              Add My Gives
            </button>
          </div>
        </form>
      </div>
    </>
  );  
};

export default CreateMyGives;
