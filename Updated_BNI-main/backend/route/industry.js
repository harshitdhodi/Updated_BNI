const express = require('express');
const router = express.Router();

const {createIndustry , getAllIndustries ,getIndustries, getIndustryById ,updateIndustry ,deleteIndustry} = require('../controller/industry')
const { requireAuth,  authMiddleware } = require('../middeleware/requireAuth');
router.post('/addIndustry',authMiddleware,createIndustry);
router.get('/getAllIndustry' , getAllIndustries);
router.get('/getIndustries' ,authMiddleware , getIndustries);
router.get('/getIndustryById' ,authMiddleware , getIndustryById);
router.put('/updateIndustry',authMiddleware , updateIndustry);
router.delete('/deleteIndustry',authMiddleware , deleteIndustry);

module.exports = router;
