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
router.post('/addDepartment',requireAuth,addDepartment);
router.get('/getDepartment',requireAuth, getDepartment);
router.get('/getDepartmentById',requireAuth, getDepartmentById);
router.put('/updateDepartmentById',requireAuth, updateDepartmentById);
router.delete('/deleteDepartmentById',requireAuth, deleteDepartmentById);
router.get('/totalDepartment',requireAuth,TotalDepartment)
router.get('/getAllDepartment', requireAuth,getAllDepartment)
module.exports = router;
