const user = require("../model/user.js");
const bcrypt = require("bcryptjs");
// const transporter = require("../db/emailConfig.js");
const Jwt = require("jsonwebtoken");
const { generateOTP, sendEmail } = require("../utils/emailUtils.js");
const {
  validateEmail,
  validateMobile,
  validateStrongPassword,
} = require("../utils/allValidations.js");

const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const userRegistration = async (req, res) => {
  const { firstName, lastName, email, password, confirm_password } = req.body;
  const photo = req.files.map((file) => file.filename);

  try {
    // Check if the email already exists
    const existingUser = await user.findOne({ email: email });
    if (existingUser) {
      return res.send({ status: "failed", message: "Email already exists" });
    }

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !photo || !password || !confirm_password) {
      console.log("Validation failed.......");
      return res.send({ status: "failed", message: "All fields are required" });
    }

    // Check if password and confirm_password match
    if (password !== confirm_password) {
      return res.send({
        status: "failed",
        message: "Password and confirm password do not match",
      });
    }

    // Generate a unique 6-digit alphanumeric referral code
    const refral_code = generateReferralCode();

    // Save the user to the database
    const doc = new user({
      firstName,
      lastName,
      email,
      photo,
      password: password, // Storing password in plain text (insecure)
      refral_code, // Add the generated referral code
    });

    await doc.save();

    // Redirect to the login page
    res.status(200).send({ status: "true", message: "User registered successfully", refral_code });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "failed", message: "Unable to register" });
  }
};


// Login from
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if all required fields are provided
    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "All fields (email, password) are required",
      });
    }

    // Find the user by email
    const User = await user.findOne({ email: email });
    if (!User) {
      return res
        .status(404)
        .json({ status: "failed", message: "You are not a registered user" });
    }

    // Directly compare the provided password with the stored password (insecure)
    const isMatch = password === User.password;
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: "failed", message: "Email or password is not valid" });
    }

    // Generate JWT Token
    const token = Jwt.sign({ userId: User._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "5d",
    });
  res.cookie("token", token);
    res.cookie("userRole", "admin");

    // Respond with success, token, and user data
    res.json({
      status: "success",
      message: "Login success",
      token: token,
      User,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ status: "failed", message: "Unable to login" });
  }
};


//

//forgot password

const sendUserPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    // Check if the user exists
    const User = await user.findOne({ email });
    if (!User) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    console.log(User,"user")
    // Generate OTP
    const otp = generateOTP();

    // Save the OTP to the user's document (optional)
    User.resetOTP = otp;
    await User.save();

    // Send email with OTP
    const subject = "Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}`;
    await sendEmail(User.email, subject, text);
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

const userPasswordReset = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    // Check if the user exists
    const User = await user.findOne({ resetOTP: otp });
    if (!User) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify OTP
    if (User.resetOTP !== otp) {
      return res.status(401).json({ success: false, message: "Invalid OTP" });
    }

    // // Validate new password format
    // if (!validateStrongPassword(newPassword)) {
    //   return res
    //     .status(400)
    //     .json({ success: false, message: 'Invalid password format' });
    // }

    // Update password
    User.password = newPassword; // Storing new password in plain text (insecure)
    User.resetOTP = undefined; // Clear the OTP field
    await User.save();
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

const logoutUser = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', { 
      httpOnly: true,
      sameSite:"None",
      secure:true 

    });
    return res.status(200).json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


const getUserById = async (req, res) => {
  try {
    const userId =  req.userId;
    const User = await user.findById(userId);
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ data: User });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateUserById = async (req, res) => {
  try {
    const userId = req.userId;
    const userData = req.body;

    console.log('userId:', userId);
    console.log('userData:', userData);

    // Exclude sensitive fields from being updated
    const { password, confirm_password, resetOTP, ...updateData } = userData;

    // Add updatedAt field
    updateData.updatedAt = Date.now();

    console.log('updateData:', updateData);

    // Check if the user exists before updating
    const existingUser = await user.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await user.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found after update attempt" });
    }

    res.status(200).json({ data: updatedUser, message: "Update successful" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await user.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  userRegistration,
  userLogin,
  sendUserPasswordResetEmail,
  userPasswordReset,
  logoutUser,
  getUserById,
  updateUserById, 
  deleteUserById
};
