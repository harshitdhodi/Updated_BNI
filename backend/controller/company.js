const Company = require("../model/company");
const Member = require('../model/member'); // If needed
const MyGives = require("../model/myGives")
const MyAsks = require("../model/myAsk")

const fs = require('fs');
const path = require('path');
const Addcompany = async (req, res) => {
  try {
    console.log("Files:", req.files); // Log uploaded files

    const {
      companyName,
      whatsapp,
      facebook,
      linkedin,
      twitter,
      companyAddress,
    } = req.body;

    // Extract user from req.userId
    const user = req.userId;

    // Extract filenames without path 
    const bannerImg = req.files["bannerImg"]
      ? path.basename(req.files["bannerImg"][0].path)
      : null;
    const profileImg = req.files["profileImg"]
      ? path.basename(req.files["profileImg"][0].path)
      : null;


    // Check if the company already exists using a case-insensitive regex
    const currentCompany = await Company.findOne({ companyName: { $regex: new RegExp(`^${companyName}$`, 'i') } });

    // Create and save the new company
    const newCompany = new Company({
      bannerImg,
      profileImg,
      whatsapp,
      facebook,
      linkedin,
      twitter,
      companyAddress,
      companyName,
      user,
    });

    // Update company names in myGives and myAsks collections only if the company already exists
    if (currentCompany) {
      const lowerCaseCurrentCompanyName = currentCompany.companyName.toLowerCase();
      console.log(lowerCaseCurrentCompanyName)
      const lowerCaseNewCompanyName = companyName.toLowerCase();
console.log(lowerCaseNewCompanyName)
      await MyGives.updateMany(
        { companyName: { $regex: new RegExp(`^${lowerCaseCurrentCompanyName}$`, 'i') } }, // Match the old name case-insensitively
        { $set: { companyName: lowerCaseNewCompanyName } } // Update to the new name in lowercase
      );
      

      await MyAsks.updateMany(
        { companyName: { $regex: new RegExp(`^${lowerCaseCurrentCompanyName}$`, 'i') } }, // Match the old name case-insensitively
        { $set: { companyName: lowerCaseNewCompanyName } } // Update to the new name in lowercase
      );
    }
    const savedCompany = await newCompany.save();

    

    res.status(201).json({
      message: "Company created successfully and related records updated",
      company: savedCompany,
    });
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({
      message: "An error occurred while creating the company",
      error: error.message,
    });
  }
};



const getAllCompany = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0; // Default to 0 if no page is provided
    const limit = 5;
    
    let companies;
    let count;

    if (page > 0) {
      // Get the total count of Companies
      count = await Company.countDocuments();
      // Fetch Companies with pagination
      companies = await Company.find().skip((page - 1) * limit).limit(limit);
    } else {
      // Fetch all Companies 
      companies = await Company.find();
      count = companies.length;
    }

    // Check if Companies were found
    if (!companies || companies.length === 0) {
      return res.status(404).json({ message: "No Companies found" });
    }

    // Calculate if there is a next page
    const hasNextPage = page > 0 ? count > page * limit : false;

    // Send response
    res.status(200).json({
      data: companies,
      total: count,
      currentPage: page,
      hasNextPage: hasNextPage,
      message: "Companies fetched successfully",
    });
  } catch (error) {
    console.error('Error fetching Companies:', error);
    res.status(500).json({ message: "Server error" });
  }
};

  
const getCompanyById = async (req, res) => {
    try {
      const { id } = req.query; // Extract the id from query parameters
  
      // Fetch the Company by its ID
      const myCompany = await Company.findById(id);
  
      // If the Company is not found, return a 404 response
      if (!myCompany) {
        return res.status(404).json({ message: "Company not found" });
      }
  
      // Log the fetched Company for debugging
      console.log(myCompany);
  
      // Return the fetched Company with a success message
      res.status(200).json({
        data: myCompany,
        message: "Company fetched successfully",
      });
    } catch (error) {
      console.log(error)
      // Handle errors, such as invalid ID format or other issues
      res.status(400).json({ error: error.message });
    }
  };
  
 
  const updateCompanyById = async (req, res) => {
    const { id } = req.query;
    const updateFields = {};
    const updatedFields = {};
    const { companyName } = req.body; // Assume companyName is part of the req.body
  
    try {
      // Handle file uploads if req.files is defined
      if (req.files) {
        // Process each file type (bannerImg, profileImg, catalog)
        if (req.files['bannerImg'] && req.files['bannerImg'].length > 0) {
          updateFields.bannerImg = path.basename(req.files['bannerImg'][0].path);
          updatedFields.bannerImg = updateFields.bannerImg; // Include updated field in response
        }
        if (req.files['profileImg'] && req.files['profileImg'].length > 0) {
          updateFields.profileImg = path.basename(req.files['profileImg'][0].path);
          updatedFields.profileImg = updateFields.profileImg; // Include updated field in response
        }
      }
  
      // Update other fields from req.body
      for (const key in req.body) {
        if (key !== 'bannerImg' && key !== 'profileImg' && key !== 'catalog') {
          updateFields[key] = req.body[key];
          updatedFields[key] = req.body[key]; // Include updated field in response
        }
      }
  
      // Fetch the current company data
      const currentCompany = await Company.findById(id);
  
      if (!currentCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      // Update company data in the database
      const updatedCompany = await Company.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      );
  
      if (!updatedCompany) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      // If companyName has been updated, update it in myGives and myAsks collections
      if (companyName && companyName !== currentCompany.companyName) {
        let companyNamePrefix = companyName;
  
        if (companyName.length > 5) {
          companyNamePrefix = companyName.slice(0, 5);
        } else if (companyName.length <= 5) {
          companyNamePrefix = companyName.slice(0, 3);
        }
  
        await MyGives.updateMany(
          { companyName: { $regex: `^${companyNamePrefix}`, $options: 'i' } },
          { $set: { companyName: companyName } }
        );
  
        await MyAsks.updateMany(
          { companyName: { $regex: `^${companyNamePrefix}`, $options: 'i' } },
          { $set: { companyName: companyName } }
        );
      }
  
      // Respond with updated fields only
      res.status(200).json({ id: updatedCompany._id, updatedFields });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }
  };

  //delete Company
  const deleteCompany = async (req, res) => {
    try {
      const { id } = req.query;
      const company = await Company.findByIdAndDelete(id);
      if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }
        res.status(200).json({ message: "Company deleted successfully" });
        } catch (error) {
        res.status(400).json({ error: error.message });
        }
  };

  const myGives = require("../model/myGives");
  const myAsks = require("../model/myAsk");
  const Business = require("../model/business");
  
  const getNonExistingCompanyNames = async (req, res) => {
    try {
      // Function to get non-existing company names from a specific collection
      const getNonExistingFromCollection = async (collectionName) => {
        return await collectionName.aggregate([
          {
            $lookup: {
              from: 'companies', // The collection name for the 'Company' model
              let: { companyName: { $toLower: '$companyName' } }, // Convert companyName to lowercase
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [{ $toLower: '$companyName' }, '$$companyName'], // Case-insensitive match
                    },
                  },
                },
              ],
              as: 'companyMatch',
            },
          },
          {
            $match: {
              companyMatch: { $size: 0 }, // Filter for non-existing companies
            },
          },
          {
            $group: {
              _id: '$companyName', // Group by the original companyName
              companyName: { $first: '$companyName' }, // Take the first companyName in each group
            },
          },
          {
            $project: {
              _id: 0,
              companyName: 1,
            },
          },
        ]);
      };
  
      // Aggregation for myGives, myAsks, and Business collections
      const givesResult = await getNonExistingFromCollection(myGives);
      const asksResult = await getNonExistingFromCollection(myAsks);
      const businessResult = await getNonExistingFromCollection(Business);
  
      // Combine results from all three collections
      const combinedResults = [...givesResult, ...asksResult, ...businessResult];
  
      // Create a Set to track unique lowercase company names
      const lowerCaseSet = new Set();
      const finalCompanyNames = [];
  
      combinedResults.forEach((doc) => {
        const lowerCaseName = doc.companyName.toLowerCase();
        // Only add to the final list if the lowercase version isn't already in the Set
        if (!lowerCaseSet.has(lowerCaseName)) {
          lowerCaseSet.add(lowerCaseName); // Add the lowercase name to the Set
          finalCompanyNames.push(doc.companyName); // Push the original name to the final list
        }
      });
  
      res.status(200).json({
        message: 'Non-existing companies fetched successfully',
        companyNames: finalCompanyNames,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  
  
  

  
  const getFilteredCompanyNames = async (req, res) => {
    try {
      const filter = req.query.filter;
  
      if (!filter) {
        return res.status(400).json({ message: "Filter not provided" });
      }
  
      const result = await myGives.aggregate([
        {
          $lookup: {
            from: 'companies', // The collection name for the 'Company' model
            localField: 'companyName',
            foreignField: 'companyName',
            as: 'companyMatch'
          }
        },
        {
          $match: {
            'companyMatch': { $size: 0 },
            companyName: { $regex: filter, $options: 'i' } // Alphabetical filter with case insensitivity
          }
        },
        {
          $project: {
            _id: 0,
            companyName: 1
          }
        }
      ]);
  
      const companyNames = result.map(doc => doc.companyName);
  
      res.status(200).json({
        message: "Filtered non-existing companies fetched successfully",
        companyNames
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
  
  const getFilteredGives = async (req, res) => {
    try {
      const { companyName } = req.query;
  
      const filter = {};
  
      if (companyName) {
        filter.companyName = { $regex: companyName, $options: 'i' }; // Case-insensitive regex match
      }
  
      const result = await Company.aggregate([
        {
          $match: filter // Apply filter to the documents
        },
        {
          $project: {
            _id: 0, // Exclude _id field
            companyName: 1 // Include companyName field
          }
        }
      ]);
  
      // Return the filtered results
      res.status(200).json({
        message: "Filtered myGives fetched successfully",
        companies: result
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  };
  

  const TotalCompany = async (req, res) => {
    try {
      const TotalCompany = await Company.find().countDocuments();
        console.log(TotalCompany);
        return res
        .status(200)
        .json({success:true , message:`total Company are ${TotalCompany}`, TotalCompany })
  
    } catch (error) {
        console.log(error)
        return res
        .status(500)
        .json({success:false , message:"server error"})
    }
  }
  
module.exports = {Addcompany,TotalCompany ,getFilteredGives, getAllCompany,getNonExistingCompanyNames, getFilteredCompanyNames ,getCompanyById ,updateCompanyById ,deleteCompany}