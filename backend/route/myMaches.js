const express = require('express');
const router = express.Router();

const {myMatches ,myMatchesByCompanyName , getTotalMatches} = require('../controller/myMatch2');
const {requireAuth , authMiddleware} = require('../middeleware/requireAuth');
const {bearerAuth} = require('../middeleware/BearerAuth')
router.get('/myAllMatches',authMiddleware,myMatches)
router.get('/forAdminAllMatches',authMiddleware,myMatches)
router.get('/bearerAuth',authMiddleware,myMatches)
router.get('/myMatchesByCompanyAndDept',authMiddleware,myMatchesByCompanyName)
router.get('/getTotalMatches',authMiddleware,getTotalMatches)
module.exports = router;