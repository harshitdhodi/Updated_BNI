const Country = require('../model/country');

// CREATE - POST
exports.createCountry = async (req, res) => {
    try {
        const { name,short_name } = req.body;
        const photo = req.files.map((file) => file.filename)
        const newCountry = new Country({ name,short_name, photo });
        const savedCountry = await newCountry.save();
        res.status(201).json(savedCountry);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// READ - GET all
exports.getCountries = async (req, res) => {
    try {
        const { page = 1 } = req.query;
        const limit = 85;
        const count = await Country.countDocuments();
        const countries = await Country.find()
            .skip((page - 1) * limit) // Skip records for previous pages
            .limit(limit);

        res.status(200).json({
            data: countries,
           
            message: "Countries fetched successfully",
        });
    } catch (err) {
        console.error("Error fetching countries:", err);
        res.status(400).send(err);
    }
};

// READ - GET by id
exports.getCountryById = async (req, res) => {
    try {
        const country = await Country.findById(req.query.id);
        if (country) {
            res.json(country);
        } else {
            res.status(404).json({ message: 'Country not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// UPDATE - PUT
exports.updateCountry = async (req, res) => {
    try {
        const { id } = req.query;
        const { name,short_name } = req.body;
     
        const photo = req.files ? req.files.map(file => file.filename) : [];

        const updateObj = {
            $set: {}
        }; 

        if (name) updateObj.$set.name = name;
        if (short_name) updateObj.$set.short_name = short_name;
        if (photo.length > 0) updateObj.$set.photo = photo;
        updateObj.$set.updatedAt = Date.now();

        const country = await Country.findByIdAndUpdate(id, updateObj, { new: true });

        if (!country) {
            return res.status(404).send({ message: 'Country not found' });
        }

        res.status(200).send({ country, message: "Update successful" });
    } catch (error) {
        console.error("Error updating country:", error);
        res.status(400).send(error);
    }
};


// DELETE - DELETE 
exports.deleteCountry = async (req, res) => {
    try {
        // Define the list of countries you want to keep
        const countriesToKeep = [
            'Albania', 'Argentina', 'Australia', 'Austria', 'Bahrain', 'Bangladesh',
            'Belgium', 'Belize', 'Benin', 'Brazil', 'Bulgaria', 'Canada', 'Chile',
            'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cyprus', 'Czech Republic',
            'Denmark', 'Dominican Republic', 'Egypt', 'El Salvador', 'Finland', 'France',
            'Germany', 'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hong Kong', 'Hungary',
            'Iceland', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan',
            'Kenya', 'Kuwait', 'Latvia', 'Lebanon', 'Lithuania', 'Luxembourg', 'Malaysia',
            'Malta', 'Mauritius', 'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway',
            'Panama', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar',
            'Romania', 'Russia', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia', 'Slovenia',
            'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand',
            'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States'
        ];

        // Delete all countries except the ones in the countriesToKeep list
        const result = await Country.deleteMany({ name: { $nin: countriesToKeep } });

        res.json({ message: 'Countries deleted', deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.TotalCountry = async (req, res) => {
    try {
      const TotalCountries = await Country.find().countDocuments();
        console.log(TotalCountries);
        return res
        .status(200)
        .json({success:true , message:`total Countrys are ${TotalCountries}`, TotalCountries })

    } catch (error) {
        console.log(error)
        return res
        .status(500)
        .json({success:false , message:"server error"})
    }
}

const { Country: CSC_Country } = require('country-state-city')
exports.fetachAllCountries =  async (req, res) => {
    try {
      const countries = CSC_Country.getAllCountries().map(country => ({
        name: country.name,
        short_name: country.isoCode,
        photo: `https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`,
      }));
  
      // Save to database
      await Country.deleteMany({}); // Clear existing data
      await Country.insertMany(countries);
  
      res.json(countries);
    } catch (error) {
      console.error('Error fetching or saving countries', error);
      res.status(500).send('Internal Server Error');
    }
  };
  