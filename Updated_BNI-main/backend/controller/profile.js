const Profile = require('../model/profile');
const fs = require('fs');
const path = require('path');

// Function to decode base64 string and save as an image file
const saveBase64Image = (base64Data, filename) => {
  return new Promise((resolve, reject) => {
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return reject(new Error('Invalid base64 string'));
    }

    const fileBuffer = Buffer.from(matches[2], 'base64');
    const filePath = path.join(__dirname, '../uploads', filename);

    fs.writeFile(filePath, fileBuffer, (err) => {
      if (err) {
        return reject(err); 
      }
      resolve(filePath); 
    });
  });
};

// Create a new profile
const createProfile = async (req, res) => {
  const { contactLinks, designation, aboutMe, bannerImg, profileImg } = req.body;

  console.log(bannerImg)
  try {
    if (!bannerImg || !profileImg) {
      return res.status(400).json({ message: 'Image data is required' });
    }

    // Save base64 images as files
    const bannerImgFileName = `bannerImg_${Date.now()}.png`;
    const profileImgFileName = `profileImg_${Date.now()}.png`;
console.log(profileImgFileName)
    await saveBase64Image(bannerImg, bannerImgFileName);
    await saveBase64Image(profileImg, profileImgFileName);

    // Create new profile instance
    const newProfile = new Profile({
      bannerImg: bannerImgFileName,
      profileImg: profileImgFileName,
      contactLinks,
      designation,
      aboutMe
    });

    // Save profile to database
    const savedProfile = await newProfile.save();

    res.status(201).json({ message: 'Profile created successfully', profile: savedProfile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Failed to create profile', error: error.message });
  }
};

module.exports = {
  createProfile
};
