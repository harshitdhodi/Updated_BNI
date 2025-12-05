import React, { useState } from "react";
import axios from "axios";
import {  Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, X } from "lucide-react";

// A simple, reusable modal component for displaying messages
const InfoModal = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all relative">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
            <ShieldCheck className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
          <p className="text-gray-600 mb-8">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
          >
            Got it, thanks!
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let hasErrors = false;
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      hasErrors = true;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Attempt 1: Login as a member
      const response = await axios.post(
        "/api/member/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        // SUCCESS: Member login successful.
        const { member } = response.data;
        setIsLoading(false);
        window.location.href = `/member/${member._id}`;
        return; // Stop execution
      }
      // If member login was not successful, fall through to attempt user login.
    } catch (error) {
      // Check for the specific "pending approval" error
      if (error.response && error.response.status === 403) {
        setModalInfo({
          visible: true,
          title: "Account Pending Approval",
          message: error.response.data.message,
        });
        setIsLoading(false);
        return; // Stop the login process
      }
      // For other errors (like wrong password), we'll proceed to the admin login attempt.
      console.log("Member login failed, proceeding to user login attempt.");
    }

    // Attempt 2: Login as a user (admin)
    try {
      const userResponse = await axios.post(
        "/api/user/login",
        { email, password },
        { withCredentials: true }
      );
      if (userResponse.data.status === "success") {
        window.location.href = "/";
      }
    } catch (userError) {
      console.error("User login also failed:", userError);
      alert("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {modalInfo.visible && (
        <InfoModal
          title={modalInfo.title}
          message={modalInfo.message}
          onClose={() => setModalInfo({ ...modalInfo, visible: false })}
        />
      )}
      <div className="w-full max-w-5xl m-4 bg-white shadow-2xl rounded-2xl flex overflow-hidden">
        {/* Branding Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Welcome Back!</h1>
            <p className="text-blue-100">
              Sign in to access your dashboard and connect with your network.
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-200">© {new Date().getFullYear()} BCONN Global. All Rights Reserved.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 bg-gradient-to-r from-blue-100 to-blue-50 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-500 mb-8">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className={`pl-10 w-full py-3 px-4 border rounded-lg leading-tight focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs italic mt-2">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-700 text-sm font-semibold">
                  Password
                </label>
                <Link className="text-sm text-blue-600 hover:underline" to="/forgotPassword">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className={`pl-10 w-full py-3 px-4 border rounded-lg leading-tight focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs italic mt-2">{errors.password}</p>}
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 flex items-center justify-center disabled:bg-blue-400"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600 mt-8">
              Not a member yet?{" "}
              <Link className="font-semibold text-blue-600 hover:underline" to="/registration">
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;