import axios from "axios";
import React, { useEffect, useState } from "react";
import { MoreVertical, LogOut, Lock, User, ChevronDown } from 'lucide-react';
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ toggleSidebar }) {
  const [userData, setUserData] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };

  const fetchUserData = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/user/getUserById`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setUserData(response.data.data || {});
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const token = getCookie("token");
      await axios.post("/api/user/logout", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log("User logged out successfully");
      Cookies.remove("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleMyAccount = () => {
    setDropdownOpen(false);
    navigate("/account");
  };

  return (
    <div className="w-full">
      <nav className="flex justify-between items-center px-6 py-4 h-16 bg-white border-b border-gray-300 shadow-md">
        <div className="flex gap-6 items-center">
          <MoreVertical
            onClick={toggleSidebar}
            className="block lg:hidden cursor-pointer text-gray-700 hover:text-blue-600 transition-colors duration-200"
            size={24}
            strokeWidth={1.5}
          />
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
            >
              {userData?.firstName && (
                <p className="text-gray-800 font-semibold text-sm hidden sm:block">
                  {userData.firstName} {userData.lastName}
                </p>
              )}
              {userData?.photo ? (
                <img
                  src={`/api/image/download/${userData.photo}`}
                  alt="User Profile"
                  className="w-9 h-9 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                />
              ) : (
                <User size={28} className="text-gray-400" strokeWidth={1.5} />
              )}
              <ChevronDown size={16} className={`text-gray-600 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={handleMyAccount}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium border-b border-gray-100"
                >
                  <User size={18} strokeWidth={1.5} />
                  My Account
                </button>
                <Link
                  to="/forgotPassword"
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm font-medium border-b border-gray-100 no-underline"
                >
                  <Lock size={18} strokeWidth={1.5} />
                  Reset Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
                >
                  <LogOut size={18} strokeWidth={1.5} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
