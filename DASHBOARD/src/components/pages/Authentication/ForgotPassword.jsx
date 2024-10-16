import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import axios from "axios"; // Import axios

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getCookie("token");
      const response = await axios.post("/api/user/forgot-password", { email }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },      withCredentials: true,
      });

      if (response.status === 200) {
        console.log("Email submitted:", email);
        setEmail(""); // Reset email field after submission
        navigate("/setPassword"); // Redirect to setPassword component
      } else {
        console.error("Failed to send email");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto m-8 p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:border-blue-500"
            placeholder="Your email address"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:bg-blue-600 focus:outline-none"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
