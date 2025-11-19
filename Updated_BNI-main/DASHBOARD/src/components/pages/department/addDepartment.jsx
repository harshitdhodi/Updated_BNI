import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

const CreateDepartment = () => {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  // Comprehensive validation function
  const validate = () => {
    const newErrors = {};
    const trimmedName = name.trim();
    const maxLength = 100;

    // Empty check
    if (!trimmedName) {
      newErrors.name = "Department name is required.";
    }
    // Length check
    else if (trimmedName.length < 2) {
      newErrors.name = "Department name must be at least 2 characters long.";
    }
    else if (trimmedName.length > maxLength) {
      newErrors.name = `Department name cannot exceed ${maxLength} characters.`;
    }
    // Block purely numeric
    else if (/^\d+$/.test(trimmedName)) {
      newErrors.name = "Department name cannot consist of only numbers.";
    }
    // Block names starting with number or special char
    else if (/^[\d\W]/.test(trimmedName)) {
      newErrors.name = "Department name cannot start with a number or special character.";
    }
    // Block dangerous HTML/JS tags and scripts (XSS prevention)
    else if (/<script[\s\S]*?>[\s\S]*?<\/script>/i.test(trimmedName) || /on\w+\s*=/i.test(trimmedName)) {
      newErrors.name = "Script tags or event handlers are not allowed.";
    }
    // Block common dangerous characters: < > " ' { } [ ] \ / | ` $
    else if (/[<>"'{}[\]\\|/$`%]/.test(trimmedName)) {
      newErrors.name = "Department name contains forbidden characters: < > \" ' { } [ ] \\ | / $ ` %";
    }
    // Block SQL injection keywords (common ones)
    else if (/(?:\b(SELECT|DROP|INSERT|UPDATE|DELETE|UNION|ALTER|CREATE|TRUNCATE|EXEC|CAST|CONVERT|DECLARE|SCRIPT|XP_|SP_)\b)/i.test(trimmedName)) {
      newErrors.name = "Invalid keywords detected (SQL injection attempt blocked).";
    }
    // Block emojis and zero-width characters
    else if (/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{1F000}-\u{1F02F}\u{200D}\u{2060}-\u{206F}\u{FE0F}]/u.test(trimmedName)) {
      newErrors.name = "Emojis are not allowed in department names.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(newErrors.name || "Please fix the errors above.");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const loadingToast = toast.loading("Creating department...");

    // Final sanitized value (extra safety)
    const sanitizedName = name.trim()
      .replace(/[<>"'{}[\]\\|/$`%]/g, "")
      .replace(/\s+/g, " ");

    const departmentData = { name: sanitizedName };

    try {
      const token = getCookie("token");
      await axios.post(
        "/api/department/addDepartment",
        departmentData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success("Department created successfully!", { id: loadingToast });
      setTimeout(() => {
        navigate("/departmentList");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create department.";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div className="w-full p-2">
        <nav>
          <Link to="/" className="mr-2 text-gray-400 hover:text-gray-500">
            Dashboard /
          </Link>
          <Link to="/departmentList" className="mr-2 text-gray-400 hover:text-gray-500">
            Departments /
          </Link>
          <span className="font-semibold text-gray-600">Insert Department</span>
        </nav>
      </div>

      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Create Department</h1>

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
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 flex items-start">
                <span className="mr-1">⚠</span>
                {errors.name}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Allowed: Letters, spaces, hyphens (-), ampersand (&amp;), parentheses (). Max 100 characters.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition"
            >
              Save Department
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

export default CreateDepartment;