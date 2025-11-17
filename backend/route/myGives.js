const express = require('express');
const router = express.Router();

const {addMyGives,getMyGivesByUserId,AddGivesByEmail,getMyGivesByCompanyAndDepartment,getFilteredGives,MyAllGives,getmyGivesById,updateMyGives,totalMyGives, deletemyGivesById} = require('../controller/myGives');
const { requireAuth , authMiddleware} = require('../middeleware/requireAuth');
const {getMyGivesBasedOnMyAsks} = require('../controller/myMatch')
router.post('/addMyGives',requireAuth,addMyGives);
router.get('/getMyGives',requireAuth,getMyGivesByUserId);
router.get('/getMyMatches',getMyGivesByCompanyAndDepartment);
router.get('/getAllMyMatchs',requireAuth,getMyGivesBasedOnMyAsks);
router.get('/getMyGivesBasedOnMyAsks',getMyGivesBasedOnMyAsks)
router.get('/getMyAllGives',requireAuth,MyAllGives)
router.get('/totalGives',MyAllGives)
router.delete('/deletemyGivesById',requireAuth,deletemyGivesById)
router.put('/updateMyGives', requireAuth, updateMyGives)
router.get('/getmyGivesById',requireAuth,getmyGivesById)
router.post('/addMyGivesbyEmail',requireAuth,AddGivesByEmail);
router.get('/getFilteredGives',requireAuth,getFilteredGives)
module.exports = router;