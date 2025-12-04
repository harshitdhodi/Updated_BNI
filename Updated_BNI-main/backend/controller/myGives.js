const myGives = require("../model/myGives");
const Member = require("../model/member");
const mongoose = require("mongoose"); // Make sure mongoose is imported if needed for validation

// POST /api/myGives
const addMyGives = async (req, res) => {
  try {
    const { user } = req.query;
    const { companyName, email, phoneNumber, webURL, dept } = req.body;

    // Check if the email already exists
    if (email) {
      const existingGive = await myGives.findOne({ email: email.trim() });
      if (existingGive) {
        return res.status(409).json({ status: "failed", message: "This email already exists. Please use a different email.", field: "email" });
      }
    }

    const newCompany = new myGives({
      companyName,
      email,
      phoneNumber,
      webURL,
      dept,
      user,
    });

    const savedCompany = await newCompany.save();

    res.status(201).json({
      status: "success",
      message: "Company created successfully",
      data: savedCompany,
    });
  } catch (error) {
    console.error(error);
    // Handle potential unique index errors from the model if one is added later
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({ status: "failed", message: "This email already exists. Please use a different email.", field: "email" });
    }
    res
      .status(500)
      .json({ status: "failed", message: "Unable to create record" });
  }
};

// GET /api/myGives?page=1
const MyAllGives = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = req.query.limit || 5;
    const count = await myGives.countDocuments();
    const mygives = await myGives
      .find()
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      data: mygives,
      total: count,
      currentPage: Number(page),
      hasNextPage: count > page * limit,
      message: "All Gives fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/myGives/total
const totalMyGives = async (req, res) => {
  try {
    const TotalMyGives = await myGives.countDocuments();
    res
      .status(200)
      .json({
        success: true,
        message: `Total MyGives are ${TotalMyGives}`,
        TotalMyGives,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/myGives/byUserId?userId=123&page=1
const getMyGivesByUserId = async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Parse page and limit as integers with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // Validate userId
    if (!userId) {
      return res.status(400).json({
        status: "failed",
        message: "userId is required",
      });
    }

    // Get total count
    const total = await myGives.countDocuments({ user: userId });
    
    // Calculate total pages
    const totalPages = Math.ceil(total / limit);
    
    // Calculate skip value
    const skip = (page - 1) * limit;

    // Fetch paginated data
    const userMyGives = await myGives
      .find({ user: userId })
      .populate('dept')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Optional: sort by newest first

    res.status(200).json({
      data: userMyGives,
      total: total,
      totalPages: totalPages,
      currentPage: page,
      limit: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      message: "User fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching myGives:", error);
    res.status(500).json({
      status: "failed",
      message: "Unable to fetch myGives",
    });
  }
};

// GET /api/myGives/byCompanyAndDept?companyName=XYZ&dept=ABC&id=123&page=1
const getMyGivesByCompanyAndDepartment = async (req, res) => {
  try {
    const { companyName, dept, page = 1 } = req.query;
    const limit = 5;

    if (!companyName || !dept ) {
      return res
        .status(400) 
        .json({
          status: "failed",
          message: "Company name, dept, and user ID are required",
        });
    }

    const myGivesData = await myGives
      .find({ companyName, dept })
      .populate({ path: "user", model: "Member" })
      .skip((page - 1) * limit)
      .limit(limit);

    const count = await myGives.countDocuments({ companyName, dept });

    res.status(200).json({
      status: "success",
      data: myGivesData,
      total: count,
      currentPage: Number(page),
      hasNextPage: count > page * limit,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to fetch data" });
  }
};

// DELETE /api/myGives?id=123
const deletemyGivesById = async (req, res) => {
  try {
    const { id } = req.query;

    const MyGives = await myGives.findByIdAndDelete(id);

    if (!MyGives) {
      return res.status(404).send({ message: "myGives not found" });
    }

    res.status(200).send({ message: "myGives deleted successfully" });
  } catch (error) {
    console.error("Error deleting myGives:", error);
    res.status(400).send(error);
  }
};

// PUT /api/myGives/update?id=123
const updateMyGives = async (req, res) => {
  try {
    const { id } = req.query;
    const myGivesData = req.body;
    const updatedmyGivesData = await myGives.findByIdAndUpdate(
      id,
      myGivesData,
      { new: true }
    );
    if (!updatedmyGivesData) {
      return res.status(404).json({ message: "MyGives not found" });
    }
    res.status(200).json({ data: updatedmyGivesData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/member?id=123
const getmyGivesById = async (req, res) => {
  try {
    const { id } = req.query; // Extract the 'id' as a string from 'req.query'

    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    const MyGives = await myGives.findById(id).populate('dept');
    if (!MyGives) {
      return res.status(404).json({ message: "MyGives not found" });
    }
    console.log(MyGives)
    res.status(200).json({ data: MyGives });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const AddGivesByEmail = async (req, res) => {
  try {
    const {memberEmail ,  companyName, email, phoneNumber, webURL, dept } = req.body;

    // Find user by email
    const user = await Member.findOne({ email:memberEmail });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new MyAsk document
    const newMyGives = new myGives({
      companyName, email, phoneNumber, webURL, dept ,
      user: user._id
    });

    const savedMyGives = await newMyGives.save();
    res.status(201).json(savedMyGives);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server error' });
  }
}


const getFilteredGives = async (req, res) => {
  try {
    const { companyName, email, phoneNumber, webURL, dept } = req.query;

    const filter = {};

    if (companyName) {
      filter.companyName = { $regex: companyName, $options: 'i' };
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (phoneNumber) {
      filter.phoneNumber = { $regex: phoneNumber, $options: 'i' };
    }
    if (webURL) {
      filter.webURL = { $regex: webURL, $options: 'i' };
    }
    if (dept) {
      filter.dept = { $regex: dept, $options: 'i' };
    }

    const result = await myGives.aggregate([
      {
        $match: filter
      }
    ]);

    res.status(200).json({
      message: "Filtered myGives fetched successfully",
      data: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  addMyGives,
  getMyGivesByUserId,
  getMyGivesByCompanyAndDepartment,
  MyAllGives,
  totalMyGives,
  deletemyGivesById,
  updateMyGives,
  getmyGivesById,
  AddGivesByEmail,
  getFilteredGives  
};
