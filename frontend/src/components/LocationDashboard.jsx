import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MapPin, 
  Car, 
  Calendar, 
  Route, 
  Clock, 
  Gauge, 
  Navigation, 
  TrendingUp, 
  Activity, 
  AlertCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  PlayCircle,
  StopCircle,
  Compass,
  MapIcon,
  Target
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Enhanced chart configurations with improved styling
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 24,
        font: {
          size: 13,
          weight: '600',
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#1f2937',
        boxWidth: 12,
        boxHeight: 12
      }
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      borderColor: 'rgba(148, 163, 184, 0.3)',
      borderWidth: 1,
      cornerRadius: 16,
      padding: 16,
      displayColors: true,
      titleFont: { size: 14, weight: '700' },
      bodyFont: { size: 13, weight: '500' },
      boxPadding: 8
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.08)', drawBorder: false },
      ticks: { color: '#64748b', font: { size: 12, weight: '500' }, padding: 8 }
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.08)', drawBorder: false },
      ticks: { color: '#64748b', font: { size: 12, weight: '500' }, padding: 8 }
    }
  }
};

const LocationDashboard = () => {
  // State management
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Date state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalDistance: 0,
    averageSpeed: 0,
    maxSpeed: 0,
    totalPoints: 0,
    runningPoints: 0,
    stoppedPoints: 0,
    averageMaxSpeed: 0,
    dailyBreakdown: [],
    speedTrends: [],
    routeData: [],
    timeSpentMoving: 0,
    timeSpentStopped: 0,
    longestTrip: 0,
    avgTripDistance: 0,
    totalOdometerReading: 0,
    odometerRange: '',
    completedTrips: 0,
    incompleteTrips: 0,
    minOdometerReading: 0
  });

  // API configuration
  const API_CONFIG = {
    devicesURL: 'https://ev-backend.trakmatesolutions.com/extapi/devices',
    locationURL: 'https://ev-backend.trakmatesolutions.com/extapi/history/locationData',
    apiKey: '82fcc5bc-4748-42b3-b664-a3768b5175b9'
  };

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.devicesURL}?currentIndex=0&sizePerPage=100`, {
        headers: {
          'accept': '*/*',
          'apikey': API_CONFIG.apiKey
        }
      });

      let vehicleData = [];
      
      if (response.data && Array.isArray(response.data)) {
        vehicleData = response.data;
      } else if (response.data && response.data.entities && Array.isArray(response.data.entities)) {
        vehicleData = response.data.entities;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        vehicleData = response.data.data;
      }

      if (vehicleData.length > 0) {
        const processedVehicles = vehicleData.map(vehicle => ({
          imei: vehicle.imei || vehicle.deviceId || 'Unknown',
          name: vehicle.vehicleName || vehicle.vehicleNumber || vehicle.name || vehicle.imei || 'Unknown Vehicle',
          status: vehicle.isRunning || vehicle.liv ? (vehicle.mvg ? 'Moving' : 'Idle') : 'Offline',
          speed: vehicle.speed || vehicle.currentSpeed || 0,
          maxSpeed: vehicle.maxSpeed || vehicle.topSpeed || 0,
          voltage: vehicle.voltage || vehicle.batteryVoltage || 0,
          deviceType: vehicle.deviceType || 'EV',
          lastUpdate: vehicle.time || new Date().toISOString()
        }));
        
        setVehicles(processedVehicles);
        
        if (!selectedVehicle && processedVehicles.length > 0) {
          setSelectedVehicle(processedVehicles[0].imei);
        }
      } else {
        // Fallback vehicles for demo
        const fallbackVehicles = [
          { imei: '359214420551701', name: 'Vehicle-001', status: 'Moving', speed: 45, maxSpeed: 80, voltage: 12.5, deviceType: 'EV' },
          { imei: '864207076676382', name: 'Vehicle-002', status: 'Idle', speed: 0, maxSpeed: 75, voltage: 11.8, deviceType: 'EV' },
          { imei: '864207076676383', name: 'Vehicle-003', status: 'Moving', speed: 32, maxSpeed: 85, voltage: 13.2, deviceType: 'EV' }
        ];
        
        setVehicles(fallbackVehicles);
        if (!selectedVehicle) {
          setSelectedVehicle(fallbackVehicles[0].imei);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      // Set fallback data
      const fallbackVehicles = [
        { imei: '359214420551701', name: 'Vehicle-001', status: 'Moving', speed: 45, maxSpeed: 80, voltage: 12.5, deviceType: 'EV' },
        { imei: '864207076676382', name: 'Vehicle-002', status: 'Idle', speed: 0, maxSpeed: 75, voltage: 11.8, deviceType: 'EV' }
      ];
      setVehicles(fallbackVehicles);
      if (!selectedVehicle) {
        setSelectedVehicle(fallbackVehicles[0].imei);
      }
    }
  };

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Format date for API
  const formatDateForAPI = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Process location data and calculate analytics
  const processLocationData = (apiResponse) => {
    if (!apiResponse?.results?.[0]?.series?.[0]) {
      setLocationHistory([]);
      setAnalytics({
        totalDistance: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        totalPoints: 0,
        runningPoints: 0,
        stoppedPoints: 0,
        averageMaxSpeed: 0,
        dailyBreakdown: [],
        speedTrends: [],
        routeData: [],
        timeSpentMoving: 0,
        timeSpentStopped: 0,
        longestTrip: 0,
        avgTripDistance: 0,
        totalOdometerReading: 0,
        odometerRange: '',
        completedTrips: 0,
        incompleteTrips: 0,
        minOdometerReading: 0
      });
      return;
    }

    const series = apiResponse.results[0].series[0];
    const columns = series.columns;
    const values = series.values;
    
    // Create column index mapping for the LocationLog API structure
    const columnIndex = {};
    columns.forEach((col, index) => {
      columnIndex[col] = index;
    });

    console.log('Available columns:', columns);
    console.log('Column indices:', columnIndex);

    let totalDistance = 0;
    let maxSpeed = 0;
    let totalSpeed = 0;
    let runningPoints = 0;
    let stoppedPoints = 0;
    const dailyStats = {};
    const routePoints = [];
    const speedTrends = [];
    let movingTime = 0;
    let stoppedTime = 0;
    let currentTrip = 0;
    let longestTrip = 0;
    const trips = [];
    let maxOdometerReading = 0;
    let minOdometerReading = Infinity;

    const processedData = values.map((row, index) => {
      // Parse data using correct column indices
      const timestamp = new Date(row[columnIndex.time]);
      const latitude = parseFloat(row[columnIndex.lat]) || 0;
      const longitude = parseFloat(row[columnIndex.lng]) || 0;
      const speed = parseFloat(row[columnIndex.speed]) || 0;
      const ignition = row[columnIndex.ignition] === "1" || row[columnIndex.ignition] === 1;
      const odometerReading = parseFloat(row[columnIndex.odo]) || 0; // Actual odometer from device
      const tripStatus = parseFloat(row[columnIndex.trip]) || 0; // Trip status: 1 = Complete, 0 = Incomplete
      const altitude = parseFloat(row[columnIndex.alt]) || 0;
      const heading = parseFloat(row[columnIndex.hdg]) || 0;
      const satellites = parseFloat(row[columnIndex.sat]) || 0;
      const dateKey = timestamp.toISOString().split('T')[0];

      // Track odometer readings
      maxOdometerReading = Math.max(maxOdometerReading, odometerReading);
      if (odometerReading > 0) {
        minOdometerReading = Math.min(minOdometerReading, odometerReading);
      }

      // Initialize daily stats
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = {
          date: dateKey,
          distance: 0,
          maxSpeed: 0,
          avgSpeed: 0,
          speedSum: 0,
          points: 0,
          movingTime: 0,
          stoppedTime: 0
        };
      }

      // Calculate distance from previous point for analytics
      let segmentDistance = 0;
      if (index > 0) {
        const prevRow = values[index - 1];
        const prevLat = parseFloat(prevRow[columnIndex.lat]) || 0;
        const prevLng = parseFloat(prevRow[columnIndex.lng]) || 0;
        
        if (prevLat && prevLng && latitude && longitude) {
          segmentDistance = calculateDistance(prevLat, prevLng, latitude, longitude);
          totalDistance += segmentDistance;
          dailyStats[dateKey].distance += segmentDistance;
          currentTrip += segmentDistance;
        }
      }

      // Determine trip status and movement
      const isMoving = speed > 5 && ignition;
      
      // Convert trip status from API (1 = Complete, 0 = Incomplete)
      let tripStatusText = '';
      let tripStatusClass = '';
      if (tripStatus === 1) {
        tripStatusText = 'Completed';
        tripStatusClass = 'completed';
      } else if (tripStatus === 0 && isMoving) {
        tripStatusText = 'Active';
        tripStatusClass = 'active';
      } else if (tripStatus === 0 && !isMoving && ignition) {
        tripStatusText = 'Paused';
        tripStatusClass = 'paused';
      } else {
        tripStatusText = 'Stopped';
        tripStatusClass = 'stopped';
      }

      // Generate enhanced location name
      const locationName = generateLocationName(latitude, longitude, speed, ignition, heading, altitude);

      // Track speed and movement
      totalSpeed += speed;
      maxSpeed = Math.max(maxSpeed, speed);
      dailyStats[dateKey].maxSpeed = Math.max(dailyStats[dateKey].maxSpeed, speed);
      dailyStats[dateKey].speedSum += speed;
      dailyStats[dateKey].points++;

      // Classify as moving or stopped
      if (isMoving) {
        runningPoints++;
        dailyStats[dateKey].movingTime += 1;
        movingTime++;
      } else {
        stoppedPoints++;
        dailyStats[dateKey].stoppedTime += 1;
        stoppedTime++;
        
        // End current trip
        if (currentTrip > 0) {
          trips.push(currentTrip);
          longestTrip = Math.max(longestTrip, currentTrip);
          currentTrip = 0;
        }
      }

      // Add to route points for mapping
      routePoints.push({
        latitude,
        longitude,
        speed,
        timestamp,
        ignition,
        odometer: odometerReading,
        tripStatus: tripStatusClass,
        altitude,
        heading
      });

      // Add to speed trends (limit to 50 points for performance)
      if (speedTrends.length < 50) {
        speedTrends.push({
          time: timestamp.toLocaleTimeString(),
          speed: speed,
          moving: isMoving
        });
      }

      return {
        timestamp,
        latitude,
        longitude,
        speed,
        ignition,
        dateKey,
        address: locationName,
        odometer: parseFloat(odometerReading.toFixed(3)), // Use actual odometer reading from device
        tripStatus: tripStatusClass,
        tripStatusText,
        tripValue: tripStatus, // Original API value
        isCompleted: tripStatus === 1,
        altitude,
        heading,
        satellites
      };
    });

    // Final trip if vehicle was moving at end
    if (currentTrip > 0) {
      trips.push(currentTrip);
      longestTrip = Math.max(longestTrip, currentTrip);
    }

    // Calculate final analytics
    const totalPoints = values.length;
    const averageSpeed = totalPoints > 0 ? totalSpeed / totalPoints : 0;
    const dailyStatsArray = Object.values(dailyStats);
    
    // Calculate average of daily max speeds
    const averageMaxSpeed = dailyStatsArray.length > 0 
      ? dailyStatsArray.reduce((sum, day) => sum + day.maxSpeed, 0) / dailyStatsArray.length 
      : 0;

    // Calculate average daily speed for each day
    dailyStatsArray.forEach(day => {
      day.avgSpeed = day.points > 0 ? day.speedSum / day.points : 0;
    });

    const avgTripDistance = trips.length > 0 ? trips.reduce((sum, trip) => sum + trip, 0) / trips.length : 0;
    
    // Calculate total odometer reading (difference between max and min)
    const totalOdometerDistance = minOdometerReading !== Infinity ? maxOdometerReading - minOdometerReading : maxOdometerReading;

    setLocationHistory(processedData);
    setAnalytics({
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      averageSpeed: parseFloat(averageSpeed.toFixed(1)),
      maxSpeed: parseFloat(maxSpeed.toFixed(1)),
      totalPoints,
      runningPoints,
      stoppedPoints,
      averageMaxSpeed: parseFloat(averageMaxSpeed.toFixed(1)),
      dailyBreakdown: dailyStatsArray,
      speedTrends,
      routeData: routePoints,
      timeSpentMoving: movingTime,
      timeSpentStopped: stoppedTime,
      longestTrip: parseFloat(longestTrip.toFixed(2)),
      avgTripDistance: parseFloat(avgTripDistance.toFixed(2)),
      totalOdometerReading: parseFloat(maxOdometerReading.toFixed(2)), // Use actual max odometer reading
      odometerRange: `${minOdometerReading !== Infinity ? minOdometerReading.toFixed(2) : '0'} - ${maxOdometerReading.toFixed(2)} km`,
      completedTrips: processedData.filter(record => record.tripValue === 1).length,
      incompleteTrips: processedData.filter(record => record.tripValue === 0).length,
      minOdometerReading: minOdometerReading !== Infinity ? parseFloat(minOdometerReading.toFixed(2)) : 0
    });
  };

  // Enhanced location name generation with heading and altitude
  const generateLocationName = (lat, lng, speed, ignition, heading = 0, altitude = 0) => {
    // This is an enhanced location naming system
    // In a real application, you would use reverse geocoding APIs like Google Maps, OpenStreetMap, etc.
    
    const latDeg = Math.floor(Math.abs(lat));
    const lngDeg = Math.floor(Math.abs(lng));
    
    // Determine cardinal direction based on heading
    const getCardinalDirection = (heading) => {
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const index = Math.round(heading / 45) % 8;
      return directions[index];
    };

    // Generate contextual names based on speed, ignition, and other factors
    let locationType = '';
    let locationContext = '';
    
    if (speed === 0 && !ignition) {
      locationType = 'Parking Zone';
      locationContext = 'Vehicle Parked';
    } else if (speed === 0 && ignition) {
      locationType = 'Traffic Stop';
      locationContext = 'Engine Running';
    } else if (speed > 80) {
      locationType = 'Express Highway';
      locationContext = 'High Speed Zone';
    } else if (speed > 60) {
      locationType = 'Highway';
      locationContext = 'Major Road';
    } else if (speed > 40) {
      locationType = 'Main Road';
      locationContext = 'City Route';
    } else if (speed > 20) {
      locationType = 'Arterial Road';
      locationContext = 'Urban Area';
    } else if (speed > 0) {
      locationType = 'Local Street';
      locationContext = 'Residential Area';
    } else {
      locationType = 'Location Point';
      locationContext = 'Stationary';
    }

    // Create sector-based identifier
    const sector = `${latDeg}${lngDeg}`;
    const direction = getCardinalDirection(heading);
    
    // Create a comprehensive location name
    const locationName = `${locationType} - Sector ${sector}${direction}`;
    const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const altitudeText = altitude > 0 ? ` (${altitude.toFixed(0)}m)` : '';
    
    return `${locationName}${altitudeText} • ${coordinates}`;
  };

  // Fetch location data for selected vehicle
  const fetchLocationData = async () => {
    if (!selectedVehicle) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `${API_CONFIG.locationURL}/${selectedVehicle}?startDate=${formatDateForAPI(startDate)}&endDate=${formatDateForAPI(endDate)}`;
      console.log('Fetching location data from:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'accept': '*/*',
          'apikey': API_CONFIG.apiKey
        }
      });

      console.log('API Response:', response.data);
      processLocationData(response.data);
    } catch (error) {
      console.error('Error fetching location data:', error);
      console.error('Error details:', error.response?.data);
      setError(`Failed to fetch location data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetchLocationData();
    }
  }, [selectedVehicle, startDate, endDate]);

  if (loading && locationHistory.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative text-center bg-white/90 backdrop-blur-2xl rounded-3xl p-12 shadow-2xl border border-white/50">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full">
              <Loader2 className="h-16 w-16 animate-spin text-white" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-4 mt-8">Loading Location Data</h3>
          <p className="text-lg font-semibold text-slate-600">Fetching advanced GPS tracking information...</p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }}></div>

      {/* Enhanced Header */}
      <div className="relative bg-white/90 backdrop-blur-2xl shadow-xl border-b border-white/40 p-6 sm:p-8 lg:p-12 mb-8 lg:mb-12">
        <div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12 mb-8 lg:mb-10">
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-6">
                <div className="relative group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000"></div>
                  <div className="relative p-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-purple-800 bg-clip-text text-transparent leading-[0.9] tracking-tight">
                    Location History Dashboard
                  </h1>
                  <p className="text-slate-600 text-base sm:text-lg lg:text-2xl font-semibold mt-4 tracking-wide">
                    Advanced Real-time GPS Tracking & Intelligent Route Analytics
                  </p>
                  <p className="text-slate-500 text-sm sm:text-base lg:text-lg mt-2 tracking-wide">
                    Powered by precision GPS technology and AI-driven insights
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <Badge variant="secondary" className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Activity className="w-4 h-4 animate-pulse" />
                  GPS Tracking
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Route className="w-4 h-4" />
                  Route Analysis
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="w-4 h-4" />
                  Performance Metrics
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Navigation className="w-4 h-4" />
                  Real-time
                </Badge>
              </div>
            </div>
            
            <Card className="flex-shrink-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <CardContent className="relative p-6 sm:p-8 lg:p-10 text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-black mb-2">{analytics.totalPoints}</div>
                <div className="text-base sm:text-lg lg:text-xl font-bold opacity-95">GPS Points</div>
                <div className="text-sm sm:text-base opacity-80 mt-2">Location Records</div>
                <div className="absolute top-2 right-2 opacity-20">
                  <MapPin className="w-8 h-8" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Controls */}
          <Card className="bg-white/95 backdrop-blur-2xl border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50"></div>
            <CardContent className="relative p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 lg:gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                      <Car className="w-4 h-4 text-white" />
                    </div>
                    Vehicle
                  </label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-slate-300/50 focus:ring-blue-500/30 focus:border-blue-500/50 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                      <SelectValue placeholder="Select vehicle..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-200/50">
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.imei} value={vehicle.imei} className="hover:bg-blue-50/80">
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white/90 backdrop-blur-sm border-slate-300/50 focus:ring-purple-500/30 focus:border-purple-500/50 shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white/90 backdrop-blur-sm border-slate-300/50 focus:ring-pink-500/30 focus:border-pink-500/50 shadow-lg hover:shadow-xl transition-all duration-300 h-12"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    Quick Select
                  </label>
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      const today = new Date();
                      const startDate = new Date(today);
                      
                      switch(value) {
                        case 'today':
                          startDate.setDate(today.getDate());
                          break;
                        case 'yesterday':
                          startDate.setDate(today.getDate() - 1);
                          break;
                        case 'last7days':
                          startDate.setDate(today.getDate() - 7);
                          break;
                        case 'last30days':
                          startDate.setDate(today.getDate() - 30);
                          break;
                        case 'thisweek':
                          startDate.setDate(today.getDate() - today.getDay());
                          break;
                        case 'thismonth':
                          startDate.setDate(1);
                          break;
                      }
                      
                      setStartDate(startDate.toISOString().split('T')[0]);
                      if (value === 'today' || value === 'yesterday') {
                        setEndDate(startDate.toISOString().split('T')[0]);
                      } else {
                        setEndDate(today.toISOString().split('T')[0]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white/90 backdrop-blur-sm border-slate-300/50 focus:ring-emerald-500/30 focus:border-emerald-500/50 shadow-lg hover:shadow-xl transition-all duration-300 h-12">
                      <SelectValue placeholder="Quick dates..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-slate-200/50">
                      <SelectItem value="today" className="hover:bg-emerald-50/80">Today</SelectItem>
                      <SelectItem value="yesterday" className="hover:bg-emerald-50/80">Yesterday</SelectItem>
                      <SelectItem value="last7days" className="hover:bg-emerald-50/80">Last 7 Days</SelectItem>
                      <SelectItem value="last30days" className="hover:bg-emerald-50/80">Last 30 Days</SelectItem>
                      <SelectItem value="thisweek" className="hover:bg-emerald-50/80">This Week</SelectItem>
                      <SelectItem value="thismonth" className="hover:bg-emerald-50/80">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 opacity-0">Actions</label>
                  <Button
                    onClick={fetchLocationData}
                    disabled={loading || !selectedVehicle}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-bold">Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5" />
                        <span className="font-bold">Get Location History</span>
                      </div>
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-800 opacity-0">Export</label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Export functionality can be implemented here
                      const csvContent = locationHistory.map(record => 
                        `${record.timestamp.toISOString()},${record.odometer},${record.tripStatus},${record.speed},${record.latitude},${record.longitude},"${record.address}"`
                      ).join('\n');
                      
                      const csvHeader = 'Timestamp,Odometer (km),Trip Status,Speed (km/h),Latitude,Longitude,Location Name\n';
                      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `location_history_${selectedVehicle}_${startDate}_to_${endDate}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                    disabled={locationHistory.length === 0}
                    className="w-full h-12 border-orange-300/60 text-orange-700 hover:bg-orange-50 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 font-bold disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Navigation className="w-5 h-5" />
                      <span className="font-bold">Export CSV</span>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 space-y-8 lg:space-y-12">
        {error && (
          <Card className="border-red-300/60 bg-red-50/90 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-6 h-6" />
                <span className="font-bold text-lg">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Key Metrics */}
        {locationHistory.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8">
            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-700 transform hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-slate-700 group-hover:text-blue-800 transition-colors duration-300">Total Distance</CardTitle>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Route className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl sm:text-4xl font-black text-blue-800 group-hover:scale-110 transition-transform duration-500 mb-2">
                  {analytics.totalDistance} km
                </div>
                <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors duration-300">Total route covered</p>
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Route className="w-16 h-16 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-700 transform hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-violet-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-slate-700 group-hover:text-purple-800 transition-colors duration-300">Odometer Reading</CardTitle>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl sm:text-4xl font-black text-purple-800 group-hover:scale-110 transition-transform duration-500 mb-2">
                  {analytics.totalOdometerReading} km
                </div>
                <p className="text-sm font-semibold text-slate-600 group-hover:text-purple-600 transition-colors duration-300">Latest reading</p>
                {analytics.odometerRange && (
                  <p className="text-xs font-bold text-purple-600 mt-1">Range: {analytics.odometerRange}</p>
                )}
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Gauge className="w-16 h-16 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-700 transform hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-green-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-slate-700 group-hover:text-emerald-800 transition-colors duration-300">Average Speed</CardTitle>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl sm:text-4xl font-black text-emerald-800 group-hover:scale-110 transition-transform duration-500 mb-2">
                  {analytics.averageSpeed} km/h
                </div>
                <p className="text-sm font-semibold text-slate-600 group-hover:text-emerald-600 transition-colors duration-300">Overall average</p>
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Gauge className="w-16 h-16 text-emerald-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-700 transform hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/80 via-rose-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-slate-700 group-hover:text-red-800 transition-colors duration-300">Max Speed</CardTitle>
                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl sm:text-4xl font-black text-red-800 group-hover:scale-110 transition-transform duration-500 mb-2">
                  {analytics.maxSpeed} km/h
                </div>
                <p className="text-sm font-semibold text-slate-600 group-hover:text-red-600 transition-colors duration-300">Peak velocity</p>
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <TrendingUp className="w-16 h-16 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-700 transform hover:-translate-y-3 border-0 bg-white/95 backdrop-blur-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-bold text-slate-700 group-hover:text-orange-800 transition-colors duration-300">Moving vs Stopped</CardTitle>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <Activity className="w-5 h-5 text-white animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl sm:text-4xl font-black text-orange-800 group-hover:scale-110 transition-transform duration-500 mb-2">
                  {analytics.runningPoints}/{analytics.stoppedPoints}
                </div>
                <p className="text-sm font-semibold text-slate-600 group-hover:text-orange-600 transition-colors duration-300">Moving / Stopped points</p>
                <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Activity className="w-16 h-16 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Charts and Analytics */}
        {locationHistory.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
            {/* Daily Distance Chart */}
            <Card className="border-0 bg-white/95 backdrop-blur-2xl shadow-2xl hover:shadow-3xl transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-4 text-xl font-black">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-xl">
                      <Route className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Daily Distance Breakdown
                  </span>
                </CardTitle>
                <CardDescription className="text-base font-semibold text-slate-600 mt-2">
                  Comprehensive distance analysis covered per day during the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="h-80 sm:h-96">
                  <Bar
                    data={{
                      labels: analytics.dailyBreakdown.map(day => 
                        new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      ),
                      datasets: [
                        {
                          label: 'Distance (km)',
                          data: analytics.dailyBreakdown.map(day => day.distance.toFixed(1)),
                          backgroundColor: 'rgba(59, 130, 246, 0.9)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 3,
                          borderRadius: 12,
                          hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
                          hoverBorderColor: 'rgba(29, 78, 216, 1)',
                          hoverBorderWidth: 4
                        }
                      ]
                    }}
                    options={{
                      ...chartDefaults,
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      },
                      scales: {
                        ...chartDefaults.scales,
                        y: {
                          ...chartDefaults.scales.y,
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Distance (kilometers)',
                            font: { weight: '700', size: 14 }
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        x: {
                          ...chartDefaults.scales.x,
                          title: {
                            display: true,
                            text: 'Date Period',
                            font: { weight: '700', size: 14 }
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Speed Trends */}
            <Card className="border-0 bg-white/95 backdrop-blur-2xl shadow-2xl hover:shadow-3xl transition-all duration-700 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-teal-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader className="relative">
                <CardTitle className="flex items-center gap-4 text-xl font-black">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                    <div className="relative p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    Speed Trends
                  </span>
                </CardTitle>
                <CardDescription className="text-base font-semibold text-slate-600 mt-2">
                  Real-time speed variations and performance analysis over time (last 50 data points)
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <div className="h-80 sm:h-96">
                  <Line
                    data={{
                      labels: analytics.speedTrends.map(point => point.time),
                      datasets: [
                        {
                          label: 'Speed (km/h)',
                          data: analytics.speedTrends.map(point => point.speed),
                          borderColor: 'rgba(16, 185, 129, 1)',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          fill: true,
                          tension: 0.4,
                          pointRadius: 5,
                          pointHoverRadius: 8,
                          borderWidth: 4,
                          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 2,
                          pointHoverBackgroundColor: 'rgba(5, 150, 105, 1)',
                          pointHoverBorderColor: '#ffffff',
                          pointHoverBorderWidth: 3
                        }
                      ]
                    }}
                    options={{
                      ...chartDefaults,
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      },
                      scales: {
                        ...chartDefaults.scales,
                        y: {
                          ...chartDefaults.scales.y,
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Speed (km/h)',
                            font: { weight: '700', size: 14 }
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        x: {
                          ...chartDefaults.scales.x,
                          title: {
                            display: true,
                            text: 'Time Sequence',
                            font: { weight: '700', size: 14 }
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Location History Table */}
        {locationHistory.length > 0 && (
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                Enhanced Location History Records
              </CardTitle>
              <CardDescription>
                Real-time GPS tracking with actual device odometer readings, API-based trip status (1=Complete, 0=Incomplete), live speed data, precise coordinates, and enhanced location names with directional information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Timestamp
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4" />
                          Odo Reading (km)
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="w-4 h-4" />
                          Trip Status
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4" />
                          Speed (km/h)
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Lat / Long
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Location Name
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationHistory.slice(0, 50).map((record, index) => (
                      <TableRow key={index} className="hover:bg-slate-50/50 transition-colors duration-200">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">
                              {record.timestamp.toLocaleDateString()}
                            </span>
                            <span className="text-xs text-slate-500">
                              {record.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
                            <Gauge className="w-3 h-3 mr-1" />
                            {record.odometer} km
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`${
                              record.tripStatusText === 'Completed' 
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                : record.tripStatusText === 'Active'
                                ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300'
                                : record.tripStatusText === 'Paused'
                                ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300'
                            }`}
                          >
                            {record.tripStatusText === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {record.tripStatusText === 'Active' && <PlayCircle className="w-3 h-3 mr-1" />}
                            {record.tripStatusText === 'Paused' && <StopCircle className="w-3 h-3 mr-1" />}
                            {record.tripStatusText === 'Stopped' && <XCircle className="w-3 h-3 mr-1" />}
                            {record.tripStatusText}
                            <span className="ml-1 text-xs">({record.tripValue === 1 ? '✓' : '○'})</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                            <Gauge className="w-3 h-3 mr-1" />
                            {record.speed.toFixed(1)} km/h
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-mono text-slate-700">
                              {record.latitude.toFixed(6)}
                            </span>
                            <span className="text-sm font-mono text-slate-700">
                              {record.longitude.toFixed(6)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col max-w-xs">
                            <span className="text-sm font-medium text-slate-800 truncate">
                              {record.address.split(' (')[0]}
                            </span>
                            <span className="text-xs text-slate-500 truncate">
                              {record.address.includes('(') ? record.address.split(' (')[1]?.replace(')', '') : record.address}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {locationHistory.length > 50 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Showing first 50 of {locationHistory.length} total records. 
                    Use date filters to narrow down the results for better performance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!loading && locationHistory.length === 0 && !error && (
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="text-center py-12">
              <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Location Data Found</h3>
              <p className="text-slate-500 mb-6">
                No GPS tracking data available for the selected vehicle and date range.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-700">
                  💡 Try selecting a different vehicle or adjusting the date range to find available tracking data.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LocationDashboard; 