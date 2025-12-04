const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const { createBusiness, getbusiness,businessList,deletebusiness,Totalbusiness ,updateBusinessById, getbusinessByuserId,getbusinessbyId, updateImages,updateContactLinks , updateBusinessDetails,updateBusinessProfile, createBusinessProfile } = require('../controller/business'); // Adjust the path as needed
const  upload  = require('../middeleware/businessImage');
const { generatePdfMiddleware } = require('../middeleware/pdfUpload');
const { requireAuth,authMiddleware } = require('../middeleware/requireAuth');
const router = express.Router();
const {bearerAuth} = require('../middeleware/BearerAuth')
const Business = require('../model/business')
const uploadFields = upload.fields([
  { name: 'profileImg', maxCount: 1 },
  { name: 'bannerImg', maxCount: 1 }
]);
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
router.put("/updateBusinessProfile",uploadFields,updateBusinessProfile)
router.put("/updateContactLinks",authMiddleware,updateContactLinks)
router.put("/updateBusinessDetails",updateBusinessDetails)
// router.put("/updateBusinessDetails",authMiddleware,updateBusinessDetails)
router.get("/businesssList",authMiddleware,businessList)
router.get("/getbusinessbyId",authMiddleware,getbusinessbyId)
router.put("/updateBusinessById",generatePdfMiddleware,generatePdfMiddleware,updateBusinessById)
router.get("/getbusinessbymyId",getbusinessbyId)
router.get("/totalbusiness",authMiddleware,Totalbusiness)
router.delete("/deletebusiness",deletebusiness)
router.post('/createProfile', upload.fields([{ name: 'profileImg', maxCount: 1 }, { name: 'bannerImg', maxCount: 1 }, { name: 'catalog', maxCount: 1 }]), createBusinessProfile);

   
  
module.exports = router;
  