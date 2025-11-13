const express = require('express');
const router = express.Router();

const {addMyAsk,getMyAsks, MyAllAsks,AddGivesByEmail ,getFilteredAsks, TotalMyAsk, deleteMyAskById,updateMyAsk, getMyAskById} = require('../controller/myAsk');
const { requireAuth ,authMiddleware } = require('../middeleware/requireAuth');

router.post('/addMyAsk',addMyAsk);
router.get('/getMyAsk',getMyAsks);
router.get('/forAdminGetMyAsk',getMyAsks);
router.get('/getAllAsks',MyAllAsks);
router.get('/getTotalAsks',TotalMyAsk);
router.put('/updateMyAsk',updateMyAsk);
router.get('/getMyAskById',getMyAskById);
router.delete('/deleteMyAskById',deleteMyAskById);
router.post('/addMyAskByEmail',AddGivesByEmail);
router.get('/getFilteredAsks',getFilteredAsks);
module.exports = router;