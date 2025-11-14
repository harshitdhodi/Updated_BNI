import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaUserCircle, FaShieldAlt } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import Logout from "@mui/icons-material/Logout";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Cookies from "js-cookie";
import { Link, useNavigate, useParams } from "react-router-dom";
import Modal from "./pages/Authentication/modal"; // Adjust the import path as necessary

export default function Navbar({ toggleSidebar }) {
  const [userData, setUserData] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  // Fetch user data function
  const fetchUserData = async () => {
    try {
      const token = getCookie("token");
      const response = await axios.get(`/api/user/getUserById`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      setUserData(response.data.data || {}); // Ensure userData is an object
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // useEffect to fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle click on user icon to open menu
  const handleUserIconClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle close menu
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const token = getCookie("token");
      await axios.post("/api/user/logout" ,  {
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

  // Handle My Account click to open modal
  const handleMyAccountClick = async () => {
    try {
      await fetchUserData();
      setIsModalOpen(true);
      handleClose(); // Close the menu when opening the modal
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="w-full">
      <nav className="flex justify-between mt-2 mr-2 px-10 h-[1.5cm] shadow-red-300 shadow-md bg-white items-center border border-white rounded-full">
        <div className="flex gap-6 items-center">
          <GiHamburgerMenu
            onClick={toggleSidebar}
            className="block lg:hidden cursor-pointer text-black"
          />
        </div>
        <div className="flex gap-8 items-center">
          <div
            className="flex items-center cursor-pointer"
            onClick={handleUserIconClick}
          >
            {userData?.firstName && (
              <p className="text-black mr-2">
                {userData.firstName} {userData.lastName}
              </p>
            )}
            {userData?.photo ? (
              <img
                src={`/api/image/download/${userData.photo}`}
                alt="User Profile"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <FaUserCircle size={30} className="text-red-500" />
            )}
          </div>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {userData && (
              <MenuItem onClick={handleMyAccountClick}>
                <ListItemIcon>
                  <PersonAdd fontSize="small" />
                </ListItemIcon>
                My Account
              </MenuItem>
            )}
            <MenuItem>
              <ListItemIcon>
                <FaShieldAlt fontSize="large" />
              </ListItemIcon>
              <Link to="/forgotPassword">Reset Password</Link>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" className="text-red-500" />
              </ListItemIcon>
              <h4 className="text-red-500">Logout</h4>
            </MenuItem>
          </Menu>
        </div>
      </nav>
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        userData={userData}
        setUserData={setUserData}
      />
    </div>
  );
}

