const express = require('express')
const router = express.Router();

const {addClient} = require('../controller/Client')
const { requireAuth ,authMiddleware } = require('../middeleware/requireAuth');
router.post('/addClient' , authMiddleware,addClient)

module.exports = router;