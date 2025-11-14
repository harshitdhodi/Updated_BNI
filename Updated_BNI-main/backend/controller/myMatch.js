// controllers/myController.js

const MyAsk = require('../model/myAsk');
const MyGive = require('../model/myGives');
const mongoose = require('mongoose')
const getMyGivesBasedOnMyAsks = async (req, res) => {
  try {
    const { companyName, dept } = req.query;
    // const userId = req.query.userId; // Correctly extract userId from query

    // // Validate the userId
    // if (!mongoose.Types.ObjectId.isValid(userId)) {
    //   return res.status(400).json({ message: 'Invalid user ID' });
    // }

    const myGives = await MyAsk.aggregate([
      {
        $match: {
          companyName: companyName,
          dept: dept,
          // user: new mongoose.Types.ObjectId(userId) // Correctly create ObjectId
        }
      },
      {
        $lookup: {
          from: 'mygives',
          localField: 'companyName',
          foreignField: 'companyName',
          as: 'myGives',
          pipeline: [
            {
              $match: {
                dept: dept
              }
            }
          ]
        }
      },
      {
        $unwind: '$myGives'
      },
      {
        $project: {
          _id: 0,
          'myGives._id': 1,
          'myGives.companyName': 1,
          'myGives.email': 1,
          'myGives.phoneNumber': 1,
          'myGives.webURL': 1,
          'myGives.dept': 1,
          'myGives.user': 1,
          'myGives.createdAt': 1,
          'myGives.updatedAt': 1,
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: myGives,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'failed', message: 'Unable to fetch MyGives based on MyAsks' });
  }
};



module.exports = {
  getMyGivesBasedOnMyAsks,
};
