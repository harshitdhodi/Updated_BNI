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
    password: ""
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photo: "",
    password: ""
  });
  const [photoPreview, setPhotoPreview] = useState("");

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
        password: ""
      });
      setErrors({
        firstName: "",
        lastName: "",
        email: "",
        photo: "",
        password: ""
      });
      setPhotoPreview("");
      setIsEditing(true);
    }
  }, [open, userData]);

  // Validation functions
  const validateName = (name, fieldName) => {
    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[A-Za-z\s'-]+$/;
    
    if (!name.trim()) {
      return `${fieldName} is required.`;
    }
    
    if (!nameRegex.test(name)) {
      return "Invalid name format. Please enter a valid name.";
    }
    
    if (name.trim().length < 2) {
      return `${fieldName} must be at least 2 characters long.`;
    }
    
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      return "Email is required.";
    }
    
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    
    return "";
  };

  const validatePhoto = (file) => {
    if (!file) {
      return "";
    }

    // Check if it's a File object
    if (!(file instanceof File)) {
      return "";
    }

    // Allowed image types
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    
    // Get file extension
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    // Validate file type
    if (!allowedTypes.includes(file.type) || !hasValidExtension) {
      return "Invalid file type. Please upload an image (.jpg, .png, .jpeg, .gif, .webp).";
    }
    
    // Optional: Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return "File size must be less than 5MB.";
    }
    
    return "";
  };

  const validatePassword = (password) => {
    // Password is optional, but if provided, it should meet certain criteria
    if (!password) {
      return ""; // Empty password is allowed (means no change)
    }
    
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Real-time validation
    let error = "";
    if (name === "firstName") {
      error = validateName(value, "First Name");
    } else if (name === "lastName") {
      error = validateName(value, "Last Name");
    } else if (name === "email") {
      error = validateEmail(value);
    } else if (name === "password") {
      error = validatePassword(value);
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate the file
      const error = validatePhoto(file);
      
      setErrors((prevErrors) => ({
        ...prevErrors,
        photo: error,
      }));

      if (!error) {
        // Create preview URL for valid images
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
        
        setFormData((prevState) => ({
          ...prevState,
          photo: file,
        }));
      } else {
        // Clear file input if invalid
        e.target.value = "";
        setPhotoPreview("");
        setFormData((prevState) => ({
          ...prevState,
          photo: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: validateName(formData.firstName, "First Name"),
      lastName: validateName(formData.lastName, "Last Name"),
      email: validateEmail(formData.email),
      photo: validatePhoto(formData.photo),
      password: validatePassword(formData.password),
    };

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleFormSubmit = async () => {
    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    try {
      const token = getCookie("token");
      const formDataObj = new FormData();
      formDataObj.append("firstName", formData.firstName);
      formDataObj.append("lastName", formData.lastName);
      formDataObj.append("email", formData.email);
      
      // Only append photo if it's a new file
      if (formData.photo instanceof File) {
        formDataObj.append("photo", formData.photo);
      }

      // Only append password if it's being changed
      if (formData.password) {
        formDataObj.append("password", formData.password);
      }

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

      // Clean up preview URL
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }

      onClose();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user details:", error);
      // Show error message to the user
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("An error occurred while updating your profile. Please try again.");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Clean up preview URL
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
  };

  const handleClose = () => {
    // Clean up preview URL
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
              error={!!errors.firstName}
              helperText={errors.firstName}
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
              error={!!errors.lastName}
              helperText={errors.lastName}
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
              error={!!errors.email}
              helperText={errors.email}
              className="mt-4"
              inputProps={{
                className: "p-2 border border-gray-300 rounded-md",
              }}
            />
            <TextField
              margin="dense"
              name="password"
              label="New Password (leave blank to keep current)"
              type="password"
              fullWidth
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
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
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md"
              />
              {errors.photo && (
                <p className="mt-2 text-sm text-red-600">{errors.photo}</p>
              )}
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="mt-4 h-40 w-40 object-cover border border-gray-300 rounded-md"
                />
              )}
              {!photoPreview && userData.photo && (
                <img
                  src={`/api/image/download/${userData.photo}`}
                  alt="Current"
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
          onClick={handleClose}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}