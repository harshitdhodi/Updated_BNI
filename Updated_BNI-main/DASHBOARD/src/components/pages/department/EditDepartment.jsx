import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const EditDepartment = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Same validation logic as CreateDepartment
  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const maxLength = 100;

    if (!trimmedName) {
      newErrors.name = "Department name is required.";
    } else if (trimmedName.length < 2) {
      newErrors.name = "Department name must be at least 2 characters long.";
    } else if (trimmedName.length > maxLength) {
      newErrors.name = `Department name cannot exceed ${maxLength} characters.`;
    } else if (/^\d+$/.test(trimmedName)) {
      newErrors.name = "Department name cannot consist of only numbers.";
    } else if (/^[\d\W]/.test(trimmedName)) {
      newErrors.name = "Department name cannot start with a number or special character.";
    } else if (/<script[\s\S]*?>[\s\S]*?<\/script>/i.test(trimmedName) || /on\w+\s*=/i.test(trimmedName)) {
      newErrors.name = "Script tags or event handlers are not allowed.";
    } else if (/[<>"'{}[\]\\|/$`%]/.test(trimmedName)) {
      newErrors.name = "Forbidden characters detected: < > \" ' { } [ ] \\ | / $ ` %";
    } else if (/(?:\b(SELECT|DROP|INSERT|UPDATE|DELETE|UNION|ALTER|CREATE|TRUNCATE|EXEC|CAST|CONVERT|DECLARE|SCRIPT|XP_|SP_)\b)/i.test(trimmedName)) {
      newErrors.name = "Invalid keywords detected (SQL injection blocked).";
    } else if (/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F02F}\u{200D}\u{2060}-\u{206F}\u{FE0F}]/u.test(trimmedName)) {
      newErrors.name = "Emojis are not allowed in department names.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(newErrors.name || "Please correct the errors.");
    }

    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetchDepartment();
  }, [id]);

  const fetchDepartment = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/department/getDepartmentById?id=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setName(response.data.name || "");
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load department.");
      console.error(error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const loadingToast = toast.loading("Updating department...");

    // Sanitize before sending
    const sanitizedName = name.trim()
      .replace(/[<>"'{}[\]\\|/$`%]/g, "")
      .replace(/\s+/g, " ");

    try {
      const token = getCookie("token");
      await axios.put(
        `/api/department/updateDepartmentById?id=${id}`,
        { name: sanitizedName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Department updated successfully!", { id: loadingToast });
      setTimeout(() => navigate("/departmentList"), 1000);
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to update department.";
      toast.error(msg, { id: loadingToast });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading department...</div>;
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <div className="w-full p-2">
        <nav className="text-sm breadcrumbs">
          <Link to="/" className="text-gray-400 hover:text-gray-600">Dashboard</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/departmentList" className="text-gray-400 hover:text-gray-600">Departments</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="font-semibold text-gray-700">Edit Department</span>
        </nav>
      </div>

      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Edit Department</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Social Media Marketing"
              className={`w-full max-w-lg px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 transition ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 flex items-start">
                <span className="mr-1">Warning</span>
                {errors.name}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Allowed: Letters, spaces, hyphens (-), ampersand (&), parentheses (). Max 100 characters.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
            >
              Update Department
            </button>
            <Link
              to="/departmentList"
              className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded hover:bg-gray-400 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditDepartment;