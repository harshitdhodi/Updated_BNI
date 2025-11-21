import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import axios from "axios"; // Import axios
import { Mail } from "lucide-react";

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
      const response = await axios.post("/api/member/forgot-password", { email }, {
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md m-4 bg-gradient-to-r from-blue-100 to-blue-50 shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password</h2>
          <p className="text-gray-500 mb-8">Enter your email to reset your password.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className="pl-10 w-full py-3 px-4 border rounded-lg leading-tight focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
