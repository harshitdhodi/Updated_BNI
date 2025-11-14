const express = require("express");
const router = express.Router();
const mongoose =require('mongoose');
// import userRegistration  from "../controller/userController.js";
const fs = require('fs');
const path = require('path');

const {
  userRegistration,
  logoutUser,
  userLogin,
  sendUserPasswordResetEmail,
  userPasswordReset,
  getUserById,
  updateUserById
} = require("../controller/user.js");
const {uploadPhoto} = require('../middeleware/imageUpload');
const { requireAuth , authMiddleware} = require("../middeleware/requireAuth.js");

//public Routes
router.post("/register",uploadPhoto, userRegistration);
router.post("/login", userLogin);
router.post("/forgot-password", sendUserPasswordResetEmail);
router.post("/reset-password", userPasswordReset);
router.post("/logout", logoutUser);
router.get("/getUserById",requireAuth, getUserById);
router.put("/updateUser",requireAuth,uploadPhoto, updateUserById);
// export default router;


// Define route to download all collections



module.exports = router;
