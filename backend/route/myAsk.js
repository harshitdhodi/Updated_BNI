const express = require('express');
const router = express.Router();

const {addMyAsk,getMyAsks, MyAllAsks,AddGivesByEmail ,getFilteredAsks, TotalMyAsk, deleteMyAskById,updateMyAsk, getMyAskById} = require('../controller/myAsk');
const { requireAuth ,authMiddleware } = require('../middeleware/requireAuth');

router.post('/addMyAsk',authMiddleware,addMyAsk);
router.get('/getMyAsk',authMiddleware,getMyAsks);
router.get('/forAdminGetMyAsk',authMiddleware,getMyAsks);
router.get('/getAllAsks',authMiddleware,MyAllAsks);
router.get('/getTotalAsks',authMiddleware,TotalMyAsk);
router.put('/updateMyAsk',authMiddleware,updateMyAsk);
router.get('/getMyAskById',authMiddleware,getMyAskById);
router.delete('/deleteMyAskById',authMiddleware,deleteMyAskById);
router.post('/addMyAskByEmail',authMiddleware,AddGivesByEmail);
router.get('/getFilteredAsks',authMiddleware,getFilteredAsks);
module.exports = router;