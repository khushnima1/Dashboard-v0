const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

// Log the current directory and build path
console.log('Current directory:', __dirname);
console.log('Build path:', path.join(__dirname, 'frontend', 'build'));

// Check if build directory exists
const buildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  console.log('Build directory exists');
} else {
  console.log('Build directory does not exist');
}

// Serve static files from the React app
app.use(express.static(buildPath));

// Serve the index.html file when the root is accessed
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
console.log(MONGODB_URI);

const DB_NAME = 'HOMO';
const COLLECTION_NAME = 'VEHICLED';

let dbClient;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    dbClient = new MongoClient(MONGODB_URI);
    await dbClient.connect();
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

// Initialize MongoDB connection
connectToMongoDB();

// Format date to DD-MM-YYYY
const formatDate = (dateString) => {
  const [yyyy, mm, dd] = dateString.split('-');
  return `${dd}-${mm}-${yyyy}`;
};

// New endpoint to get vehicle details from MongoDB
app.get('/api/vehicle-details/:imei', async (req, res) => {
  const { imei } = req.params;

  if (!imei) {
    return res.status(400).json({ message: 'IMEI is required' });
  }

  try {
    if (!dbClient) {
      return res.status(500).json({ message: 'Database connection not available' });
    }

    const db = dbClient.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const vehicleData = await collection.findOne({ imei: imei });

    if (!vehicleData) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Extract and format the required data
    const response = {
      imei: vehicleData.imei,
      vehicleNo: vehicleData.vehicleNo,
      vehicleModel: vehicleData.vehicleModel,
      frameNo: vehicleData.frameNumber,
      batteryNo: vehicleData.batteryNo,
      dealerInfo: {
        name: vehicleData.dealerName,
        location: vehicleData.location
      },
      customerDetails: {
        name: vehicleData.customerDetails?.name,
        phone: vehicleData.customerDetails?.contact,
        address: vehicleData.customerDetails?.address || 'Not Available'
      },
      bmsSpecs: {
        software: vehicleData.bmsFirmwareVersion?.software,
        hardware: vehicleData.bmsFirmwareVersion?.hardware
      },
      saleDate: vehicleData.saleDate
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching vehicle details from MongoDB:', error);
    res.status(500).json({ 
      message: 'Failed to fetch vehicle details',
      details: error.message
    });
  }
});

// Enhanced endpoint to get all vehicles with MongoDB data
app.get('/api/vehicles-enhanced', async (req, res) => {
  try {
    // First get devices from the original API
    const response = await axios.get('https://ev-backend.trakmatesolutions.com/extapi/devices', {
      params: {
        currentIndex: req.query.currentIndex || 0,
        sizePerPage: req.query.sizePerPage || 10
      },
      headers: {
        'accept': '*/*',
        'apikey': '82fcc5bc-4748-42b3-b664-a3768b5175b9'
      }
    });

    if (!response.data || !response.data.entities) {
      return res.status(500).json({ message: 'Invalid response from external API' });
    }

    const vehicles = response.data.entities;

    // Enhance each vehicle with MongoDB data if available
    const enhancedVehicles = await Promise.all(
      vehicles.map(async (vehicle) => {
        try {
          if (dbClient) {
            const db = dbClient.db(DB_NAME);
            const collection = db.collection(COLLECTION_NAME);
            const mongoData = await collection.findOne({ imei: vehicle.imei });

            if (mongoData) {
              // Override with MongoDB data where available
              return {
                ...vehicle,
                vehicleNo: mongoData.vehicleNo || vehicle.vehicleNo,
                vehicleModel: mongoData.vehicleModel || vehicle.vehicleModel,
                frameNo: mongoData.frameNumber || vehicle.frameNo,
                batteryNo: mongoData.batteryNo || vehicle.batteryNo,
                dealerName: mongoData.dealerName || vehicle.dealerName,
                dealerLocation: mongoData.location || vehicle.dealerLocation,
                customerName: mongoData.customerDetails?.name || vehicle.customerName,
                customerPhone: mongoData.customerDetails?.contact || vehicle.customerPhone,
                customerAddress: mongoData.customerDetails?.address || vehicle.customerAddress,
                bmsSoftware: mongoData.bmsFirmwareVersion?.software,
                bmsHardware: mongoData.bmsFirmwareVersion?.hardware,
                saleDate: mongoData.saleDate || vehicle.saleDate
              };
            }
          }
          return vehicle;
        } catch (error) {
          console.error(`Error enhancing vehicle ${vehicle.imei}:`, error);
          return vehicle; // Return original vehicle if enhancement fails
        }
      })
    );

    res.json({
      ...response.data,
      entities: enhancedVehicles
    });

  } catch (error) {
    console.error('Error fetching enhanced vehicles:', error);
    res.status(500).json({ 
      message: 'Failed to fetch vehicles',
      details: error.message
    });
  }
});

app.get('/api/battery-data', async (req, res) => {
  const { imei, startDate, endDate } = req.query;

  if (!imei || !startDate || !endDate) {
    return res.status(400).json({ message: 'imei, startDate, and endDate are required' });
  }

  try {
    const formattedStartDate = formatDate(startDate);
    const formattedEndDate = formatDate(endDate);
    const encodedImei = encodeURIComponent(imei);

    const url = `https://ev-backend.trakmatesolutions.com/extapi/history/batteryData/${encodedImei}`;

    console.log('Requesting URL:', url);
    console.log('Query parameters:', { startDate: formattedStartDate, endDate: formattedEndDate });

    const response = await axios.get(url, {
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      },
      headers: {
        'apiKey': '82fcc5bc-4748-42b3-b664-a3768b5175b9',
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.results) {
      console.error('Invalid response format:', response.data);
      return res.status(500).json({ 
        message: 'Invalid response format from external API',
        details: response.data 
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from external API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    res.status(500).json({ 
      message: 'Failed to fetch battery data',
      details: error.response?.data || error.message
    });
  }
});

// The "catch-all" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please ensure the frontend is built correctly.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
