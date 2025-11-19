const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs"); // Import the 'fs' module
const cron = require("node-cron");
// const cors = require("cors");
const cookieParser = require("cookie-parser");
const { City } = require('country-state-city');
const { Country } = require('country-state-city');

require("dotenv").config();
const app = express();

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));  

// Set a longer timeout for requests
app.use((req, res, next) => {
  req.setTimeout(120000); // 2 minutes
  next();
});

// Handle request aborts gracefully
app.use((req, res, next) => {
  req.on('aborted', () => {
    console.log('Request aborted by the client');
  });
  next();
});

// MongoDB connection
const dbUri = process.env.DATABASE_URI || "mongodb+srv://harshit:Harshit%40123@userinfo.lmbsytd.mongodb.net/BNI";
if (!dbUri) {
  console.error("FATAL ERROR: DATABASE_URI is not defined in the environment variables.");
  process.exit(1); // Exit the process with a failure code
}

mongoose.connect(dbUri)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Also exit if the connection fails
  });

// API routes
app.get('/countries', (req, res) => {
  const countries = Country.getAllCountries().map(country => ({
    name: country.name,
    shortName: country.isoCode,
    flagImage: `https://flagcdn.com/w320/${country.isoCode.toLowerCase()}.png`,
  }));

  res.json(countries);
});

app.get('/countries/:countryCode', (req, res) => {
  const countryCode = req.params.countryCode;

  try {
    const cities = City.getCitiesOfCountry(countryCode);

    if (!cities || cities.length === 0) {
      return res.status(404).json({ message: 'No cities found for the given country code' });
    }

    res.json(cities);
  } catch (error) {
    res.status(400).send(error);
  }
});
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

// Route imports
const user = require("./route/user");
const country = require("./route/country");
const city2 = require("./route/city");
const chapter = require("./route/chapter");
const department = require("./route/department");
const member = require("./route/member");
const myGives = require("./route/myGives");
const myAsk = require("./route/myAsk");
const client = require("./route/client");
const mymatch = require("./route/myMaches");
const image = require("./route/image");
const industry = require("./route/industry");
const business = require("./route/business");
const pdf = require("./route/pdf");
const profile = require("./route/profile");
const company = require("./route/company");
const dashboard = require("./route/dashboard");

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

const uploadDir = path.join(__dirname, 'uploads'); // Define the upload directory

app.get('/download/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);

  if (fs.existsSync(filePath)) {
      res.download(filePath, fileName, (err) => {
          if (err) {
              res.status(500).json({ message: 'Failed to download file' });
          }
      });
  } else {
      res.status(404).json({ message: 'File not found' });
  }
});

// Route setup
app.use("/api/user", user); 
app.use("/api/country", country);
app.use("/api/city", city2);
app.use("/api/chapter", chapter);
app.use("/api/department", department);
app.use("/api/member", member);
app.use("/api/myGives", myGives);
app.use("/api/client", client);
app.use("/api/myAsk", myAsk);
app.use("/api/match2", mymatch);
app.use("/api/image", image);
app.use("/api/industry", industry);
app.use("/api/business", business);
app.use("/api/pdf", pdf);
app.use("/api/profile", profile);
app.use("/api/company", company);
app.use("/api/dashboard", dashboard);
app.use("/api/calendar", require("./route/calender"));

// Test route
app.get("/test", (req, res) => {
  res.json("hello world"); 
});

// Catch-all route to handle all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});



// Start server
const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
