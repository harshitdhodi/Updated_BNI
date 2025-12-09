import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, email, ref_member, mobile, password, confirm_password } = formData;

    const namePattern = /^[a-zA-Z'-\s]+$/;
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    } else if (!namePattern.test(name)) {
      newErrors.name = "Invalid name format";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!ref_member.trim()) {
      newErrors.ref_member = "Referral code is required";
    }

    const mobilePattern = /^[6-9]\d{9}$/;
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!mobilePattern.test(mobile)) {
      newErrors.mobile = "Invalid 10-digit number";
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!passwordPattern.test(password)) {
      newErrors.password = "Must be 8+ chars with uppercase, lowercase, number & special char";
    }

    if (!confirm_password) {
      newErrors.confirm_password = "Please confirm password";
    } else if (password !== confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form submitted:", formData);
      alert("Registration successful! (Demo)");
      setIsLoading(false);
    }, 2000);
  };

  const InputField = ({ icon: Icon, label, name, type = "text", placeholder, maxLength }) => (
    <div className="w-full">
      <label className="block text-gray-700 text-sm font-semibold mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          className={`pl-10 pr-4 w-full py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors[name] 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          type={type}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          maxLength={maxLength}
        />
      </div>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>
      )}
    </div>
  );

  const PasswordField = ({ label, name, show, setShow }) => (
    <div className="w-full">
      <label className="block text-gray-700 text-sm font-semibold mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          className={`pl-10 pr-12 w-full py-2.5 sm:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors[name] 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          type={show ? "text" : "password"}
          name={name}
          placeholder={`Enter ${label.toLowerCase()}`}
          value={formData[name]}
          onChange={handleChange}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="grid lg:grid-cols-2">
          {/* Branding Section - Hidden on mobile */}
          <div className="hidden lg:flex bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 xl:p-12 text-white flex-col justify-between">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold mb-4">Join Our Network</h1>
              <p className="text-blue-100 text-lg leading-relaxed">
                Create an account to connect, collaborate, and grow your business with our global community.
              </p>
           
            </div>
            <div className="pt-8">
              <p className="text-sm text-blue-200">
                © {new Date().getFullYear()} BCONN Global. All Rights Reserved.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="w-full px-5 sm:px-8 lg:px-10 xl:px-12 py-6 sm:py-8 lg:py-10">
            {/* Mobile Header */}
            <div className="lg:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-3">
                <UserPlus className="text-white" size={32} />
              </div>
            </div>

            <div className="text-center lg:text-left mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Create Account
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">
                Let's get you started!
              </p>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {/* Two Column Grid on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <InputField
                  icon={User}
                  label="Full Name"
                  name="name"
                  placeholder="John Doe"
                />
                
                <InputField
                  icon={Mail}
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
                
                <InputField
                  icon={UserPlus}
                  label="Referral Code"
                  name="ref_member"
                  placeholder="Enter referral code"
                />
                
                <InputField
                  icon={Phone}
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  placeholder="9876543210"
                  maxLength={10}
                />
                
                <PasswordField
                  label="Password"
                  name="password"
                  show={showPassword}
                  setShow={setShowPassword}
                />
                
                <PasswordField
                  label="Confirm Password"
                  name="confirm_password"
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 sm:pt-4">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 sm:py-3.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2" size={20} />
                      Register
                    </>
                  )}
                </button>
              </div>

              {/* Login Link */}
              <p className="text-center text-sm text-gray-600 pt-2">
                Already have an account?{" "}
                <Link
                  to="login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Login here
                </Link>
              </p>

              {/* Mobile Footer */}
              <div className="lg:hidden text-center pt-4 border-t border-gray-200 mt-6">
                <p className="text-xs text-gray-500">
                  © {new Date().getFullYear()} BCONN Global. All Rights Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;