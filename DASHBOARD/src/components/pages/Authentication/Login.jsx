import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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
    } else if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters long";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // First attempt: Login as a member
      const response = await axios.post(
        "/api/member/login",
        { email, password },
        { withCredentials: true }
      );
console.log("Member login response:", response.data);
      setIsLoading(false);
      if (response.data.status === "success") {
        // Assuming the response for a member includes their ID
        const { member } = response.data;
        // The server has set the httpOnly cookie. We just need to navigate.
        // A full page reload is best to re-trigger the App's session check.
        window.location.href = `/member/${member._id}`;
      } else {
        alert(response.data.message);
      } 
    } catch (error) {
      // If the first attempt is unauthorized (401), try the second endpoint
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.log("Member login failed, trying user login...");
        try {
          const token = Cookies.get("token"); // Simplified cookie retrieval
          const userResponse = await axios.post(
            "/api/user/login",
            { email, password },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              withCredentials: true,
            }
          );
          setIsLoading(false);
          if (userResponse.data.status === "success") {
            const { token } = userResponse.data;
            // For admin, we can still set a client-side cookie if the backend doesn't set an httpOnly one for it.
            Cookies.set("userRole", "admin", { expires: 5 });
            window.location.href = "/";
          } else {
            alert(userResponse.data.message);
          }
        } catch (userError) {
          console.error("User login failed:", userError);
          setIsLoading(false);
          alert("Login failed. Please check your credentials.");
        }
      } else {
        // Handle other errors from the first API call (e.g., network error)
        console.error("Member login failed:", error);
        setIsLoading(false);
        alert("An error occurred during login.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen lg:px-[15rem] md:px-[10rem] sm:px-[8rem] px-[12px] shadow-2xl">
      <div className="flex flex-col justify-center items-center w-[11cm] bg-red-300 rounded-lg">
        <h2 className="text-red-600 text-2xl font-sans flex items-center justify-center font-bold px-5 mt-4">
          Login
        </h2>
        <form className="mt-8 w-3/4" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Email ID
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email}</p>
            )}
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <p className="text-red-500 text-xs italic">{errors.password}</p>
            )}
          </div>
          <button
            className="bg-red-600 hover:bg-red-900 hover:text-white border-[1px] border-red-900 text-white font-bold text-[20px] py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <div className="flex justify-between items-center mt-4 mb-2">
            <div>
              <Link
                className="text-red-500 text-sm hover:underline"
                to="/forgotPassword"
              >
                Forgot Password?
              </Link>
            </div>

            <div>
              Not a member?
              <Link
                className="text-red-500 text-sm hover:underline ml-2"
                to="/registration"
              >
                Signup here
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
