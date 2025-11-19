// controllers/DepartmentController.js
const Department = require('../model/Department');

// Create a new Department
const addDepartment = async (req, res) => {
    try {
        const { name } = req.body;
        
        // Validate input
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Department name is required." });
        }

        // Check for uniqueness (case-insensitive)
        const existingDepartment = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });

        if (existingDepartment) {
            return res.status(409).json({ message: "A department with this name already exists." });
        }

        const department = new Department({ name: name.trim() });
        await department.save();

        res.status(201).json({ department, message: "Department created successfully" });
    } catch (error) {
        console.error("Error creating Department:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "A department with this name already exists." });
        }
        res.status(500).json({ message: "Server error while creating department." });
    }
};

// Get all Department
const getDepartment = async (req, res) => { 
    try {
        const { page = 1 } = req.query;
        const limit = req.query.limit || 5;
        const count = await Department.countDocuments();
        const department = await Department.find()
        .skip((page - 1) * limit) // Skip records for previous pages
        .limit(limit);
        res.status(200).json({
            data: department,
            total: count,
            currentPage: page,
            hasNextPage: count > page * limit,
            message: "department fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching Department:", error);
        res.status(400).send(error);
    }
};

// Get a single Department by ID
const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.query;
        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).send({ message: 'Department not found' });
        }

        res.status(200).send(department);
    } catch (error) {
        console.error("Error fetching Department:", error);
        res.status(400).send(error);
    }
};

// Update a Department
const updateDepartmentById = async (req, res) => {
    try {
        const { id } = req.query;
        const { name } = req.body; 

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Department name cannot be empty." });
        }

        // Check if another department with the same name already exists
        const existingDepartment = await Department.findOne({ 
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            _id: { $ne: id } // Exclude the current department from the check
        });

        if (existingDepartment) {
            return res.status(409).json({ message: "Another department with this name already exists." });
        }

        const updatedDepartment = await Department.findByIdAndUpdate(
            id, 
            { $set: { name: name.trim(), updatedAt: Date.now() } }, 
            { new: true }
        );

        if (!updatedDepartment) {
            return res.status(404).send({ message: 'Department not found' });
        }

        res.status(200).json({ department: updatedDepartment, message: "Update successful" });
    } catch (error) {
        console.error("Error updating Department:", error);
        res.status(500).json({ message: "Server error while updating department." });
    }
};

// Delete a Department
const deleteDepartmentById = async (req, res) => {
    try {
        const { id } = req.query;

        const department = await Department.findByIdAndDelete(id);

        if (!department) {
            return res.status(404).send({ message: 'Department not found' });
        }

        res.status(200).send({ message: "Department deleted successfully" });
    } catch (error) {
        console.error("Error deleting Department:", error);
        res.status(400).send(error);
    }
};

const TotalDepartment = async (req, res) => {
    try {
      const TotalDepartments = await Department.find().countDocuments();
        console.log(TotalDepartments);
        return res
        .status(200)
        .json({success:true , message:`total Departments are ${TotalDepartments}`, TotalDepartments })

    } catch (error) {
        console.log(error)
        return res
        .status(500)
        .json({success:false , message:"server error"})
    }
}

const getAllDepartment = async (req, res) => {
    try {
      
        const department = await Department.find()
        
        res.status(200).json({
            data: department,
            message: "department fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching Department:", error);
        res.status(400).send(error);
    }
};
module.exports = {
    addDepartment,
    getDepartment,
    getDepartmentById,
    updateDepartmentById,
    deleteDepartmentById,
    TotalDepartment,
    getAllDepartment
};
