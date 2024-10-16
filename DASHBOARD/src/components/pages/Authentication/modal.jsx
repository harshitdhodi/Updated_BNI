/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import axios from "axios";

export default function Modal({ open, onClose, userData, setUserData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photo: "",
  });
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  };
  useEffect(() => {
    if (open) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        photo: userData.photo || "",
      });
      setIsEditing(true);
    }
  }, [open, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      photo: e.target.files[0],
    }));
  };

  const handleFormSubmit = async () => {
    try {
      const token = getCookie("token");
      const formDataObj = new FormData();
      formDataObj.append("firstName", formData.firstName);
      formDataObj.append("lastName", formData.lastName);
      formDataObj.append("email", formData.email);
      formDataObj.append("photo", formData.photo);

      const response = await axios.put("/api/user/updateUser", formDataObj, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("User updated successfully:", response.data);

      // Update userData in Navbar component
      setUserData(response.data.data);

      onClose();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: "w-full max-w-2xl h-full max-h-3/4 " }}
    >
      <DialogTitle className="text-xl font-semibold">My Account</DialogTitle>
      <DialogContent className="space-y-4">
        {isEditing ? (
          <>
            <TextField
              autoFocus
              margin="dense"
              name="firstName"
              label="First Name"
              type="text"
              fullWidth
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-4"
              inputProps={{
                className: "p-2 border border-gray-300 rounded-md",
              }}
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              type="text"
              fullWidth
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-4"
              inputProps={{
                className: "p-2 border border-gray-300 rounded-md",
              }}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
              className="mt-4"
              inputProps={{
                className: "p-2 border border-gray-300 rounded-md",
              }}
            />
            <div className="mt-4">
              <label className="block relative top-4 left-4 bg-white w-fit p-1 text-sm font-medium text-gray-700">
                Select Photo
              </label>
              <input
                name="photo"
                type="file"
                onChange={handleFileChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              />
              {userData.photo && (
                <img
                  src={`/api/image/download/${userData.photo}`}
                  alt="Selected"
                  className="mt-4 h-40 w-40 object-cover border border-gray-300 rounded-md"
                />
              )}
            </div>
          </>
        ) : (
          <>
            <p>
              <strong>First Name:</strong> {userData.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {userData.lastName}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Image:</strong> {userData.photo}
            </p>
            {/* Add more user data fields as necessary */}
          </>
        )}
      </DialogContent>
      <DialogActions className="flex justify-between p-4">
        {isEditing ? (
          <>
            <Button
              onClick={handleFormSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Save
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Update
          </Button>
        )}
        <Button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
