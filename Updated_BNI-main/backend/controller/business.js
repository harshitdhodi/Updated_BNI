const Business = require("../model/business");
const Member = require('../model/member'); // If needed
const mongoose = require('mongoose');
const multer = require('multer');

const fs = require('fs').promises;
const path = require('path');

// Update images using base64 strings
const updateImages = async (req, res) => { // This now correctly handles multipart/form-data
  try {
    const { id } = req.query;

    // If the request is multipart but no files are sent, req.files will be an empty object.
    // This check ensures we don't proceed without files.
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No new images were uploaded.' });
    }

    // First, find the existing business to get old filenames for deletion.
    const businessToUpdate = await Business.findById(id);
    if (!businessToUpdate) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const updateFields = {};

    // Handle banner image update
    if (req.files.bannerImg?.[0]) {
      await deleteFile(businessToUpdate.bannerImg); // Delete the old file
      updateFields.bannerImg = req.files.bannerImg[0].filename;
    }

    // Handle business/profile image update
    if (req.files.BusinessImg?.[0]) {
      await deleteFile(businessToUpdate.BusinessImg); // Delete the old file
      updateFields.BusinessImg = req.files.BusinessImg[0].filename;
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true } // {new: true} returns the updated document
    ).lean();

    res.status(200).json({ message: 'Images updated successfully', data: updatedBusiness });
  } catch (error) {
    console.error('Error updating images:', error);
    res.status(500).json({ message: 'Server error while updating images', error: error.message });
  }
};


// Controller method to create a new Business Business
const createBusiness = async (req, res) => {
  try {
    const {
      contactLinks,
      industryName,
      designation,
      companyName,
      aboutCompany,
      companyAddress,
    } = req.body;

    // Safely access filenames, allowing for optional files
    const bannerImgFilename = req.files?.bannerImg?.[0]?.filename;
    const businessImgFilename = req.files?.BusinessImg?.[0]?.filename;
    const catalogFilename = req.files?.catalog?.[0]?.filename;
    // Find user by ID (assuming req.userId is set in middleware)
    const user = await Member.findById(req.userId);
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    // Create new Business object
    const business = new Business({
      bannerImg: bannerImgFilename,
      BusinessImg: businessImgFilename,
      contactLinks,
      industryName,
      companyName,
      designation,
      aboutCompany,
      companyAddress,
      user,
      catalog: catalogFilename,
    });

    // Save business to database
    await business.save();

    res.status(201).json({ message: "Business created successfully", business });
  } catch (err) {
    console.error("Error creating business:", err);
    res.status(500).json({ error: "Failed to create business", message: err.message });
  }
};

// Get all businesss
const getbusiness = async (req, res) => {
  try {
    // Validate and sanitize pagination parameters
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10)); // optional: cap limit
    const skip = (page - 1) * limit;

    // Build the query and chain all operations correctly
    const businesses = await Business.find()
      .populate({
        path: 'user',
        select: 'name email mobile',   // fields from User model
      })
      .populate({
        path: 'industryName',          // assuming this is a reference to another collection
        select: 'name',                // adjust selected fields as needed
      })
      .skip(skip)
      .limit(limit)
      .lean(); // optional but recommended for read-only operations (faster)

    // Use the same filtering conditions for the count (in case you add filters later)
    const total = await Business.countDocuments();

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: businesses,
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get business by ID
const getbusinessByuserId = async (req, res) => {
  try {
    const { userId } = req.query;
    const { page = 1 } = req.query;
    const limit = 5;

    // Check if user exists
    const user = await Member.findById(userId);
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    // Fetch business details with pagination and populate user details
    const myBusiness = await Business.find({ user: userId })
      .skip((page - 1) * limit) // Skip records for previous pages
      .limit(limit)
      .populate('industryName')
      .populate('user'); // Populate the user details

    const count = await Business.countDocuments({ user: userId });

    res.status(200).json({
      data: myBusiness,
      total: count,
      currentPage: page,
      hasNextPage: count > page * limit,
      message: "Business fetched successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


//update contact Links
const updateContactLinks = async (req, res) => {
  const { id } = req.query;
  const { contactLinks } = req.body;

  console.log('Received ID:', id);
  console.log('Received contactLinks:', contactLinks);

  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { contactLinks },
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json({ message: 'Contact links updated successfully', business: updatedBusiness });
  } catch (error) {
    console.error('Error updating contact links:', error);
    res.status(500).json({ message: 'Error updating contact links', error });
  }
};
// update CompanyDetails 

const updateBusinessDetails = async (req, res) => {
  try {
    const { id } = req.query;
    const { designation, aboutCompany, companyAddress } = req.body;

    console.log('Received ID:', id);
    console.log('Request Body:', req.body);

    const updateFields = {};

    if (designation !== undefined) updateFields.designation = designation;
    if (aboutCompany !== undefined) updateFields.aboutCompany = aboutCompany;
    if (companyAddress !== undefined) updateFields.companyAddress = companyAddress;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.status(200).json({ message: 'Business details updated successfully', data: updatedBusiness });
  } catch (error) {
    console.error('Error updating business details:', error);
    res.status(500).json({ message: 'Error updating business details', error });
  }
};
// Delete business
const deletebusiness = async (req, res) => {
  try {
    const { id } = req.query;
    const business = await Business.findByIdAndDelete(id);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.status(200).json({ message: "Business deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//get BusinessList 
const businessList = async (req, res) => {
  try {
    const businesses = await Business.find({}, '_id companyName industryName'); // Fetch _id, companyName, and industryName fields
    console.log(businesses); // Logging fetched businesses for debugging

    // Mapping over each business to extract _id, companyName, and industryName
    const companies = businesses.map(business => ({
      _id: business._id,
      companyName: business.companyName,
      industryName: business.industryName
    }));

    res.json(companies); // Sending the mapped data as JSON response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

const getbusinessbyId = async (req, res) => {
  try {
    const { id } = req.query; // Extract the id from query parameters

    // Fetch the business by its ID
    const myBusiness = await Business.findById(id);

    // If the business is not found, return a 404 response
    if (!myBusiness) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Log the fetched business for debugging
    console.log(myBusiness);

    // Return the fetched business with a success message
    res.status(200).json({
      data: myBusiness,
      message: "Business fetched successfully",
    });
  } catch (error) {
    // Handle errors, such as invalid ID format or other issues
    res.status(400).json({ error: error.message });
  }
};


const deleteFile = async (filename) => {
  if (!filename) return;
  try {
    const filePath = path.join(__dirname, '..', 'images', filename);
    await fs.unlink(filePath);
    console.log(`Successfully deleted old file: ${filename}`);
  } catch (err) {
    // If file doesn't exist, we don't need to throw an error.
    if (err.code !== 'ENOENT') {
      console.error(`Error deleting file ${filename}:`, err);
    }
  }
};

const updateBusinessById = async (req, res) => {
  try {
    const {
      contactLinks,
      industryName,
      designation,
      companyName,
      aboutCompany,
      companyAddress,
    } = req.body;

    // Safely get new filenames only if files are uploaded
    const bannerImgFilename = req.files?.bannerImg?.[0]?.filename;
    const businessImgFilename = req.files?.BusinessImg?.[0]?.filename;
    const catalogFilename = req.files?.catalog?.[0]?.filename;

    // Find the business by ID (assuming it's sent in params or body)
    const businessId = req.query.id || req.body.businessId;
    if (!businessId) {
      return res.status(400).json({ status: "failed", message: "Business ID is required" });
    }

    // Find the business and ensure it belongs to the logged-in user (security)
    const business = await Business.findOne({ _id: businessId, user: req.userId });
    if (!business) {
      return res.status(404).json({ status: "failed", message: "Business not found or unauthorized" });
    }

    // Update only provided fields
    if (bannerImgFilename) business.bannerImg = bannerImgFilename;
    if (businessImgFilename) business.BusinessImg = businessImgFilename;
    if (catalogFilename) business.catalog = catalogFilename;

    if (contactLinks !== undefined) business.contactLinks = contactLinks;
    if (industryName !== undefined) business.industryName = industryName;
    if (designation !== undefined) business.designation = designation;
    if (companyName !== undefined) business.companyName = companyName;
    if (aboutCompany !== undefined) business.aboutCompany = aboutCompany;
    if (companyAddress !== undefined) business.companyAddress = companyAddress;

    // Save updated business
    await business.save();

    res.status(200).json({
      message: "Business updated successfully",
      business,
    });
  } catch (err) {
    console.error("Error updating business:", err);
    res.status(500).json({ error: "Failed to update business", message: err.message });
  }
};

const Totalbusiness = async (req, res) => {
  try {
    const Totalbusiness = await Business.find().countDocuments();
      console.log(Totalbusiness);
      return res
      .status(200)
      .json({success:true , message:`total business are ${Totalbusiness}`, Totalbusiness })

  } catch (error) {
      console.log(error)
      return res
      .status(500)
      .json({success:false , message:"server error"})
  }
}

// Update Business Profile (with image uploads)
const updateBusinessProfile = async (req, res) => {
  try {
    const { businessId } = req.query; // Get business ID from URL

    // Validate businessId
    if (!businessId || !mongoose.Types.ObjectId.isValid(businessId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid Business ID is required in the query parameters.'
      });
    }

    const updates = req.body;
    const uploadedFiles = [];

    // Handle file uploads (profileImg & bannerImg)
    if (req.files) {
      if (req.files.profileImg?.[0]) {
        updates.profileImg = req.files.profileImg[0].filename;
        uploadedFiles.push(updates.profileImg);
      }
      if (req.files.bannerImg?.[0]) {
        updates.bannerImg = req.files.bannerImg[0].filename;
        uploadedFiles.push(updates.bannerImg);
      }
    }

    // Find existing business profile
    const existingProfile = await Business.findById(businessId);

    if (!existingProfile) {
      // If uploading files but business not found, clean up uploaded files
      await Promise.all(uploadedFiles.map(file => deleteFile(file)));
      return res.status(404).json({
        success: false,
        message: 'Business profile not found'
      });
    }

    // Asynchronously delete old images if new ones are uploaded
    const deletePromises = [];
    if (updates.profileImg && existingProfile.profileImg) {
      deletePromises.push(deleteFile(existingProfile.profileImg));
    }
    if (updates.bannerImg && existingProfile.bannerImg) {
      deletePromises.push(deleteFile(existingProfile.bannerImg));
    }
    await Promise.all(deletePromises);

    // Update the business profile
    const updatedProfile = await Business.findByIdAndUpdate(
      businessId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('industryName', 'name').populate('user', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    console.error('Update Business Profile Error:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const createBusinessProfile = async (req, res) => {
  try {
    const {
      industryName, whatsapp, facebook, linkedin, twitter,
      designation, aboutCompany, companyName, companyAddress,
      mobile, email
    } = req.body;

    const userId = req.query.userId;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'A valid User ID is required.' });
    }

    // Check if user exists
    const userExists = await Member.findById(userId);
    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Explicitly check for mobile number uniqueness before saving
    if (mobile) {
      const existingBusiness = await Business.findOne({ mobile });
      if (existingBusiness) {
        return res.status(409).json({ success: false, message: 'This mobile number is already registered.' });
      }
    }

    const bannerImg = req.files?.bannerImg?.[0]?.filename;
    const profileImg = req.files?.profileImg?.[0]?.filename;
    const catalog = req.files?.catalog?.[0]?.filename;

    const newProfile = new Business({
      user: userId,
      companyName,
      industryName,
      mobile: mobile || null, // Ensure empty strings become null for sparse index
      email,
      designation,
      aboutCompany,
      companyAddress,
      profileImg,
      bannerImg,
      catalog,
      whatsapp,
      facebook,
      linkedin,
      twitter,
    });

    const savedProfile = await newProfile.save();

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile: savedProfile
    });

  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.mobile) {
      return res.status(409).json({ success: false, message: 'This mobile number is already registered.' });
    }
    console.error('Create Business Profile Error:', error);
    res.status(500).json({ success: false, message: 'An error occurred while creating the profile', error: error.message });
  }
};

module.exports = {
  createBusiness,
  getbusiness,
  getbusinessByuserId,
  updateImages,
  updateContactLinks,
  updateBusinessDetails,
  businessList,
  getbusinessbyId,
  updateBusinessById,
  deletebusiness,
  Totalbusiness,
  updateBusinessProfile,
  createBusinessProfile
};