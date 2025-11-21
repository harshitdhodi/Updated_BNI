import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import useNavigate and Link from react-router-dom
import axios from "axios"; // Import axios
import { Lock, Key, Eye, EyeOff } from "lucide-react";

const SetPasswordForm = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // New state for confirm password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirm password visibility
  const navigate = useNavigate(); // Initialize useNavigate
  const [errors, setErrors] = useState({}); // State to hold validation errors

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    const newErrors = {};
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!otp.trim()) {
      newErrors.otp = "OTP is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (!passwordPattern.test(newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm password is required.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Prevent form submission if there are errors
    }

    try {
      const token = getCookie("token");
      const response = await axios.post("/api/member/reset-password", { otp, newPassword }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        alert("Password reset successfully! Please log in with your new password.");
        // Redirect to login component after successful submission
        navigate("/");
      } else {
        setErrors({ general: response.data?.message || "Failed to reset password." });
      }
    } catch (error) {
      setErrors({ general: error.response?.data?.message || "An error occurred. Please try again." });
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md m-4 bg-gradient-to-r from-blue-100 to-blue-50 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h2>
          <p className="text-gray-500 mb-8">Enter the OTP and your new password.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                One-Time Password (OTP)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className="pl-10 w-full py-3 px-4 border rounded-lg leading-tight focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  type="text"
                  placeholder="Enter OTP from your email"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setErrors((prev) => ({ ...prev, otp: null })); // Clear error on change
                  }}
                  required
                />
              </div>
              {errors.otp && <p className="text-red-500 text-xs italic mt-2">{errors.otp}</p>}
            </div>

            {/* New Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className="pl-10 w-full py-3 px-4 border rounded-lg leading-tight focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, newPassword: null })); // Clear error on change
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-red-500 text-xs italic mt-2">{errors.newPassword}</p>}
            </div>

            {/* Confirm New Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className="pl-10 w-full py-3 px-4 border rounded-lg leading-tight focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, confirmPassword: null })); // Clear error on change
                  }}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs italic mt-2">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
              type="submit"
            >
              Set Password
            </button>
            {errors.general && <p className="text-red-500 text-sm italic mt-4 text-center">{errors.general}</p>}
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Remember your password?{" "}
            <Link className="font-semibold text-blue-600 hover:underline" to="/">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordForm;
