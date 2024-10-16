/***
 * Regular expression
 */

// Regular expression for email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regular expression for mobile number validation
const mobileRegex = /^[0-9]{10}$/;

// Regular expression for strong password validation
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//Regular expression for aadharcard
const aadharRegex = /^\d{4}\s\d{4}\s\d{4}$/;

//Regular expression for pancard 
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

//Regular expression for street
const streetRegex = /^[a-zA-Z0-9\s\,\.\-\/#]+$/;

//Regular expression for city name
const cityRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*$/;

//Regular expression for pincode
const pincodeRegex = /^[0-9]{6}$/;

//Regular expression for DOB
const dobRegex = /^\d{4}-\d{2}-\d{2}$/;


// Validate email format
const validateEmail = (email) => {
  return emailRegex.test(email);
};

// Validate mobile format
const validateMobile = (mobile) => {
  return mobileRegex.test(mobile);
};

// Validate strong password format
const validateStrongPassword = (password) => {
  return passwordRegex.test(password);
};

//Validate aadharcard number
const validateAadhar = (idNumber) => {
    return aadharRegex.test(idNumber);
  }
//Validate pancard number 
  const validatePan = (panNumber) => {
    return panRegex.test(panNumber);
  }

// //Validate street name 
//   const validateStreetName = (street) => {
//     return streetRegex.test(street);
//   }

//Validate city name 
const validateDOB = (DOB) => {
  return dobRegex.test(DOB);
}


//Validate pincode name 
const validatePincode = (pincode) => {
  return pincodeRegex.test(pincode);
}
 




module.exports = {
  validateEmail,
  validateMobile,
  validateStrongPassword,
  validateAadhar,
  validatePan,
  validateDOB,
  validatePincode
};
