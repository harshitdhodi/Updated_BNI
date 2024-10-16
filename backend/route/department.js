const express = require('express');
const router = express.Router();
const { addDepartment,
    getDepartment,
    getDepartmentById,
    updateDepartmentById,
    deleteDepartmentById,TotalDepartment ,getAllDepartment} = require('../controller/Department');
const {uploadPhoto} = require('../middeleware/imageUpload');
const {requireAuth , authMiddleware} = require("../middeleware/requireAuth")
// Routes for CRUD operations
router.post('/addDepartment',authMiddleware,addDepartment);
router.get('/getDepartment',authMiddleware, getDepartment);
router.get('/getDepartmentById',authMiddleware, getDepartmentById);
router.put('/updateDepartmentById',authMiddleware, updateDepartmentById);
router.delete('/deleteDepartmentById',authMiddleware, deleteDepartmentById);
router.get('/totalDepartment',authMiddleware,TotalDepartment)
router.get('/getAllDepartment', authMiddleware,getAllDepartment)
module.exports = router;
