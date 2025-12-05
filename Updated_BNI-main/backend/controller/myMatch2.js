const MyAsk = require('../model/myAsk');
const MyGives = require('../model/myGives');

/**
 * Escapes special characters in a string for use in a regular expression.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
const myMatches = async (req, res) => {
  try {
    const { userId, page = 1 } = req.query; // Extract userId and page from query params
    const limit = req.query.limit || 5;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in request' });
    }

    // Fetch all asks for the user
    const asks = await MyAsk.find({ user: userId }).select('companyName').lean();

    if (!asks.length) {
      return res.status(404).json({ message: 'No asks found for the user' });
    }

    // Get unique, non-empty company names from the user's asks
    const companyNames = [...new Set(asks.map(ask => ask.companyName).filter(Boolean))];

    if (companyNames.length === 0) {
      return res.status(404).json({ message: 'No asks with company names found' });
    }

    // Find all gives that match any of the company names, case-insensitively
    const allMatchedGives = await MyGives.find({
      companyName: { $in: companyNames.map(name => new RegExp(`^${name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i')) }
    }).populate('user', 'name email mobile webURL').lean();

    if (!allMatchedGives.length) {
      return res.status(404).json({ message: 'No matching companies found' });
    }

    // Group the gives by company name (case-insensitive)
    const groupedByCompany = allMatchedGives.reduce((acc, give) => {
      const companyKey = give.companyName.toLowerCase();
      if (!acc[companyKey]) {
        acc[companyKey] = {
          // Use the casing from the first give found for this company
          companyName: give.companyName,
          matches: [],
          // Use the createdAt from the first give as a stable sort key
          createdAt: give.createdAt 
        };
      }
      acc[companyKey].matches.push(give);
      return acc;
    }, {});

    // Convert the grouped object to an array and sort by creation date
    const results = Object.values(groupedByCompany).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination to the grouped results
    const total = results.length;
    const paginatedResults = results.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      data: paginatedResults,
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
console.log('Matched Companies for ask:', ask, matchedCompanies);
      // Accumulate matched companies
      if (matchedCompanies.length) {
        allMatchedCompanies = allMatchedCompanies.concat(matchedCompanies);
     console.log('All Matched Companies so far:', allMatchedCompanies);
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
