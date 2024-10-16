const MyAsk = require('../model/myAsk');
const User = require('../model/member');
const mongoose = require("mongoose")
const addMyAsk = async (req, res) => {
  try {
    // Extract data from request body
    const { user } = req.query;
    const { companyName, dept, message } = req.body;
 

    // Validate required fields
    if (!companyName || !dept || !message) {
      return res.status(400).json({
        status: "failed",
        message: "Company name, MyAsk, and message are required"
      });
    }


    // Create new MyAsk instance
    const myAsk = new MyAsk({
      companyName,
      dept,
      message,
      user
    });

    // Save MyAsk to the database
    const myAsks = await myAsk.save(); 

    res.status(201).json({
      status: "success",
      message: "MyAsk created successfully",
      data: myAsks, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error });
  }
};

const getMyAsks = async (req, res) => {
  try {
    // Extract userId from request parameters
    const { userId } = req.query;
    
    const { page = 1 } = req.query;
    const limit = 5;
    // Check if user exists (if validation is needed)
    const user = await User.findById(userId)
    .skip((page - 1) * limit) // Skip records for previous pages
    .limit(limit);;
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }
console.log('myASk',userId)
    // Query MyAsk collection for entries associated with userId
    const userMyAsk = await MyAsk.find({ user: userId });

    res.status(200).json({
      status: "success",
      data: userMyAsk,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to fetch myAsk" });
  }
};

const MyAllAsks= async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 5;
    const count = await MyAsk.countDocuments()
    const myAllAsks= await MyAsk.find()  
    .skip((page - 1) * limit) // Skip records for previous pages
    .limit(limit);
    res.status(200).json({
      data: myAllAsks,
      total: count,
      currentPage: Number(page),
      hasNextPage: count > page * limit,
      message: "All Asks fetched successfully",
  });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const TotalMyAsk = async (req, res) => {
  try {
    const TotalMyAsks = await MyAsk.find().countDocuments();
      console.log(TotalMyAsks);
      return res
      .status(200)
      .json({success:true , message:`total MyAsks are ${TotalMyAsks}`, TotalMyAsks })

  } catch (error) {
      console.log(error)
      return res
      .status(500)
      .json({success:false , message:"server error"})
  }
}

const deleteMyAskById = async (req, res) => {
  try {
    const { id } = req.query;

    const myAsk = await MyAsk.findByIdAndDelete(id);

    if (!myAsk) {
      return res.status(404).send({ message: "MyAsk not found" });
    }

    res.status(200).send({ message: "MyAsk deleted successfully" });
  } catch (error) {
    console.error("Error deleting MyAsk:", error);
    res.status(400).send(error);
  }
};


const updateMyAsk = async (req, res) => {
  try {
    const { id } = req.query;
    const MyAskData = req.body;
    const updatedMyAskData = await MyAsk.findByIdAndUpdate(
      id,
      MyAskData,
      { new: true }
    );
    if (!updatedMyAskData) {
      return res.status(404).json({ message: "MyAsk not found" });
    }
    res.status(200).json({ data: updatedMyAskData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const getMyAskById = async (req, res) => {
  try {
    const { id } = req.query; // Extract the 'id' as a string from 'req.query'

    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    const myAsk = await MyAsk.findById(id);
    if (!myAsk) {
      return res.status(404).json({ message: "MyAsk not found" });
    }
    res.status(200).json({ data: myAsk });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const AddGivesByEmail = async (req, res) => {
  try {
    const { email, companyName, dept, message } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new MyAsk document
    const newMyAsk = new MyAsk({
      companyName,
      dept,
      message,
      user: user._id
    });

    const savedMyAsk = await newMyAsk.save();
    res.status(201).json(savedMyAsk);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}



const getFilteredAsks = async (req, res) => {
  try {
    const { companyName, dept } = req.query;

    const filter = {};

    if (companyName) {
      filter.companyName = { $regex: companyName, $options: 'i' };
    }

    if (dept) {
      filter.dept = { $regex: dept, $options: 'i' };
    }

    // Aggregate pipeline to filter
    const result = await MyAsk.aggregate([
      {
        $match: filter
      }
    ]);

    res.status(200).json({
      message: "Filtered MyAsk fetched successfully",
      result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = {
  addMyAsk,
  getMyAsks,
  MyAllAsks,
  TotalMyAsk,
  deleteMyAskById,
  updateMyAsk,
  getMyAskById,
  AddGivesByEmail,
  getFilteredAsks
};
