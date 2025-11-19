// controllers/countryController.js
const City = require('../model/city');
const Country = require('../model/country');
const { City: CityLib } = require('country-state-city');
const { Country: CountryLib } = require('country-state-city');

// Corrected code for backend/controller/city.js

const addCity = async (req, res) => {
  try {
    const { name, countryName } = req.body;
  
    // Basic validation
    if (!name || !countryName) {
      return res.status(400).json({ message: "City name and country are required." });
    }

    // Check if the city already exists for this user
    const existingCity = await City.findOne({ name, countryName });
    if (existingCity) {
      return res.status(409).json({ message: "This city already exists in your list." });
    }

    // Create the new city, correctly assigning the user ID
    const newCity = await City.create({
      name,
      countryName,
    });

    res.status(201).json({
      success: true,
      message: "City added successfully",
      data: newCity,
    });
  } catch (error) {
    console.error("Error creating city:", error);
    res.status(500).json({ message: "Server error while creating city." });
  }
};


// Get all city
const getCity = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = parseInt(req.query.limit) || 10;
        const count = await City.countDocuments();
        const city = await City.find()
        .skip((page - 1) * limit) // Skip records for previous pages
        .limit(limit);
        res.status(200).send({
            data: city,
            total: count,
            currentPage: page,
            hasNextPage: count > page * limit,
            message: "cities fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching city:", error);
        res.status(400).send(error);
    }
};

// Get a single city by ID
const getCityById = async (req, res) => {
    try { 
        const { id } = req.query;
        const city = await City.findById(id);

        if (!city) {
            return res.status(404).send({ message: 'city not found' });
        }

        res.status(200).send(city);
    } catch (error) {
        console.error("Error fetching city:", error);
        res.status(400).send(error);
    }
};

// Update a city
const updateCityById = async (req, res) => {
    try {
        const { id } = req.query;
        const { name } = req.body;

        const updateObj = {
            $set: {
                name,
                updatedAt: Date.now()
            }
        };

        const city = await City.findByIdAndUpdate(id, updateObj, { new: true });

        if (!city) {
            return res.status(404).send({ message: 'city not found' });
        }

        res.status(200).send({ city, message: "Update successful" });
    } catch (error) {
        console.error("Error updating city:", error);
        res.status(400).send(error);
    }
};

// Delete a city
const deleteCityById = async (req, res) => {
    try {
        const { id } = req.query;

        const city = await City.findByIdAndDelete(id);

        if (!city) {
            return res.status(404).send({ message: 'city not found' });
        }

        res.status(200).send({ message: "city deleted successfully" });
    } catch (error) {
        console.error("Error deleting city:", error);
        res.status(400).send(error);
    }
};

const TotalCity = async (req, res) => {
    try {
      const TotalCitys = await City.find().countDocuments();
        console.log(TotalCitys);
        return res
        .status(200)
        .json({success:true , message:`total Citys are ${TotalCitys}`, TotalCitys })

    } catch (error) {
        console.log(error)
        return res
        .status(500)
        .json({success:false , message:"server error"})
    }
}

const getAllCity = async (req, res) => {
  try {
     
      const city = await City.find()
      
      res.status(200).send({
          data: city,
         
          message: "cities fetched successfully",
      });
  } catch (error) {
      console.error("Error fetching city:", error);
      res.status(400).send(error);
  }
};

const getCityByCountry = async (req, res) => {
    try { 
        const { countryName } = req.query;
        if (!countryName) {
            return res.status(400).send({ message: 'countryName query parameter is required' });
        }

        const city = await City.find({ countryName: countryName }); // Assuming you might want all cities in a country

        if (!city || city.length === 0) {
            return res.status(404).send({ message: 'City not found' });
        }

        res.status(200).send(city);
    } catch (error) {
        console.error("Error fetching city:", error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
module.exports = {
    addCity,
    getCity,
    getCityById,
    updateCityById,
    deleteCityById,
    TotalCity,
    getAllCity,
    getCityByCountry
};
