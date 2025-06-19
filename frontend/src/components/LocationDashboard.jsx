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
  Download,
  Map,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Clean chart configuration with Inria Sans font
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 16,
        font: {
          size: 12,
          family: 'Inria Sans, sans-serif'
        },
        color: '#334155',
        boxWidth: 8,
        boxHeight: 8
      }
    },
    tooltip: {
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      displayColors: true,
      titleFont: { size: 13, family: 'Inria Sans, sans-serif' },
      bodyFont: { size: 12, family: 'Inria Sans, sans-serif' }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
      ticks: { color: '#64748b', font: { size: 11, family: 'Inria Sans, sans-serif' }, padding: 8 }
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.1)', drawBorder: false },
      ticks: { color: '#64748b', font: { size: 11, family: 'Inria Sans, sans-serif' }, padding: 8 }
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
  
  // Map state
  const [selectedDate, setSelectedDate] = useState('');
  const [dayRouteData, setDayRouteData] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [routePolyline, setRoutePolyline] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [animateRoute, setAnimateRoute] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);
  const [visibleRoutePoints, setVisibleRoutePoints] = useState([]);
  
  // Date state - Initialize both start and end date to current date
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
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

  // Process route data for a specific date
  const processRouteForDate = async (date) => {
    try {
      setLoading(true);
      setError(null);

      // Format date for API
      const formattedDate = formatDateForAPI(date);
      
      // Fetch data specifically for this date
      const apiUrl = `${API_CONFIG.locationURL}/${selectedVehicle}?startDate=${formattedDate}&endDate=${formattedDate}`;
      console.log('Fetching route data for date:', date, 'URL:', apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: {
          'accept': '*/*',
          'apikey': API_CONFIG.apiKey
        }
      });

      let dayData = [];
      
      if (response.data?.results?.[0]?.series?.[0]) {
        const series = response.data.results[0].series[0];
        const columns = series.columns;
        const values = series.values;
        
        // Create column index mapping
        const columnIndex = {};
        columns.forEach((col, index) => {
          columnIndex[col] = index;
        });

        // Process the data points
        dayData = values.map(row => ({
          timestamp: new Date(row[columnIndex.time]),
          latitude: parseFloat(row[columnIndex.lat]) || 0,
          longitude: parseFloat(row[columnIndex.lng]) || 0,
          speed: parseFloat(row[columnIndex.speed]) || 0,
          ignition: row[columnIndex.ignition] === "1" || row[columnIndex.ignition] === 1,
          odometer: parseFloat(row[columnIndex.odo]) || 0,
          tripStatus: parseFloat(row[columnIndex.trip]) || 0,
          altitude: parseFloat(row[columnIndex.alt]) || 0,
          heading: parseFloat(row[columnIndex.hdg]) || 0
        }));

        // Sort by timestamp
        dayData.sort((a, b) => a.timestamp - b.timestamp);
      }

      if (dayData.length === 0) {
        console.log('No data found for date:', date);
        setShowMap(false);
        setError(`No route data available for ${new Date(date).toLocaleDateString()}`);
        return;
      }

      // Calculate center point
      const avgLat = dayData.reduce((sum, point) => sum + point.latitude, 0) / dayData.length;
      const avgLng = dayData.reduce((sum, point) => sum + point.longitude, 0) / dayData.length;
      
      setMapCenter({ lat: avgLat, lng: avgLng });
      setDayRouteData(dayData);
      
      // Generate polyline for Google Maps
      const polylinePoints = dayData.map(point => `${point.latitude},${point.longitude}`).join('|');
      setRoutePolyline(polylinePoints);
      setShowMap(true);
      setError(null);

    } catch (error) {
      console.error('Error fetching route data for date:', date, error);
      setError(`Failed to fetch route data for ${new Date(date).toLocaleDateString()}: ${error.message}`);
      setShowMap(false);
    } finally {
      setLoading(false);
    }
  };

  // Get unique dates from location history
  const getAvailableDates = () => {
    const dates = [...new Set(locationHistory.map(record => 
      record.timestamp.toISOString().split('T')[0]
    ))];
    return dates.sort().reverse(); // Most recent first
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
    // Fetch vehicles first
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      // Fetch location data whenever vehicle or dates change
      fetchLocationData();
      
      // Always process route for the start date when any of these change
      processRouteForDate(startDate);
    }
  }, [selectedVehicle, startDate, endDate]);

  if (loading && locationHistory.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center bg-white rounded-lg p-8 shadow-sm border border-slate-200">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
              <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
        </div>
            </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2" style={{fontFamily: 'Inria Sans, sans-serif'}}>
            Loading Location Data
          </h3>
          <p className="text-slate-600" style={{fontFamily: 'Inria Sans, sans-serif'}}>
            Fetching GPS tracking information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50" style={{fontFamily: 'Inria Sans, sans-serif'}}>
      {/* Modern Full Width Header */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-10">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-2xl ring-4 ring-blue-500/20">
                <div className="relative">
                  <MapPin className="w-10 h-10 text-white animate-pulse" />
                  <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl xl:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-indigo-200">
                    Location Dashboard
                  </h1>
                  <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/20 text-xs">
                    LIVE
                  </Badge>
                </div>
                <p className="text-slate-400 text-lg mt-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Real-time GPS Tracking & Analytics
                </p>
              </div>
            </div>
              

          </div>
        </div>
          </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-12 space-y-12">
          {/* Modern Control Panel */}
        <Card className="bg-white/80 backdrop-blur-lg border-slate-200/50 shadow-2xl rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-t-2xl">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-3 bg-blue-500/20 rounded-xl ring-2 ring-blue-500/20">
                <Car className="w-5 h-5 text-blue-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-blue-100">Control Panel</h3>
                <CardDescription className="text-slate-400 text-sm">
                  Configure tracking parameters and date ranges
                </CardDescription>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>Select Vehicle</span>
                  </label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-colors focus:ring-blue-500 focus:border-blue-500 shadow-lg">
                      <SelectValue placeholder="Choose a vehicle..." />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        {vehicles.map((vehicle) => (
                          <SelectItem 
                            key={vehicle.imei} 
                            value={vehicle.imei}
                            className="rounded-lg hover:bg-blue-50 focus:bg-blue-50 cursor-pointer my-1 p-2"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                vehicle.status === 'Moving' ? 'bg-green-500' :
                                vehicle.status === 'Idle' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                              {vehicle.name}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span>Start Date</span>
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-colors focus:ring-emerald-500 focus:border-emerald-500 shadow-lg"
                  />
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <span>End Date</span>
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-slate-200/50 hover:bg-white/80 transition-colors focus:ring-purple-500 focus:border-purple-500 shadow-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Quick Select
                  </label>
                  <Select 
                    value="today" 
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
                    <SelectTrigger className="border-slate-300 focus:ring-slate-500 focus:border-slate-500">
                      <SelectValue placeholder="Quick dates..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="yesterday">Yesterday</SelectItem>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="thisweek">This Week</SelectItem>
                      <SelectItem value="thismonth">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 opacity-0">Actions</label>
                  <Button
                    onClick={fetchLocationData}
                    disabled={loading || !selectedVehicle}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Get Data</span>
                      </div>
                    )}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 opacity-0">Export</label>
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
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Key Metrics */}
        {locationHistory.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold text-blue-700">Total Distance</CardTitle>
                <div className="p-3 bg-blue-200 rounded-xl">
                  <Route className="w-6 h-6 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-4xl font-bold text-blue-800 mb-3">
                  {analytics.totalDistance} km
                </div>
                <p className="text-base text-blue-600">Total route covered</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold text-purple-700">Odometer Reading</CardTitle>
                <div className="p-3 bg-purple-200 rounded-xl">
                  <Gauge className="w-6 h-6 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-4xl font-bold text-purple-800 mb-3">
                  {analytics.totalOdometerReading} km
                </div>
                <p className="text-base text-purple-600">Latest reading</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold text-emerald-700">Average Speed</CardTitle>
                <div className="p-3 bg-emerald-200 rounded-xl">
                  <Gauge className="w-6 h-6 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-4xl font-bold text-emerald-800 mb-3">
                  {analytics.averageSpeed} km/h
                </div>
                <p className="text-base text-emerald-600">Overall average</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold text-orange-700">Max Speed</CardTitle>
                <div className="p-3 bg-orange-200 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-4xl font-bold text-orange-800 mb-3">
                  {analytics.maxSpeed} km/h
                </div>
                <p className="text-base text-orange-600">Peak velocity</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-bold text-indigo-700">Activity Status</CardTitle>
                <div className="p-3 bg-indigo-200 rounded-xl">
                  <Activity className="w-6 h-6 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="text-4xl font-bold text-indigo-800 mb-3">
                  {analytics.runningPoints}/{analytics.stoppedPoints}
                </div>
                <p className="text-base text-indigo-600">Moving / Stopped points</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interactive Route Map */}
        {locationHistory.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-lg border-slate-200/50 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-t-xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/20 rounded-xl ring-2 ring-indigo-500/20 relative group">
                    <Map className="w-7 h-7 text-indigo-300 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-indigo-400 rounded-xl blur-2xl opacity-20"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-2xl font-bold text-indigo-100">
                        Daily Route Visualization
                      </CardTitle>
                      <Badge className="bg-indigo-500/20 text-indigo-200 border-indigo-400/20">
                        REAL-TIME
                      </Badge>
                    </div>
                    <CardDescription className="text-base text-slate-400 mt-2 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-indigo-400" />
                      Interactive vehicle movement tracking with status indicators
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                  <div className="text-lg font-semibold text-indigo-800">
                    {startDate === endDate ? (
                      // If start and end date are same, show single date
                      new Date(startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    ) : (
                      // If different dates, show date range
                      `${new Date(startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })} - ${new Date(endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}`
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      if (selectedVehicle) {
                        processRouteForDate(startDate);
                      }
                    }}
                    disabled={!selectedVehicle}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Route
                  </Button>
                </div>
                </div>
              </div>
            </CardHeader>
            
            {showMap && dayRouteData.length > 0 ? (
              <CardContent className="p-0">
                                 {/* Real Google Maps with Route Overlay */}
                 <div className="relative w-full h-[600px] rounded-lg overflow-hidden">
                   {/* Real Google Maps Background */}
                   <iframe
                     src={`https://maps.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&hl=en&z=14&output=embed`}
                     width="100%"
                     height="600"
                     style={{ border: 0 }}
                     allowFullScreen=""
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                     className="absolute inset-0"
                   />
                   
                   {/* Route Overlay on Google Maps */}
                   <div className="absolute inset-0 pointer-events-none">
                     <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
                       <defs>
                         {/* Route gradient */}
                         <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#4285f4" stopOpacity="0.9" />
                           <stop offset="50%" stopColor="#0066cc" stopOpacity="0.9" />
                           <stop offset="100%" stopColor="#4285f4" stopOpacity="0.9" />
                         </linearGradient>
                         
                         {/* Animated route gradient */}
                         <linearGradient id="animatedRoute" x1="0%" y1="0%" x2="100%" y2="0%">
                           <stop offset="0%" stopColor="#4285f4" stopOpacity="0.8">
                             <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                           </stop>
                           <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9">
                             <animate attributeName="stop-opacity" values="0.9;0.4;0.9" dur="2s" repeatCount="indefinite" />
                           </stop>
                           <stop offset="100%" stopColor="#4285f4" stopOpacity="0.8">
                             <animate attributeName="stop-opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                           </stop>
                         </linearGradient>
                         
                         {/* Shadow filter */}
                         <filter id="routeShadow" x="-50%" y="-50%" width="200%" height="200%">
                           <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#4285f4" floodOpacity="0.4"/>
                         </filter>
                       </defs>
                       
                       {/* Progressive route path over Google Maps */}
                       {dayRouteData.length > 1 && (
                         <>
                           {/* Base complete route line (static, light gray) */}
                           <polyline
                             points={dayRouteData.map((point, index) => {
                               // Convert real GPS coordinates to screen coordinates
                               const minLat = Math.min(...dayRouteData.map(p => p.latitude));
                               const maxLat = Math.max(...dayRouteData.map(p => p.latitude));
                               const minLng = Math.min(...dayRouteData.map(p => p.longitude));
                               const maxLng = Math.max(...dayRouteData.map(p => p.longitude));
                               
                               const padding = 50;
                               const x = ((point.longitude - minLng) / (maxLng - minLng)) * (600 - 2 * padding) + padding;
                               const y = ((maxLat - point.latitude) / (maxLat - minLat)) * (600 - 2 * padding) + padding;
                               
                               return `${x},${y}`;
                             }).join(' ')}
                             fill="none"
                             stroke="rgba(200, 200, 200, 0.4)"
                             strokeWidth="3"
                             strokeLinecap="round"
                             strokeLinejoin="round"
                           />
                           
                           {/* Progressive route line that builds up during animation */}
                           {(animateRoute ? visibleRoutePoints : dayRouteData).length > 1 && (
                             <polyline
                               points={(animateRoute ? visibleRoutePoints : dayRouteData).map((point, index) => {
                                 const minLat = Math.min(...dayRouteData.map(p => p.latitude));
                                 const maxLat = Math.max(...dayRouteData.map(p => p.latitude));
                                 const minLng = Math.min(...dayRouteData.map(p => p.longitude));
                                 const maxLng = Math.max(...dayRouteData.map(p => p.longitude));
                                 
                                 const padding = 50;
                                 const x = ((point.longitude - minLng) / (maxLng - minLng)) * (600 - 2 * padding) + padding;
                                 const y = ((maxLat - point.latitude) / (maxLat - minLat)) * (600 - 2 * padding) + padding;
                                 
                                 return `${x},${y}`;
                               }).join(' ')}
                               fill="none"
                               stroke="url(#routeGradient)"
                               strokeWidth="6"
                               strokeLinecap="round"
                               strokeLinejoin="round"
                               filter="url(#routeShadow)"
                             />
                           )}
                           
                           {/* Animated pulsing effect on the active route */}
                           {animateRoute && visibleRoutePoints.length > 1 && (
                             <polyline
                               points={visibleRoutePoints.map((point, index) => {
                                 const minLat = Math.min(...dayRouteData.map(p => p.latitude));
                                 const maxLat = Math.max(...dayRouteData.map(p => p.latitude));
                                 const minLng = Math.min(...dayRouteData.map(p => p.longitude));
                                 const maxLng = Math.max(...dayRouteData.map(p => p.longitude));
                                 
                                 const padding = 50;
                                 const x = ((point.longitude - minLng) / (maxLng - minLng)) * (600 - 2 * padding) + padding;
                                 const y = ((maxLat - point.latitude) / (maxLat - minLat)) * (600 - 2 * padding) + padding;
                                 
                                 return `${x},${y}`;
                               }).join(' ')}
                               fill="none"
                               stroke="url(#animatedRoute)"
                               strokeWidth="4"
                               strokeLinecap="round"
                               strokeLinejoin="round"
                               strokeDasharray="15,8"
                             >
                               <animate
                                 attributeName="stroke-dashoffset"
                                 values="0;23;0"
                                 dur="0.5s"
                                 repeatCount="indefinite"
                               />
                             </polyline>
                           )}
                         </>
                       )}
                       
                       {/* GPS Points over Google Maps - Progressive visibility */}
                       {dayRouteData.map((point, index) => {
                         const minLat = Math.min(...dayRouteData.map(p => p.latitude));
                         const maxLat = Math.max(...dayRouteData.map(p => p.latitude));
                         const minLng = Math.min(...dayRouteData.map(p => p.longitude));
                         const maxLng = Math.max(...dayRouteData.map(p => p.longitude));
                         
                         const padding = 50;
                         const x = ((point.longitude - minLng) / (maxLng - minLng)) * (600 - 2 * padding) + padding;
                         const y = ((maxLat - point.latitude) / (maxLat - minLat)) * (600 - 2 * padding) + padding;
                         
                         const isStart = index === 0;
                         const isEnd = index === dayRouteData.length - 1;
                         const isVisible = !animateRoute || index < visibleRoutePoints.length;
                         const isCurrentPoint = animateRoute && index === visibleRoutePoints.length - 1;
                         
                         return (
                           <g key={index} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
                             {/* Main marker - only show if visible in animation */}
                             <circle
                               cx={x}
                               cy={y}
                               r={isStart || isEnd ? "10" : "5"}
                               fill={
                                 isStart ? "#34d399" : 
                                 isEnd ? "#ef4444" : 
                                 point.speed > 60 ? "#ef4444" : 
                                 point.speed > 30 ? "#f59e0b" : 
                                 point.speed > 0 ? "#22c55e" : "#6b7280"
                               }
                               stroke="white"
                               strokeWidth="2"
                               className="hover:scale-110 transition-all duration-200"
                               onClick={() => setSelectedPoint(point)}
                               filter="url(#routeShadow)"
                               opacity={isVisible ? "1" : "0.3"}
                             >
                               {(animateRoute && isCurrentPoint) && (
                                 <animate
                                   attributeName="r"
                                   values={`${isStart || isEnd ? "10" : "5"};${isStart || isEnd ? "15" : "10"};${isStart || isEnd ? "10" : "5"}`}
                                   dur="1s"
                                   repeatCount="indefinite"
                                 />
                               )}
                             </circle>
                             
                             {/* Fast pulsing ring effect for current point */}
                             {animateRoute && isCurrentPoint && (
                               <>
                                 {/* Outer fast pulsing ring */}
                                 <circle
                                   cx={x}
                                   cy={y}
                                   r="25"
                                   fill="none"
                                   stroke="#4285f4"
                                   strokeWidth="5"
                                   opacity="0.8"
                                 >
                                   <animate
                                     attributeName="r"
                                     values="20;35;20"
                                     dur="0.3s"
                                     repeatCount="indefinite"
                                   />
                                   <animate
                                     attributeName="opacity"
                                     values="0.8;0;0.8"
                                     dur="0.3s"
                                     repeatCount="indefinite"
                                   />
                                 </circle>
                                 
                                 {/* Inner fast pulsing ring */}
                                 <circle
                                   cx={x}
                                   cy={y}
                                   r="15"
                                   fill="none"
                                   stroke="#ffffff"
                                   strokeWidth="3"
                                   opacity="1"
                                 >
                                   <animate
                                     attributeName="r"
                                     values="10;20;10"
                                     dur="0.2s"
                                     repeatCount="indefinite"
                                   />
                                   <animate
                                     attributeName="opacity"
                                     values="1;0.2;1"
                                     dur="0.2s"
                                     repeatCount="indefinite"
                                   />
                                 </circle>
                               </>
                             )}
                             
                             {/* Labels for start/end */}
                             <text 
                               x={x} 
                               y={y + 3} 
                               textAnchor="middle" 
                               className="text-xs font-bold fill-white pointer-events-none"
                               opacity={isVisible ? "1" : "0.3"}
                             >
                               {isStart ? "A" : isEnd ? "B" : ""}
                             </text>
                           </g>
                         );
                       })}
                       
                                                {/* Smooth Moving Scooter Animation */}
                         {animateRoute && visibleRoutePoints.length > 0 && (
                           <g>
                             {(() => {
                               const minLat = Math.min(...dayRouteData.map(p => p.latitude));
                               const maxLat = Math.max(...dayRouteData.map(p => p.latitude));
                               const minLng = Math.min(...dayRouteData.map(p => p.longitude));
                               const maxLng = Math.max(...dayRouteData.map(p => p.longitude));
                               const padding = 50;
                               
                               // Calculate current and next point positions
                               const currentPointIndex = visibleRoutePoints.length - 1;
                               const currentPoint = visibleRoutePoints[currentPointIndex];
                               const nextPoint = dayRouteData[currentPointIndex + 1];
                               
                               const currentX = ((currentPoint.longitude - minLng) / (maxLng - minLng)) * (600 - 2 * padding) + padding;
                               const currentY = ((maxLat - currentPoint.latitude) / (maxLat - minLat)) * (600 - 2 * padding) + padding;
                               
                               let nextX = currentX;
                               let nextY = currentY;
                               
                               if (nextPoint) {
                                 nextX = ((nextPoint.longitude - minLng) / (maxLng - minLng)) * (600 - 2 * padding) + padding;
                                 nextY = ((maxLat - nextPoint.latitude) / (maxLat - minLat)) * (600 - 2 * padding) + padding;
                               }
                               
                               return (
                                 <>
                                   {/* Scooter background circle with ultra-fast movement */}
                                   <circle
                                     r="12"
                                     fill="#ff6b35"
                                     stroke="white"
                                     strokeWidth="3"
                                     filter="url(#routeShadow)"
                                   >
                                     <animateTransform
                                       attributeName="transform"
                                       type="translate"
                                       values={`${currentX},${currentY};${nextX},${nextY}`}
                                       dur="0.005s"
                                       fill="freeze"
                                       calcMode="linear"
                                     />
                                   </circle>
                                   
                                   {/* Scooter emoji with ultra-fast movement */}
                                   <text 
                                     textAnchor="middle" 
                                     dominantBaseline="middle"
                                     className="text-2xl pointer-events-none"
                                     style={{ fontSize: '20px' }}
                                   >
                                     🛵
                                     <animateTransform
                                       attributeName="transform"
                                       type="translate"
                                       values={`${currentX},${currentY};${nextX},${nextY}`}
                                       dur="0.005s"
                                       fill="freeze"
                                       calcMode="linear"
                                     />
                                   </text>
                                   
                                   {/* Ultra-fast motion trail with movement */}
                                   <circle
                                     r="22"
                                     fill="none"
                                     stroke="#ff6b35"
                                     strokeWidth="3"
                                     opacity="0.5"
                                   >
                                     <animateTransform
                                       attributeName="transform"
                                       type="translate"
                                       values={`${currentX},${currentY};${nextX},${nextY}`}
                                       dur="0.005s"
                                       fill="freeze"
                                       calcMode="linear"
                                     />
                                     <animate
                                       attributeName="r"
                                       values="22;30;22"
                                       dur="0.05s"
                                       repeatCount="indefinite"
                                     />
                                     <animate
                                       attributeName="opacity"
                                       values="0.5;0;0.5"
                                       dur="0.05s"
                                       repeatCount="indefinite"
                                     />
                                   </circle>
                                   
                                   {/* Ultra-fast speed lines for movement effect */}
                                   {nextPoint && (
                                     <>
                                       <line
                                         x1={currentX - 15}
                                         y1={currentY}
                                         x2={currentX - 25}
                                         y2={currentY}
                                         stroke="#ff6b35"
                                         strokeWidth="2"
                                         opacity="0.7"
                                       >
                                         <animateTransform
                                           attributeName="transform"
                                           type="translate"
                                           values={`0,0;${nextX - currentX},${nextY - currentY}`}
                                           dur="0.005s"
                                           fill="freeze"
                                           calcMode="linear"
                                         />
                                         <animate
                                           attributeName="opacity"
                                           values="0.7;0;0.7"
                                           dur="0.03s"
                                           repeatCount="indefinite"
                                         />
                                       </line>
                                       <line
                                         x1={currentX - 10}
                                         y1={currentY - 5}
                                         x2={currentX - 18}
                                         y2={currentY - 5}
                                         stroke="#ff6b35"
                                         strokeWidth="1.5"
                                         opacity="0.5"
                                       >
                                         <animateTransform
                                           attributeName="transform"
                                           type="translate"
                                           values={`0,0;${nextX - currentX},${nextY - currentY}`}
                                           dur="0.005s"
                                           fill="freeze"
                                           calcMode="linear"
                                         />
                                         <animate
                                           attributeName="opacity"
                                           values="0.5;0;0.5"
                                           dur="0.04s"
                                           repeatCount="indefinite"
                                         />
                                       </line>
                                       <line
                                         x1={currentX - 10}
                                         y1={currentY + 5}
                                         x2={currentX - 18}
                                         y2={currentY + 5}
                                         stroke="#ff6b35"
                                         strokeWidth="1.5"
                                         opacity="0.5"
                                       >
                                         <animateTransform
                                           attributeName="transform"
                                           type="translate"
                                           values={`0,0;${nextX - currentX},${nextY - currentY}`}
                                           dur="0.005s"
                                           fill="freeze"
                                           calcMode="linear"
                                         />
                                         <animate
                                           attributeName="opacity"
                                           values="0.5;0;0.5"
                                           dur="0.04s"
                                           repeatCount="indefinite"
                                         />
                                       </line>
                                     </>
                                   )}
                                 </>
                               );
                             })()}
                           </g>
                         )}
                     </svg>
                                      </div>
                   
                    {/* Enhanced Route Controls with Progress */}
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-20 min-w-[280px] border border-slate-700/50">
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (!animateRoute) {
                                setCurrentPointIndex(0);
                                setRouteProgress(0);
                                setVisibleRoutePoints([]);
                                setAnimateRoute(true);
                                
                                // Super fast route animation - complete in 1 second
                                const animatePointByPoint = () => {
                                  let currentIndex = 0;
                                  const totalPoints = dayRouteData.length;
                                  // Complete route animation in 2 seconds
                                  const totalAnimationTime = 2000; // 2 seconds total animation time
                                  const pointInterval = Math.max(10, totalAnimationTime / totalPoints); // Time between points
                                  
                                  const addNextPoint = () => {
                                    if (currentIndex < totalPoints) {
                                      // Add one point at a time for smooth animation
                                      const newPoint = dayRouteData[currentIndex];
                                      
                                      setVisibleRoutePoints(prev => [...prev, newPoint]);
                                      setCurrentPointIndex(currentIndex);
                                      setRouteProgress((currentIndex + 1) / totalPoints * 100);
                                      
                                      currentIndex++;
                                      
                                      // Calculate speed-based interval
                                      let dynamicInterval = pointInterval;
                                      if (newPoint.speed > 0) {
                                        // Faster animation for higher speeds
                                        dynamicInterval = Math.max(5, pointInterval * (30 / (newPoint.speed + 30)));
                                      }
                                      
                                      if (currentIndex < totalPoints) {
                                        setTimeout(addNextPoint, dynamicInterval);
                                      } else {
                                        // Keep the complete route visible for 1 second
                                        console.log('Route animation completed!');
                                        setTimeout(() => {
                                          setAnimateRoute(false);
                                          setCurrentPointIndex(0);
                                          setRouteProgress(0);
                                          setVisibleRoutePoints([]);
                                        }, 1000); // Show complete route for 1 second
                                      }
                                    }
                                  };
                                  
                                  // Start with first point immediately
                                  console.log('Starting smooth route animation with', totalPoints, 'points');
                                  addNextPoint();
                                };
                                
                                animatePointByPoint();
                                
                              } else {
                                setAnimateRoute(false);
                                setCurrentPointIndex(0);
                                setRouteProgress(0);
                                setVisibleRoutePoints([]);
                              }
                            }}
                            className={`text-xs px-3 py-1.5 h-8 rounded-lg transition-all duration-200 ${
                              animateRoute 
                                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 ring-1 ring-red-500/30' 
                                : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 ring-1 ring-blue-500/30'
                            }`}
                          >
                            {animateRoute ? (
                              <>
                                <StopCircle className="w-3 h-3 mr-1.5" />
                                Stop Route
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-3 h-3 mr-1.5" />
                                Start Route
                              </>
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            onClick={() => {
                              // Create a proper Google Maps URL with route
                              const waypointCoords = dayRouteData.slice(1, -1).map(point => 
                                `${point.latitude},${point.longitude}`
                              ).join('/');
                              
                              const startPoint = `${dayRouteData[0].latitude},${dayRouteData[0].longitude}`;
                              const endPoint = `${dayRouteData[dayRouteData.length - 1].latitude},${dayRouteData[dayRouteData.length - 1].longitude}`;
                              
                              let directionsUrl = `https://www.google.com/maps/dir/${startPoint}`;
                              
                              // Add waypoints (Google Maps supports up to 25 waypoints)
                              if (waypointCoords && dayRouteData.length <= 27) {
                                directionsUrl += `/${waypointCoords}`;
                              }
                              
                              directionsUrl += `/${endPoint}`;
                              
                              window.open(directionsUrl, '_blank');
                            }}
                            variant="outline"
                            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs px-3 py-1.5 h-8"
                          >
                            <Map className="w-3 h-3 mr-1.5" />
                            Google Maps
                          </Button>
                        </div>
                        
                        {/* Progress Bar and Info */}
                        {animateRoute && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                Connecting Points...
                              </span>
                              <span className="text-blue-300">{visibleRoutePoints.length}/{dayRouteData.length}</span>
                            </div>
                            <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${routeProgress}%` }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400 font-medium">Progress</span>
                              <span className="text-blue-300 font-medium">
                                {routeProgress.toFixed(0)}% Complete
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>


                   
 
                   
                                        {/* Dynamic Info Panel */}
                     <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
                       {selectedPoint ? (
                         <div>
                           <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                             <MapPin className="w-4 h-4 text-blue-600" />
                             Point Details
                           </h4>
                           <div className="space-y-2 text-xs">
                             <div className="flex justify-between">
                               <span className="text-slate-600">Time:</span>
                               <span className="font-medium">{selectedPoint.timestamp.toLocaleTimeString()}</span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-slate-600">Speed:</span>
                               <span className={`font-medium ${
                                 selectedPoint.speed > 60 ? 'text-red-600' : 
                                 selectedPoint.speed > 30 ? 'text-orange-600' : 
                                 selectedPoint.speed > 0 ? 'text-green-600' : 'text-gray-600'
                               }`}>
                                 {selectedPoint.speed.toFixed(1)} km/h
                  </span>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-slate-600">Status:</span>
                               <Badge className={`text-xs ${
                                 selectedPoint.tripStatusText === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                 selectedPoint.tripStatusText === 'Active' ? 'bg-blue-100 text-blue-800' :
                                 selectedPoint.tripStatusText === 'Paused' ? 'bg-amber-100 text-amber-800' :
                                 'bg-gray-100 text-gray-700'
                               }`}>
                                 {selectedPoint.tripStatusText}
                               </Badge>
                             </div>
                             <div className="flex justify-between">
                               <span className="text-slate-600">Coordinates:</span>
                               <span className="font-mono text-xs">
                                 {selectedPoint.latitude.toFixed(4)}, {selectedPoint.longitude.toFixed(4)}
                               </span>
                             </div>
                             <div className="mt-2 pt-2 border-t border-slate-200">
                               <Button
                                 size="sm"
                                 onClick={() => {
                                   const mapUrl = `https://www.google.com/maps?q=${selectedPoint.latitude},${selectedPoint.longitude}&z=18`;
                                   window.open(mapUrl, '_blank');
                                 }}
                                 className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                               >
                                 <Navigation className="w-3 h-3 mr-1" />
                                 View Location
                               </Button>
                             </div>
                           </div>
                         </div>
                       ) : (
                         <div>
                           <h4 className="text-sm font-semibold text-slate-800 mb-2">Speed Legend</h4>
                           <div className="space-y-1 text-xs">
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-red-500"></div>
                               <span>High (60+ km/h)</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                               <span>Medium (30-60)</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-green-500"></div>
                               <span>Low (1-30)</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                               <span>Stopped (0)</span>
                             </div>
                             <div className="mt-2 pt-2 border-t border-slate-200 text-center">
                               <span className="text-slate-500">Click any point for details</span>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   
                   {/* Map Overlay Controls */}
                   <div className="absolute top-4 right-4 flex flex-col gap-2">
                     <Button
                       size="sm"
                       onClick={() => {
                         const mapUrl = `https://www.google.com/maps/dir/${dayRouteData.map(point => `${point.latitude},${point.longitude}`).join('/')}`;
                         window.open(mapUrl, '_blank');
                       }}
                       className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-lg"
                     >
                       <Maximize2 className="w-4 h-4 mr-2" />
                       View in Google Maps
                     </Button>
                   </div>
                 </div>
                
                {/* Route Statistics */}
                <div className="p-8 bg-gradient-to-r from-slate-50 to-indigo-50 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-700">
                        {dayRouteData.length}
                      </div>
                      <div className="text-sm text-slate-600">GPS Points</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {dayRouteData.reduce((total, point, index) => {
                          if (index === 0) return 0;
                          const prev = dayRouteData[index - 1];
                          return total + calculateDistance(prev.latitude, prev.longitude, point.latitude, point.longitude);
                        }, 0).toFixed(2)} km
                      </div>
                      <div className="text-sm text-slate-600">Route Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-emerald-700">
                        {(dayRouteData.reduce((sum, point) => sum + point.speed, 0) / dayRouteData.length).toFixed(1)} km/h
                      </div>
                      <div className="text-sm text-slate-600">Avg Speed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700">
                        {Math.max(...dayRouteData.map(point => point.speed)).toFixed(1)} km/h
                      </div>
                      <div className="text-sm text-slate-600">Max Speed</div>
                    </div>
                  </div>
                </div>
                

              </CardContent>
            ) : selectedDate ? (
              <CardContent className="p-16 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                    <Map className="w-8 h-8 text-slate-400" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Route Data</h3>
                <p className="text-slate-600">
                  No GPS tracking data found for {new Date(selectedDate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </CardContent>
            ) : (
              <CardContent className="p-16 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full">
                    <Calendar className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Select a Date</h3>
                <p className="text-slate-600 mb-4">
                  Choose a date from the dropdown above to visualize the vehicle's route and travel patterns
                </p>
                <div className="text-sm text-slate-500">
                  Available dates: {getAvailableDates().length} days with GPS data
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Enhanced Charts and Analytics */}
        {locationHistory.length > 0 && (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-12">
            {/* Daily Distance Chart */}
            <Card className="bg-white border-slate-200 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-blue-800">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Route className="w-6 h-6 text-blue-600" />
                  </div>
                  Daily Distance Analytics
                </CardTitle>
                <CardDescription className="text-slate-600 text-base">
                  Comprehensive distance tracking per day during the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="relative p-12">
                <div className="h-[500px]">
                  <Bar
                    data={{
                      labels: analytics.dailyBreakdown.map(day => 
                        new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      ),
                      datasets: [
                        {
                          label: 'Distance (km)',
                          data: analytics.dailyBreakdown.map(day => day.distance.toFixed(1)),
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: 'rgba(59, 130, 246, 1)',
                          borderWidth: 1,
                          borderRadius: 4,
                          hoverBackgroundColor: 'rgba(37, 99, 235, 1)',
                          hoverBorderColor: 'rgba(29, 78, 216, 1)'
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
            <Card className="bg-white border-slate-200 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-xl border-b border-slate-200">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-emerald-800">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                  Speed Trends Analysis
                </CardTitle>
                <CardDescription className="text-slate-600 text-base">
                  Real-time speed variations and patterns over time (last 50 data points)
                </CardDescription>
              </CardHeader>
              <CardContent className="relative p-12">
                <div className="h-[500px]">
                  <Line
                    data={{
                      labels: analytics.speedTrends.map(point => point.time),
                      datasets: [
                        {
                          label: 'Speed (km/h)',
                          data: analytics.speedTrends.map(point => point.speed),
                          borderColor: 'rgba(16, 185, 129, 1)',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          fill: true,
                          tension: 0.3,
                          pointRadius: 3,
                          pointHoverRadius: 5,
                          borderWidth: 2,
                          pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                          pointBorderColor: '#ffffff',
                          pointBorderWidth: 1
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

        {/* Enhanced Location History */}
        {locationHistory.length > 0 && (
          <Card className="bg-white border-slate-200 shadow-xl rounded-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl border-b border-slate-200 pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-purple-800">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-7 h-7 text-purple-600" />
                </div>
                Interactive Location History
              </CardTitle>
              <CardDescription className="text-base text-slate-600 mt-2">
                Comprehensive GPS tracking with real-time interactive maps, precise coordinates, and detailed location analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-medium text-slate-700 py-2 px-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Time</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-medium text-slate-700 py-2 px-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3 text-purple-600" />
                          <span>Odo</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-medium text-slate-700 py-2 px-3 text-xs">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-emerald-600" />
                          <span>Status</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-medium text-slate-700 py-2 px-3 text-xs">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-orange-600" />
                          <span>Speed</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-medium text-slate-700 py-2 px-3 text-xs">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-600" />
                          <span>Location</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {locationHistory
                      // Remove duplicate timestamps by filtering
                      .reduce((unique, record) => {
                        // Check if we already have a record with this timestamp
                        const existingRecord = unique.find(item => 
                          item.timestamp.getTime() === record.timestamp.getTime()
                        );
                        
                        if (!existingRecord) {
                          unique.push(record);
                        } else {
                          // If duplicate exists, keep the one with more information
                          if (record.speed > 0 || record.odometer > existingRecord.odometer) {
                            const index = unique.indexOf(existingRecord);
                            unique[index] = record;
                          }
                        }
                        return unique;
                      }, [])
                      // Sort by timestamp in descending order (newest first)
                      .sort((a, b) => b.timestamp - a.timestamp)
                      // Take only first 50 records
                      .slice(0, 50)
                      .map((record, index) => (
                      <TableRow key={index} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                        {/* Compact Timestamp */}
                        <TableCell className="py-2 px-3">
                          <div className="text-xs">
                            <div className="font-medium text-slate-900">
                              {record.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-slate-500">
                              {record.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </TableCell>

                        {/* Compact Odometer */}
                        <TableCell className="py-2 px-3">
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs px-2 py-0.5">
                            {record.odometer}km
                          </Badge>
                        </TableCell>

                        {/* Compact Trip Status */}
                        <TableCell className="py-2 px-3">
                          <Badge 
                            className={`text-xs px-2 py-0.5 ${
                              record.tripStatusText === 'Completed' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : record.tripStatusText === 'Active'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : record.tripStatusText === 'Paused'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-gray-100 text-gray-700 border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {record.tripStatusText === 'Completed' && <CheckCircle className="w-2.5 h-2.5" />}
                              {record.tripStatusText === 'Active' && <PlayCircle className="w-2.5 h-2.5" />}
                              {record.tripStatusText === 'Paused' && <StopCircle className="w-2.5 h-2.5" />}
                              {record.tripStatusText === 'Stopped' && <XCircle className="w-2.5 h-2.5" />}
                              <span className="hidden sm:inline">{record.tripStatusText}</span>
                            </div>
                          </Badge>
                        </TableCell>

                        {/* Compact Speed */}
                        <TableCell className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              record.speed > 60 ? 'bg-red-500' : 
                              record.speed > 30 ? 'bg-orange-500' : 
                              record.speed > 0 ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            <Badge className={`text-xs px-2 py-0.5 ${
                              record.speed > 60 ? 'bg-red-100 text-red-800 border-red-200' : 
                              record.speed > 30 ? 'bg-orange-100 text-orange-800 border-orange-200' : 
                              record.speed > 0 ? 'bg-green-100 text-green-800 border-green-200' : 
                              'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {record.speed.toFixed(0)}
                          </Badge>
                          </div>
                        </TableCell>

                        {/* Compact Location & Map */}
                        <TableCell className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {/* Map Button */}
                            <Button
                              size="sm"
                              onClick={() => {
                                const mapUrl = `https://www.google.com/maps?q=${record.latitude},${record.longitude}&z=16&t=m`;
                                window.open(mapUrl, '_blank');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 h-6"
                            >
                              <MapPin className="w-3 h-3" />
                            </Button>
                            
                            {/* Street View Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${record.latitude},${record.longitude}`;
                                window.open(streetViewUrl, '_blank');
                              }}
                              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs px-2 py-1 h-6"
                            >
                              <Navigation className="w-3 h-3" />
                            </Button>
                            
                            {/* Location Name (hidden on mobile) */}
                            <div className="hidden lg:block text-xs text-slate-600 max-w-[200px] truncate" title={record.address}>
                              {record.address.split(' •')[0]}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {locationHistory.length > 50 && (
                <div className="mx-8 my-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-800">
                        Displaying 50 of {locationHistory.length} total location records
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Use the date filters above to narrow down results for more detailed analysis and improved performance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enhanced No Data State */}
        {!loading && locationHistory.length === 0 && !error && (
          <Card className="bg-white border-slate-200 shadow-lg rounded-xl">
            <CardContent className="text-center py-16">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full mb-6">
                  <MapPin className="w-12 h-12 text-slate-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">No Location Data Available</h3>
                <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
                  No GPS tracking information found for the selected vehicle and date range.
                </p>
              </div>
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-8 max-w-lg mx-auto">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800">Suggestions</h4>
                </div>
                <ul className="text-left text-slate-600 space-y-2">
                  <li>• Try selecting a different vehicle from the dropdown</li>
                  <li>• Adjust the date range to include more recent data</li>
                  <li>• Ensure the selected vehicle has been active during this period</li>
                  <li>• Check if GPS tracking is enabled for this device</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LocationDashboard; 