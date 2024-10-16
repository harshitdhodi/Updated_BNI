const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Specify the directory path for images
const uploadDir = path.join(__dirname, '../images');

// Check if the directory exists, create it if it doesn't
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Endpoint to download files
router.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(uploadDir, fileName);

    if (fs.existsSync(filePath)) {
        res.download(filePath, fileName, (err) => {
            if (err) {
                res.status(500).json({ message: 'Failed to download file' });
            }
        });
    } else {
        res.status(404).json({ message: 'File not found' });
    }
});

module.exports = router;
