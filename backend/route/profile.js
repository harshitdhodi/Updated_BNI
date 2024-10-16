const express = require('express');
const router = express.Router();
const { createProfile } = require('../controller/profile');
const { generatePdfMiddleware } = require('../middeleware/pdfUpload');
const { requireAuth ,authMiddleware } = require('../middeleware/requireAuth');
// POST route to create a new profile
router.put('/createProfile',authMiddleware , generatePdfMiddleware, createProfile);

module.exports = router;
