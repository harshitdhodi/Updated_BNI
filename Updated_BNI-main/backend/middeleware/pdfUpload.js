const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../images');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Custom file filter (optional but recommended)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
        'application/pdf'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only images and PDF allowed.`), false);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const fileName = `${file.fieldname}-${uniqueSuffix}${ext}`;
        cb(null, fileName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        // Important: Limit fields and parts to prevent DoS
        fields: 20,
        files: 3,
        parts: 25
    },
    fileFilter: fileFilter
});

// Critical: Error-handling middleware for multer
const multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ status: "failed", message: "File too large. Max 50MB allowed." });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ status: "failed", message: `Unexpected file field: ${err.field}` });
        }
        if (err.code === 'LIMIT_PART_COUNT' || err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ status: "failed", message: "Too many files uploaded." });
        }
    }

    if (err) {
        console.error("Multer Error:", err.message);
        return res.status(400).json({ status: "failed", message: err.message || "File upload failed" });
    }

    next();
};

// Your upload middleware (for create/edit)
const generatePdfMiddleware = upload.fields([
    { name: 'bannerImg', maxCount: 1 },
    { name: 'profileImg', maxCount: 1 },   // Fixed field name (was BusinessImg before?)
    { name: 'catalog', maxCount: 1 }
]);

// Export both
module.exports = {
    generatePdfMiddleware,
    multerErrorHandler   // Use this in your route!
};