const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create a custom storage engine for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory to save the text files
  },
  filename: (req, file, cb) => {
    const { fieldname } = file;
    const timestamp = Date.now();
    const ext = '.txt'; // Save as .txt file
    cb(null, `${fieldname}_${timestamp}${ext}`);
  }
});

// Initialize multer with the custom storage engine
const upload = multer({ storage });
const uploadimages = upload.fields([  
  { name: 'bannerImg', maxCount: 1 },   // Single file upload for bannerImg
  { name: 'profileImg', maxCount: 1 }]);
// Middleware to handle base64 images
const base64ImageHandler = (req, res, next) => {
  if (req.body.bannerImg) {
    req.files = req.files || {};
    req.files.bannerImg = {
      fieldname: 'bannerImg',
      buffer: Buffer.from(req.body.bannerImg, 'base64'),
    };
  }
  if (req.body.profileImg) {
    req.files = req.files || {};
    req.files.profileImg = {
      fieldname: 'profileImg',
      buffer: Buffer.from(req.body.profileImg, 'base64'),
    };
  }
  next(); 
};
module.exports = {
  base64ImageHandler,
  uploadimages
}; 
