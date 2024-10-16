const express = require('express');
const router = express.Router();

const {addMyGives,getMyGivesByUserId,AddGivesByEmail,getMyGivesByCompanyAndDepartment,getFilteredGives,MyAllGives,getmyGivesById,updateMyGives,totalMyGives, deletemyGivesById} = require('../controller/myGives');
const { requireAuth , authMiddleware} = require('../middeleware/requireAuth');
const {getMyGivesBasedOnMyAsks} = require('../controller/myMatch')
router.post('/addMyGives',authMiddleware,addMyGives);
router.get('/getMyGives',authMiddleware,getMyGivesByUserId);
router.get('/getMyMatches',getMyGivesByCompanyAndDepartment);
router.get('/getAllMyMatchs',authMiddleware,getMyGivesBasedOnMyAsks);
router.get('/getMyGivesBasedOnMyAsks',getMyGivesBasedOnMyAsks)
router.get('/getMyAllGives',authMiddleware,MyAllGives)
router.get('/totalGives',authMiddleware,MyAllGives)
router.delete('/deletemyGivesById',authMiddleware,deletemyGivesById)
router.put('/updateMyGives', authMiddleware, updateMyGives)
router.get('/getmyGivesById',authMiddleware,getmyGivesById)
router.post('/addMyGivesbyEmail',authMiddleware,AddGivesByEmail);
router.get('/getFilteredGives',authMiddleware,getFilteredGives)
module.exports = router;