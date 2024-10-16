const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { Addcompany,getFilteredGives ,TotalCompany, getAllCompany,getNonExistingCompanyNames, getFilteredCompanyNames , getCompanyById ,updateCompanyById ,deleteCompany} = require("../controller/company");
const { generatePdfMiddleware } = require('../middeleware/pdfUpload');
const { requireAuth ,authMiddleware } = require('../middeleware/requireAuth');

router.post('/createCompany',requireAuth ,generatePdfMiddleware, Addcompany);
router.get("/getAllCompany" ,authMiddleware,getAllCompany )
router.get("/getCompanyById" ,authMiddleware,getCompanyById )
router.put("/updateCompanyById" ,authMiddleware,generatePdfMiddleware,updateCompanyById )
router.delete("/deleteCompany" ,authMiddleware,deleteCompany )
router.get("/getNonExistingCompanyNames" ,authMiddleware,getNonExistingCompanyNames )
router.get("/getFilteredCompanyNames" ,authMiddleware,getFilteredCompanyNames )
router.get("/getFilteredGives" ,authMiddleware,getFilteredGives )
router.get("/totalCompany" ,authMiddleware,TotalCompany )
module.exports = router;
