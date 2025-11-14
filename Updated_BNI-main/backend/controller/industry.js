const Industry = require('../model/industry');
const User = require("../model/member");
// Create a new industry
exports.createIndustry = async (req, res) => {
    try {
        const { name } = req.body;

    //     const user = await User.findById(req.userId);
    // if (!user) {
    //   return res
    //     .status(404)
    //     .json({ status: "failed", message: "User not found" });
    // }

        const industry = new Industry({ name});
        await industry.save();
        res.status(201).json(industry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all industries
exports.getAllIndustries = async (req, res) => {
    try {
        // const { page = 1 } = req.query;
        // const limit = 5;
        // const count = await Industry.countDocuments();
        const industries = await Industry.find()
        // .skip((page - 1) * limit) // Skip records for previous pages
        // .limit(limit);;
        res.status(200).json(
          {
            data: industries,
            // total: count,
            // currentPage: page,
            // hasNextPage: count > page * limit,
            message: "Industry fetched successfully"
          }
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getIndustries = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 5;
        const count = await Industry.countDocuments();
        const industries = await Industry.find()
        .skip((page - 1) * limit) // Skip records for previous pages
        .limit(limit);
        res.status(200).json(
          {
            data: industries,
            total: count,
            currentPage: page,
            hasNextPage: count > page * limit,
            message: "Industry fetched successfully"
          }
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get an industry by ID
exports.getIndustryById = async (req, res) => {
    try {
        const { id } = req.query;
        const industry = await Industry.findById(id);
        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }
        res.status(200).json(industry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an industry by ID
exports.updateIndustry = async (req, res) => {
    try {
        const { id } = req.query;
        const { name } = req.body;
        const industry = await Industry.findByIdAndUpdate(id, { name, updatedAt: Date.now() }, { new: true });
        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }
        res.status(200).json(industry);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete an industry by ID
exports.deleteIndustry = async (req, res) => {
    try {
        const { id } = req.query;
        const industry = await Industry.findByIdAndDelete(id);
        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }
        res.status(200).json({ message: 'Industry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
