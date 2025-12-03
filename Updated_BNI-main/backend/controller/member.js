const Member = require("../model/member.js");
const bcrypt = require("bcryptjs");
const path = require("path");
const User = require("../model/user.js");
const Jwt = require("jsonwebtoken");
const { sendNotification } = require('./sendNotification'); // Import the sendNotification utility
const mongoose = require('mongoose');
const { sendEmail } = require("../utils/memberMail.js");
const {
  validateEmail,
} = require("../utils/allValidations.js");
// Function to generate a 6-digit alphanumeric code
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Function to send notification to the referrer
const sendReferralNotification = async (referrer, newMemberName) => {
  try {
    if (referrer.deviceTokens && referrer.deviceTokens.length > 0) {
      const notificationData = {
        title: `Referral Used`,
        body: `${newMemberName} has used your referral code.`,
        token: referrer.deviceTokens[0], // Assuming the first token is valid
      };

      // Send the notification
      const notificationResponse = await sendNotification(notificationData);
      return notificationResponse;
    } else {
      console.warn("No device tokens found for referrer:", referrer._id);
    }
  } catch (error) {
    console.error("Error sending referral notification:", error);
  }
};

const crypto = require('crypto'); // Make sure to require the crypto module
const secretKey = process.env.SECRET_KEY || 'your_secret_key'; // Use an environment variable for the secret key

// Encryption function
// SECURITY WARNING: This function now stores passwords in plain text.
function encryptPassword(password) {
  return password;
}


// Decryption function
// SECURITY WARNING: This function now handles passwords in plain text.
function decryptPassword(encryptedPassword) {
  return encryptedPassword;
}


const memberRegistration = async (req, res) => {
  const { name, email, mobile, password, confirm_password, country, city, ref_member } = req.body;
console.log(req.body)
  // Safely handle optional images, checking if req.files exists
  const bannerImg = req.files && req.files['bannerImg'] ? path.basename(req.files['bannerImg'][0].path) : null;
  const profileImg = req.files && req.files['profileImg'] ? path.basename(req.files['profileImg'][0].path) : null;

  try {
    // Check if the email already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).send({ status: "failed", message: "Email already exists" });
    }

    // Check if the mobile number already exists
    const existingMobile = await Member.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).send({ status: "failed", message: "Mobile number already exists" });
    }

    // // Check if all required fields are provided
    // if (!name || !email || !mobile || !password || !confirm_password || !country || !city) {
    //   return res.status(400).send({ status: "failed", message: "All fields are required" });
    // }

    // Check if password and confirm_password match
    if (password !== confirm_password) {
      return res.status(400).send({ status: "failed", message: "Password and confirm password do not match" });
    }

    // Encrypt the password using the encryptPassword function
    const encryptedPassword = encryptPassword(password);

    // Generate a unique 6-digit alphanumeric referral code for the new member
    const refral_code = generateReferralCode();

    // Default approval statuses
    let approvedByadmin = "pending";
    let approvedBymember = "pending";

    // Find the referrer by referrer_code in both User and Member collections
    let referrer = await User.findOne({ refral_code: ref_member });

    let notificationResponses = [];

    if (referrer) {
      approvedByadmin = "approved";
      approvedBymember = "approved";
      const referrerNotificationResponse = await sendReferralNotification(referrer, name);
      notificationResponses.push(referrerNotificationResponse);
    } else {
      referrer = await Member.findOne({ refral_code: ref_member });
      if (referrer) {
        const referrerNotificationResponse = await sendReferralNotification(referrer, name);
        notificationResponses.push(referrerNotificationResponse);
      }
    }

    // Create the new member object
    const newMember = new Member({
      name,
      email,
      mobile,
      country,
      city,
      bannerImg,
      profileImg,
      refral_code,
      password: encryptedPassword, // Save encrypted password
      approvedByadmin,
      ref_member,
      approvedBymember
    });

    // Send a notification to the new member for registration confirmation
    if (newMember.deviceTokens && newMember.deviceTokens.length > 0) {
      const memberNotificationData = {
        title: 'Registration Confirmation',
        body: `Hi ${name}, Welcome to our platform!`,
        token: newMember.deviceTokens[0], // Get the first token for simplicity
      };

      // Directly send the notification without validating the token
      const memberNotificationResponse = await sendNotification(memberNotificationData);
      notificationResponses.push(memberNotificationResponse);
    }

    // Save the new member to the database
    await newMember.save();

    // Respond with success message
    res.status(200).send({
      status: "success",
      message: "Member Registered Successfully",
      newMember,
      notificationResponses
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "failed", message: "Unable to register" });
  }
};




// Login from
const memberLogin = async (req, res) => {
  try {
    const { email, password, deviceTokens } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "failed", message: "Email and password are required" });
    }

    // Find the member by email
    const member = await Member.findOne({ email });
    if (!member) {
      return res.status(404).json({ status: "failed", message: "Member not found" });
    }

    // Decrypt the stored password
    const decryptedPassword = decryptPassword(member.password);

    // Check if the provided password matches the decrypted password
    if (password !== decryptedPassword) {
      return res.status(401).json({ status: "failed", message: "Invalid email or password" });
    }

    // Check if the member has been approved by the admin
    if (member.approvedByadmin !== 'approved') {
      return res.status(403).json({ status: "failed", message: "Your account is pending administrator approval. You will be able to log in once your account has been approved." });
    }

    // Handle deviceTokens and generate JWT if login is successful
    // Replace deviceToken if it exists, otherwise add it
    if (!member.deviceTokens.includes(deviceTokens)) {
      member.deviceTokens.push(deviceTokens);
      await member.save();
    }

    const userId = member._id;
    const token = Jwt.sign({ userId, role: "member" }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });

    // Set the token in a cookie
    res.cookie("token", token);
    res.cookie("userRole", "member");

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      role: "member",
      member,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: "Unable to login" });
  }
};




//forgot password

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendmemberPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Check if the member exists
    const member = await Member.findOne({ email });
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "member not found" });
    }
    console.log(member,"member")
    // Generate OTP
    const otp = generateOTP();

    // Save the OTP to the member's document (optional)
    member.resetOTP = otp;
    await member.save();

    // Send email with OTP
    const subject = "Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}`;
    await sendEmail(member.email, subject, text);
    // res.redirect("/reset_password");
    // Return success response
    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const memberPasswordReset = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    // Check if the member exists
    const member = await Member.findOne({ resetOTP: otp });
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "member not found" });
    }

    // Verify OTP
    if (member.resetOTP !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // Update password
    // SECURITY WARNING: Storing new password in plain text.
    member.password = newPassword;
    member.resetOTP = undefined; // Clear the OTP field
    await member.save();
    // res.redirect("/login");
    // Return success response
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const logoutmember = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', { 
      httpOnly: true,
      sameSite:"None",
      secure:true 

    });
    return res.status(200).json({ success: true, message: "member logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getmemberById = async (req, res) => {
  const { id } = req.query;

  try {
    // Find member by ID
    const member = await Member.findById(id);
    
    // Check if member exists
    if (!member) {
      return res.status(404).json({ status: "failed", message: 'Member not found' });
    }

    // Decrypt the password before sending it back
    const decryptedPassword = decryptPassword(member.password);

    // Respond with member data, including the decrypted password
    res.status(200).json({ 
      status: "success", 
      data: {
        ...member.toObject(), // Convert mongoose document to plain object
        password: decryptedPassword // Replace hashed password with decrypted password
      }
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: 'Server error', error });
  }
};



const getAllmember = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const limit = 5;
    // Get the total count of members
    const count = await Member.countDocuments();
    // Fetch members with pagination
  // Example projection to fetch specific fields
const members = await Member.find().skip((page - 1) * limit).limit(limit);

    // Check if members were found
    if (!members || members.length === 0) {
      return res.status(404).json({ message: "No members found" });
    }
    // Calculate if there is a next page
    const hasNextPage = count > page * limit;
    // Send response
    res.status(200).json({
      data: members,
      total: count, // Ensure this field is named 'total'
      currentPage: page,
      hasNextPage: hasNextPage,
      message: "Members fetched successfully",
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: "Server error" });
  }
};


const updatememberById = async (req, res) => {
  const { id } = req.query;
  const updateFields = {};
  const updatedFields = {};

  try {
    // Check if the mobile number is being updated and if it's already in use
    if (req.body.mobile) {
      const existingMember = await Member.findOne({ mobile: req.body.mobile, _id: { $ne: id } });
      if (existingMember) {
        return res.status(400).json({ status: "failed", message: "Mobile number is already in use by another member." });
      }
    }

    // Handle file uploads if req.files is defined
    if (req.files) {
      if (req.files['bannerImg'] && req.files['bannerImg'].length > 0) {
        updateFields.bannerImg = path.basename(req.files['bannerImg'][0].path);
        updatedFields.bannerImg = updateFields.bannerImg;
      }
      if (req.files['profileImg'] && req.files['profileImg'].length > 0) {
        updateFields.profileImg = path.basename(req.files['profileImg'][0].path);
        updatedFields.profileImg = updateFields.profileImg;
      }
    }

    // Update other fields from req.body
    for (const key in req.body) {
      if (key !== 'bannerImg' && key !== 'profileImg') {
        if (key === 'password') {
          // Encrypt the password before saving
          updateFields[key] = encryptPassword(req.body[key]);
          updatedFields[key] = '*****'; // Avoid sending the encrypted password in response
        } else {
          updateFields[key] = req.body[key];
          updatedFields[key] = req.body[key]; 
        }
      }
    }

    // Update Member data in the database
    const updatedMember = await Member.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ); 

    if (!updatedMember) {
      return res.status(404).json({ status: "failed", message: 'Member not found' });
    }

    // Send a notification to the user that their profile was updated
    if (updatedMember.deviceTokens && updatedMember.deviceTokens.length > 0) {
      const notificationData = {
        notification: {
          title: 'Profile Updated',
          body: 'Your profile information has been successfully updated.',
        }
      };

      // Send notification to all registered device tokens for the user
      for (const token of updatedMember.deviceTokens) {
        if (token) { // Ensure the token is not null or empty
          try {
            await sendNotification({ ...notificationData, token });
            console.log(`Notification sent to token ${token}`);
          } catch (notificationError) {
            console.error(`Failed to send notification to token ${token}:`, notificationError);
          }
        }
      }
    }

    // Respond with updated fields only
    res.status(200).json({ status: "success", message: 'Member updated successfully', id: updatedMember._id, updatedFields });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: 'Server error', error });
  }
};



const deletememberById = async (req, res) => {
  try {
    const { id } = req.query;
    const deletedmember = await Member.findByIdAndDelete(id);
    if (!deletedmember) {
      return res.status(404).json({ message: "member not found" });
    }
    res.status(200).json({ message: "member deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const Totalmember = async (req, res) => {
  try {
    const Totalmembers = await Member.find().countDocuments();
      console.log(Totalmembers);
      return res
      .status(200)
      .json({success:true , message:`total members are ${Totalmembers}`, Totalmembers })

  } catch (error) {
      console.log(error)
      return res
      .status(500)
      .json({success:false , message:"server error"})
  }
}


const getAllmemberDropdown = async (req, res) => {
  try {
      // const { page = 1 } = req.query;
      // const limit = 5;
      // const count = await members.countDocuments();
      const members = await Member.find()
      // .skip((page - 1) * limit) // Skip records for previous pages
      // .limit(limit);;
      res.status(200).json(
        {
          data: members,
          // total: count,
          // currentPage: page,
          // hasNextPage: count > page * limit,
          message: "members fetched successfully"
        }
      );
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};


// check user verify or not
const isMemberVerify = async (req, res) => {
  try {
    const memberId = req.query.id; // Extract the 'id' as a string from 'req.query'
    
    // Validate the ObjectId format
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    // Select only 'approvedByAdmin' and 'approvedByMember' fields
    const member = await Member.findById(memberId).select('approvedByadmin approvedBymember');
    console.log(member)
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Ensure that the response includes default values if the fields are missing
    res.status(200).json({
      data: {
        approvedByAdmin: member.approvedByadmin || false,
        approvedByMember: member.approvedBymember || false,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


//get member by reference code
const getMemberByRef = async (req, res) => {
  try {
    const {refMember} = req.query; // Extract 'ref_member' from the query parameters
    console.log(refMember)
    // Validate that the 'ref_member' is provided
    if (!refMember) {
      return res.status(400).json({ message: "ref_member is required" });
    }

    // Find member by 'ref_member' field
    const member = await Member.find({ ref_member: refMember });
    
    if (!member) {
      return res.status(404).json({ data: " " });
    }

    res.status(200).json({ data: member });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// only approved member get to show admin side 
const getApprovedMember = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0; // Default to 0 if no page is provided
    const limit = parseInt(req.query.limit) || 0; // Default to 0 if no limit is provided

  

    let members;

    // If page and limit are provided, paginate the result
    if (page && limit) {
      members = await Member.find()
        .sort({ createdAt: -1 }) // Sort by 'createdAt' in descending order
        .skip((page - 1) * limit) // Skip records of previous pages
        .limit(limit); // Limit to the number of records per page
    } else {
      // If no pagination params are provided, return all data
      members = await Member.find().sort({ createdAt: -1 }); // Sort by 'createdAt' in descending order
    }

    // Check if members were found
    if (!members || members.length === 0) {
      return res.status(404).json({ message: "No approved members found" });
    }

    // Count total approved members matching the query
    const totalApprovedMembers = await Member.countDocuments();

    // Initialize an array to hold promises for referral counts
    const referralCountsPromises = members.map(async (member) => {
      // Count members that joined using this member's referral code
      const totalReferralMembers = await Member.countDocuments({
        ref_member: member.refral_code,
        approvedByadmin: "approved",
        // approvedBymember: "approved"
      });
      return {
        ...member.toObject(), // Convert Mongoose Document to plain object
        referralCount: totalReferralMembers // Count of members who joined using this referral code
      };
    });

    // Wait for all referral counts to be resolved
    const membersWithCounts = await Promise.all(referralCountsPromises);

    // Return the approved member data with pagination info
    res.status(200).json({
      data: membersWithCounts,
      total: totalApprovedMembers, // Total number of approved members
      currentPage: page || "all", // Page number or 'all'
      hasNextPage: page && limit ? members.length === limit : false // Check if more pages exist
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



//  approved member get to show admin side 
const getMemberApprovedData= async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0; // If no page is provided, default to 0 (show all)
    const limit = parseInt(req.query.limit) || 0; // If no limit is provided, show all data

    // Find members that are approved by both Admin and Member
    const query = {
      approvedBymember: "approved",
      approvedByadmin: { $in: ["pending", "cancel"] } // MongoDB query operator for "in"
    };
    

    let members;
    
    // If page and limit are provided, paginate the result
    if (page && limit) {
      members = await Member.find(query)
        .skip((page - 1) * limit) // Skip the records of previous pages
        .limit(limit); // Limit to the number of records per page
    } else {
      // If no pagination params are provided, return all data
      members = await Member.find(query);
    }

    // Check if members were found
    if (!members || members.length === 0) {
      return res.status(404).json({ message: "No Member approved members found" });
    }

    // Return the approved member data with pagination info
    res.status(200).json({ 
      data: members,
      total: await Member.countDocuments(query), // Total number of approved members
      currentPage: page || "all", // Page number or 'all'
      hasNextPage: page && limit ? members.length === limit : false // Check if more pages exist
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const adminMemberRegistration = async (req, res) => {
  const { name, email, mobile, password, confirm_password, country, city, whatsapp, twitter, linkedin, facebook } = req.body;
  console.log(req.body);

  // Handle optional images
  const bannerImg = req.files && req.files['bannerImg'] ? path.basename(req.files['bannerImg'][0].path) : null;
  const profileImg = req.files && req.files['profileImg'] ? path.basename(req.files['profileImg'][0].path) : null;
// Generate a unique 6-digit alphanumeric referral code for the new member
const refral_code = generateReferralCode();

  try {
    // Check if the email already exists
    const member = await Member.findOne({ email });
    if (member) {
      return res.status(400).send({ status: "failed", message: "Email already exists" });
    }

    // Check if all required fields are provided
    if (!name || !email || !mobile || !password || !confirm_password || !country || !city) {
      return res.status(400).send({ status: "failed", message: "All fields are required" });
    }

    // Check if password and confirm_password match
    if (password !== confirm_password) {
      return res.status(400).send({ status: "failed", message: "Password and confirm password do not match" });
    }

    // Encrypt the password using your custom encryptPassword function
    const encryptedPassword = await encryptPassword(password);

    // Save the member to the database
    const newMember = new Member({
      name,
      email,
      mobile,
      country,
      bannerImg,   // Optional
      profileImg,  // Optional
      refral_code,
      city,
      whatsapp,
      twitter,
      linkedin,
      facebook,
      approvedByadmin: "approved",
      approvedBymember: "approved",
      password: encryptedPassword,  // Save the encrypted password
    });

    // Send email confirmation (implement sendEmail function as needed)
    const subject = 'Registration Confirmation';
    await sendEmail(email, subject, name, email, mobile);

    // Save new member
    await newMember.save();

    // Respond with success message
    res.status(200).send({ status: "success", message: "Member Registered Successfully", newMember });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "failed", message: "Unable to register" });
  }
};



// count approved member

const countApprovedMember = async (req, res) => {
  try {
    // Extract ref_member from the request query
    const refMember = req.query.ref_member;

    // Build the query to find approved members, including filtering by ref_member if provided
    const query = {
      approvedByadmin: "approved",
      approvedBymember: "approved",
      ...(refMember && { ref_member: refMember }) // Add ref_member to query if it exists
    };

    // Count total approved members matching the query
    const totalApprovedMembers = await Member.countDocuments(query);

    // Return the count of approved members
    res.status(200).json({ 
      data: totalApprovedMembers
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


//pending member user side
const getMemberPendingData = async (req, res) => {
  try {
    const { refMember, status } = req.query; // Extract 'refMember' and 'status' from the query parameters
    console.log('refMember:', refMember, 'status:', status); // Log the values received

    // Validate that the 'refMember' is provided
    if (!refMember) {
      return res.status(400).json({ message: "refMember is required" });
    }

    // Find members by 'refMember' and 'approvedBymember' as "pending"
    const members = await Member.find({
      ref_member: refMember,
      approvedBymember: status // Ensure 'status' is the correct value you expect (e.g., "pending")
    });

    console.log('Fetched members:', members); // Log fetched members

    if (!members || members.length === 0) {
      return res.status(200).json({data:[] });
    }

    res.status(200).json({ data: members });
  } catch (error) {
    console.error("Error fetching members by ref_member:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyMemberSessions = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log("Verifying token:", token);
    if (!token) {
      return res.status(401).json({ isLoggedIn: false, role: null });
    }

    // Verify the token
    const decoded = Jwt.verify(token, process.env.JWT_SECRET_KEY);
console.log("Decoded token:", decoded);
    // The role is stored in the token, so we can return it
    res.status(200).json({
      isLoggedIn: true,
      role: decoded.role || 'member', // Default to member if role is somehow missing
      userId: decoded.userId
    });
  } catch (error) {
    // If token is invalid or expired
    return res.status(401).json({ isLoggedIn: false, role: null });
  }
};



module.exports = {
  getMemberPendingData,
  memberRegistration,
  memberLogin,
  sendmemberPasswordResetEmail,
  memberPasswordReset,
  logoutmember,
  getmemberById,
  updatememberById,
  deletememberById,
  getAllmember,
  Totalmember,
  getAllmemberDropdown,
  isMemberVerify,
  getMemberByRef,
  getApprovedMember,
  getMemberApprovedData,
  adminMemberRegistration,
  countApprovedMember,
  verifyMemberSessions
};
