// controllers/DepartmentController.js
const Department = require('../model/Department');

// Create a new Department
const addDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        const department = new Department({ name });
        await department.save();

        res.status(201).send({ department, message: "Department created successfully" });
    } catch (error) {
        console.error("Error creating Department:", error);
        res.status(400).send(error);
    }
};

// Get all Department
const getDepartment = async (req, res) => { 
    try {
        const { page = 1 } = req.query;
        const limit = 5;
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

        const updateObj = {
            $set: {
                name,
                updatedAt: Date.now()
            }
        };

        const department = await Department.findByIdAndUpdate(id, updateObj, { new: true });

        if (!department) {
            return res.status(404).send({ message: 'Department not found' });
        }

        res.status(200).send({ department, message: "Update successful" });
    } catch (error) {
        console.error("Error updating Department:", error);
        res.status(400).send(error);
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
