const express = require('express');
const router = express.Router();
const {createCountry,getCountries,fetachAllCountries,getCountryById,updateCountry, deleteCountry,TotalCountry} = require('../controller/country');
const {uploadPhoto} = require('../middeleware/imageUpload');
const { requireAuth ,authMiddleware } = require('../middeleware/requireAuth');
// Routes for CRUD operations
router.post('/addCountry',authMiddleware,uploadPhoto, createCountry);
router.get('/getCountry', getCountries);
router.get('/getCountryById',authMiddleware, getCountryById);
router.put('/updateCountryById',authMiddleware,uploadPhoto, updateCountry);
router.delete('/deleteCountry',authMiddleware, deleteCountry);
router.get('/totalCountry',authMiddleware,TotalCountry)
router.get('/AllCountries',fetachAllCountries)
module.exports = router;
