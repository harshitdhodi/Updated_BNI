const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../images');

// Check if the directory exists, create it if it doesn't
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Define storage for uploaded photos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Save uploaded photos in the 'images' directory
    },
    filename: function (req, file, cb) {
        const fileName = `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`;
        console.log(`File uploaded: ${fileName}, Size: ${file.size} bytes`);
        cb(null, fileName);
    }
});

// Initialize multer with defined storage options
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
    fileFilter: function (req, file, cb) {
        // Check file types here if needed
        cb(null, true);
    },
}); 

// Middleware to handle image uploads
const generatePdfMiddleware = upload.fields([
    { name: 'bannerImg', maxCount: 1 },   // Single file upload for bannerImg
    { name: 'profileImg', maxCount: 1 },  // Single file upload for profileImg
    { name: 'catalog', maxCount: 1 },     // Single file upload for catalog (PDF)
]);
module.exports = {
    generatePdfMiddleware,
};
