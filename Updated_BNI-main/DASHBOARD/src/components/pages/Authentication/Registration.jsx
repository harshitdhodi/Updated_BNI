import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from "axios";
import { User, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, Phone } from 'lucide-react';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    ref_member: "",
    mobile: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear the error for the field being edited
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, email, mobile, password, confirm_password } = formData;

    if (!name.trim()) newErrors.name = "Full name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!mobilePattern.test(mobile)) {
      newErrors.mobile = "Invalid mobile number. Please enter a valid 10-digit number.";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!confirm_password) {
      newErrors.confirm_password = "Please confirm your password";
    } else if (password !== confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token = getCookie("token");
      const response = await axios.post("/api/member/register", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("Form submitted successfully:", response.data);
      alert("Registration successful! Please login.");
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-5xl m-4 bg-gradient-to-r from-blue-100 to-blue-50 shadow-2xl rounded-2xl overflow-hidden"> 
        {/* Branding Section */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 text-white flex-col justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-3">Join Our Network</h1>
            <p className="text-blue-100">Create an account to connect, collaborate, and grow your business.</p>
          </div>
          <div>
            <p className="text-sm text-blue-200">© {new Date().getFullYear()} BNI Global. All Rights Reserved.</p>
          </div>
        </div>

        {/* Form Section */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-8">Let's get you started!</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input className={`pl-10 w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
              </div>
              {errors.name && <p className="text-red-500 text-xs italic mt-2">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input className={`pl-10 w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              </div>
              {errors.email && <p className="text-red-500 text-xs italic mt-2">{errors.email}</p>}
            </div>

            {/* Referral Code Input */}
            {/* <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Referral Code (Optional)</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className="pl-10 w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-500"
                  type="text" name="ref_member" placeholder="Enter referral code" value={formData.ref_member} onChange={handleChange}
                />
              </div>
            </div> */}

            {/* Mobile Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  className={`pl-10 w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errors.mobile ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                  type="tel" name="mobile" placeholder="e.g., 9876543210" value={formData.mobile} onChange={handleChange} maxLength={10}
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs italic mt-2">{errors.mobile}</p>}
            </div>
            {/* Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input className={`pl-10 w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} type={showPassword ? "text" : "password"} name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs italic mt-2">{errors.password}</p>}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-gray-700 text-sm font-semibold mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input className={`pl-10 w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 ${errors.confirm_password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} type={showConfirmPassword ? "text" : "password"} name="confirm_password" placeholder="Re-enter your password" value={formData.confirm_password} onChange={handleChange} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs italic mt-2">{errors.confirm_password}</p>}
            </div>

            {/* Submit Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 flex items-center justify-center disabled:bg-blue-400" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Creating Account...
                </>
              ) : (
                "Register"
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-600 mt-8">
              Already have an account?{" "}
              <Link className="font-semibold text-blue-600 hover:underline" to="/">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
