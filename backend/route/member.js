const express = require("express");
const router = express.Router();
const mongoose =require('mongoose');
// import userRegistration  from "../controller/userController.js";
const fs = require('fs');
const path = require('path');

const {
    memberRegistration,
    memberLogin,
    sendmemberPasswordResetEmail,
    memberPasswordReset,
    logoutmember,
    getmemberById,getAllmember,
    Totalmember,
    updatememberById,
    deletememberById,
    getAllmemberDropdown,
    isMemberVerify,
    getMemberByRef,
    getApprovedMember,
    getMemberApprovedData,
    getMemberPendingData,verifyMemberSessions,  
    adminMemberRegistration,countApprovedMember
} = require("../controller/member.js");
const { generatePdfMiddleware } = require('../middeleware/pdfUpload'); 
const { requireAuth , authMiddleware } = require("../middeleware/requireAuth.js");

//public Routes
router.post("/register",generatePdfMiddleware, memberRegistration);
router.get("/countApprovedMember",countApprovedMember);
router.get("/getPendingMember", authMiddleware,getMemberPendingData);
router.post("/login", memberLogin);
router.get("/verify-session", verifyMemberSessions); 
router.post("/member-register",generatePdfMiddleware, adminMemberRegistration);
router.post("/forgot-password", sendmemberPasswordResetEmail);
router.post("/reset-password", memberPasswordReset);
router.post("/logout", logoutmember);
router.get("/getUserById", getmemberById);
router.get("/getMemberApprovedData",authMiddleware, getMemberApprovedData);
router.get("/getApprovedMember",authMiddleware, getApprovedMember);
router.get("/isMemberVerify",authMiddleware, isMemberVerify);
router.get("/getAllmember",authMiddleware, getAllmember);
router.get("/totalmember",Totalmember);
router.get("/getMemberByRef",authMiddleware,getMemberByRef);
router.get("/getAllmemberDropdown",requireAuth,getAllmemberDropdown);
router.put("/updatememberById" ,generatePdfMiddleware,updatememberById);
router.delete("/deletememberById",authMiddleware, deletememberById);
// export default router;


// Define route to download all collections



module.exports = router;
