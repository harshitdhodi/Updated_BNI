const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { createBusiness, getbusiness,businessList,deletebusiness,Totalbusiness ,updateBusinessById, getbusinessByuserId,getbusinessbyId, updateImages,updateContactLinks , updateBusinessDetails } = require('../controller/business'); // Adjust the path as needed
const { uploadPdf } = require('../middeleware/pdf2');
const { generatePdfMiddleware } = require('../middeleware/pdfUpload');
const { requireAuth,authMiddleware } = require('../middeleware/requireAuth');
const router = express.Router();
const {bearerAuth} = require('../middeleware/BearerAuth')
const Business = require('../model/business')
// const {base64ImageHandler} = require('../middeleware/pdf2')
// Set up storage engine for multer
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// Route to create business profile
router.post('/create',generatePdfMiddleware, authMiddleware,createBusiness);

router.get("/getbusiness",authMiddleware,getbusiness)
router.get("/getbusinessByuserId"  ,getbusinessByuserId)
// router.put("/updateImg",base64ImageHandler,uploadimages,bearerAuth,updateImages)
router.put("/updateContactLinks",authMiddleware,updateContactLinks)
router.put("/updateBusinessDetails",updateBusinessDetails)
// router.put("/updateBusinessDetails",authMiddleware,updateBusinessDetails)
router.get("/businesssList",authMiddleware,businessList)
router.get("/getbusinessbyId",authMiddleware,getbusinessbyId)
router.put("/updateBusinessById",generatePdfMiddleware,generatePdfMiddleware,updateBusinessById)
router.get("/getbusinessbymyId",getbusinessbyId)
router.get("/totalbusiness",authMiddleware,Totalbusiness)
router.delete("/deletebusiness",deletebusiness)
// Updated route to accept user parameter
router.post('/createProfile',  generatePdfMiddleware, async (req, res) => {
    try {
        // Log uploaded files and request query
        console.log('Files:', req.files);
        console.log('Request Query:', req.query);

        // Destructure the fields from req.body
        const {
            industryName,
            whatsapp,
            facebook,
            linkedin,
            twitter,
            designation,
            aboutCompany,
            companyName,
            companyAddress
            ,mobile,email
        } = req.body;

        // Extract user ID from req.query (fix the query parameter name)
        const userId = req.query.userId;  // Corrected

        // Log extracted userId
        console.log('Extracted User ID:', userId);

        // Check if userId is present
        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required in the query parameter'
            });
        }

        // Extract filenames from uploaded files using req.files, fallback to null if not present
        const bannerImg = req.files?.bannerImg ? path.basename(req.files.bannerImg[0].path) : null;
        const profileImg = req.files?.profileImg ? path.basename(req.files.profileImg[0].path) : null;
        const catalog = req.files?.catalog ? path.basename(req.files.catalog[0].path) : null;

        // Create a new Business profile instance
        const newProfile = new Business({
            bannerImg,
            profileImg,
            industryName,
            whatsapp,
            facebook,
            linkedin,
            twitter,
            mobile,
            email,
            designation,
            aboutCompany,
            companyAddress,
            companyName,
            user: userId, // Ensure user ID is linked correctly
            catalog
        });

        // Save the new profile to the database
        const savedProfile = await newProfile.save();

        // Respond with success
        res.status(200).json({
            message: 'Profile created successfully',
            profile: savedProfile
        });
    } catch (error) {
        // Handle any errors and respond with 500 status
        res.status(500).json({
            message: 'An error occurred while creating the profile',
            error: error.message
        });
    }
});


   
  
module.exports = router;
  