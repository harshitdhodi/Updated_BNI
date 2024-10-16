const Client = require('../model/client');
const bcrypt = require('bcryptjs');

// Example controller function to create a new Client

const addClient = async (req, res) => {
    try {
      const { country, city, chapter, email, password, confirm_password } = req.body;
      console.log(country, city, chapter, email, password, confirm_password )
      // Check if confirm_password is provided
      if (!confirm_password) {
        return res.status(400).json({ status: 'failed', message: 'Confirm password is required' });
      }
  
      // Check if Client already exists with the same email
      const existingClient = await Client.findOne({ email });
      if (existingClient) {
        return res.status(400).json({ status: 'failed', message: 'Email already exists' });
      }
  
      // Check if all required fields are provided
      if (!country || !city || !chapter || !email || !password) {
        return res.status(400).json({ status: 'failed', message: 'All fields are required' });
      }
  
      // Check if password and confirm_password match
      if (password !== confirm_password) {
        return res.status(400).json({
          status: 'failed',
          message: 'Password and confirm password do not match',
        });
      }
  
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  console.log(hashedPassword)
      // Create new Client instance with hashed password
      const newClient = new Client({ country, city, chapter, email, password: hashedPassword });
  console.log(newClient)
      // Save Client to the database
      await newClient.save();
  
      res.status(201).json({ status: 'success', message: 'Client created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'failed', message: 'Unable to create Client' });
    }
  };
  

module.exports = {
  addClient,
};
