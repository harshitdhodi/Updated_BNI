const MyAsk = require('../model/myAsk');
const MyGives = require('../model/myGives');
const Business = require('../model/business');
const mongoose = require('mongoose');

/**
 * Get counter values for MyAsks, MyGives, Business, and MyMatches for a specific user
 * @param {string} userId - The MongoDB ObjectId of the member/user
 * @returns {object} - Object containing counts: { asks, gives, business, matches }
 */
const getUserCounters = async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate userId
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid userId format',
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // Get count of MyAsks for this user
    const asksCount = await MyAsk.countDocuments({ user: objectId });

    // Get count of MyGives for this user
    const givesCount = await MyGives.countDocuments({ user: objectId });

    // Get count of Businesses for this user
    const businessCount = await Business.countDocuments({ user: objectId });

    // Get count of MyMatches for this user (based on asks and gives)
    const asks = await MyAsk.find({ user: objectId });
    let matchesCount = 0;

    if (asks.length > 0) {
      for (const ask of asks) {
        if (!ask.companyName || !ask.dept) {
          continue;
        }

        const lowerCaseCompanyName = ask.companyName.toLowerCase();
        const matchedCompanies = await MyGives.countDocuments({
          companyName: { $regex: new RegExp(`^${lowerCaseCompanyName}$`, 'i') },
          dept: ask.dept,
        });

        matchesCount += matchedCompanies;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        asks: asksCount,
        gives: givesCount,
        business: businessCount,
        matches: matchesCount,
      },
    });
  } catch (error) {
    console.error('Error in getUserCounters:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

/**
 * Get aggregated dashboard statistics for all users
 * @returns {object} - Aggregate counts across all users
 */
const getDashboardStats = async (req, res) => {
  try {
    const totalAsks = await MyAsk.countDocuments();
    const totalGives = await MyGives.countDocuments();
    const totalBusiness = await Business.countDocuments();

    // Calculate total matches across all users
    let totalMatches = 0;
    const allAsks = await MyAsk.find();

    if (allAsks.length > 0) {
      for (const ask of allAsks) {
        if (!ask.companyName || !ask.dept) {
          continue;
        }

        const lowerCaseCompanyName = ask.companyName.toLowerCase();
        const matchedCompanies = await MyGives.countDocuments({
          companyName: { $regex: new RegExp(`^${lowerCaseCompanyName}$`, 'i') },
          dept: ask.dept,
        });

        totalMatches += matchedCompanies;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalAsks,
        totalGives,
        totalBusiness,
        totalMatches,
      },
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};

module.exports = {
  getUserCounters,
  getDashboardStats,
};
