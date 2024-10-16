const MyAsk = require('../model/myAsk');
const MyGives = require('../model/myGives');

const myMatches = async (req, res) => {
  try {
    const { userId, page = 1 } = req.query; // Extract userId and page from query params
    const limit = 5;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    console.log('Fetching asks for user...');
    // Fetch all asks for the user
    const asks = await MyAsk.find({ user: userId });
    console.log(asks);

    if (!asks.length) {
      return res.status(404).json({ message: 'No asks found for the user' });
    }

    // Initialize an array to hold all matched companies
    let allMatchedCompanies = [];

    // Iterate over each ask to find matches in MyGives
    for (const ask of asks) {
      // Convert the ask company name and dept to lowercase for comparison
      const lowerCaseCompanyName = ask.companyName.toLowerCase();
      const lowerCaseDept = ask.dept.toLowerCase();

      const matchedCompanies = await MyGives.find({
        // Use regex for case-insensitive matching
        companyName: { $regex: new RegExp(`^${lowerCaseCompanyName}$`, 'i') },
        dept: { $regex: new RegExp(`^${lowerCaseDept}$`, 'i') }
      }).populate('user', 'name email mobile webURL'); // Populate user fields

      // Accumulate matched companies
      allMatchedCompanies = allMatchedCompanies.concat(matchedCompanies);
    }

    if (!allMatchedCompanies.length) {
      return res.status(404).json({ message: 'No matching companies found' });
    }

    // Apply pagination to the accumulated matched companies
    const total = allMatchedCompanies.length;
    const paginatedMatchedCompanies = allMatchedCompanies.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      data: paginatedMatchedCompanies,
      total,
      currentPage: Number(page),
      hasNextPage: total > page * limit,
      message: "All Gives fetched successfully"
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: error.message });
  }
};



const myMatchesByCompanyName = async (req, res) => {
  try {
    const { companyName, dept, page } = req.query; // Extract parameters from query params
    const limit = 5;

    // Fetch all asks with matching companyName and dept (case-insensitive)
    const asks = await MyAsk.find({
      companyName: { $regex: new RegExp(companyName, 'i') }, // Case-insensitive search for companyName
      dept: { $regex: new RegExp(dept, 'i') }, // Case-insensitive search for dept
    });

    if (!asks.length) {
      return res.status(404).json({ message: 'No asks found' });
    }

    // Initialize an array to hold all matched companies
    let allMatchedCompanies = [];

    // Iterate over each ask to find matches in MyGives
    for (const ask of asks) {
      const matchedCompanies = await MyGives.find({
        companyName: { $regex: new RegExp(ask.companyName, 'i') }, // Case-insensitive search in MyGives
        dept: { $regex: new RegExp(ask.dept, 'i') }, // Case-insensitive search in MyGives
      }).populate('user', 'name email mobile country city chapter keyword');

      // Accumulate matched companies
      if (matchedCompanies.length) {
        allMatchedCompanies = allMatchedCompanies.concat(matchedCompanies);
      }
    }

    // Use a Set to filter duplicates based on the unique identifier (_id)
    const uniqueMatchedCompanies = Array.from(
      new Map(allMatchedCompanies.map(company => [company._id, company])).values()
    );

    // Check if matches were found
    if (!uniqueMatchedCompanies.length) {
      return res.status(400).json({ message: 'No matching companies found' });
    }

    // Calculate total number of matches and paginate the results
    const total = uniqueMatchedCompanies.length;
    const paginatedMatchedCompanies = uniqueMatchedCompanies.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      data: paginatedMatchedCompanies,
      total,
      currentPage: Number(page),
      hasNextPage: total > page * limit,
      message: 'All Gives fetched successfully'
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching matches' });
  }
};



// const deleteUserById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedUser = await user.findByIdAndDelete(id);
//     if (!deletedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.status(200).json({ message: "User deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const getTotalMatches = async (req, res) => {
  try {
    const results = await MyAsk.aggregate([
      {
        $lookup: {
          from: 'mygives', // Collection name for MyGives
          localField: 'companyName',
          foreignField: 'companyName',
          as: 'givesMatches'
        }
      },
      {
        $unwind: '$givesMatches'
      },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$companyName', '$givesMatches.companyName'] },
              { $eq: ['$dept', '$givesMatches.dept'] }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalMatches: { $sum: 1 }
        }
      }
    ]);

    const totalMatches = results.length > 0 ? results[0].totalMatches : 0;
    res.status(200).json({ totalMatches });
  } catch (error) {
    console.error('Error getting total matches:', error);
    res.status(500).json({ error: 'An error occurred while getting total matches' });
  }
};



module.exports = { myMatches , myMatchesByCompanyName , getTotalMatches };
