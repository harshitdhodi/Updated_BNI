// routes/countryRoutes.js
const express = require('express');
const router = express.Router();
const {addCity,
    getCity,
    getCityById,
    updateCityById,
    deleteCityById,TotalCity, getAllCity,getCityByCountry} = require('../controller/city');
const { route } = require('./chapter');
const { requireAuth ,authMiddleware  } = require('../middeleware/requireAuth');
router.post('/addCity',authMiddleware , addCity);
router.get('/getCity' , getCity);
router.get('/getCityById', getCityById);
router.put('/updateCity',authMiddleware , updateCityById);
router.delete('/deleteCity',authMiddleware , deleteCityById);
router.get('/totalCity',authMiddleware ,TotalCity)
router.get('/getAllCity',getAllCity)
router.get('/getCityByCountry' ,getCityByCountry)
module.exports = router;
