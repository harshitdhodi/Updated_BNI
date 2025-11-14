// routes/countryRoutes.js
const express = require('express');
const router = express.Router();
const { addchapter,
    getchapter,
    getchapterById,
    updatechapterById,
    deletechapterById,TotalChapter,
    getChapterByCity
    } = require('../controller/chapter');
    const { requireAuth ,authMiddleware } = require('../middeleware/requireAuth');
router.post('/addchapter',authMiddleware , addchapter);
router.get('/getchapter',authMiddleware , getchapter);
router.get('/getchapterById',authMiddleware , getchapterById);
router.put('/updatechapter',authMiddleware , updatechapterById);
router.delete('/deletechapter',authMiddleware , deletechapterById);
router.get('/totalchapter',authMiddleware ,TotalChapter)
router.get('/getChapterByCity',authMiddleware ,getChapterByCity)
module.exports = router;

