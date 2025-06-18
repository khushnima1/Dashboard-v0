import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import { 
  ArrowLeft,
  Smartphone, 
  Battery, 
  Wifi, 
  Car,
  User,
  Building,
  Hash,
  MapPin,
  Calendar,
  Settings,
  Activity,
  Zap,
  Route,
  Navigation,
  Gauge,
  Power,
  Disc,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Layers,
  BarChart3,
  TrendingUp,
  CircuitBoard,
  Bolt,
  Fuel,
  CheckCircle,
  XCircle,
  Radio,
  Signal,
  Thermometer,
  Wind,
  Target,
  Timer,
  Play,
  Square,
  MoreHorizontal
} from 'lucide-react';

const DeviceDataDashboard = () => {
  const { imei } = useParams(); // Get IMEI from URL parameter
  const location = useLocation(); // Get state data passed from navigation
  const navigate = useNavigate();

  // Extract device information from navigation state
  const deviceInfo = location.state || {};
  const {
    deviceName = `Device ${imei?.slice(-4)}`,
    vehicleNo,
    vehicleModel,
    batteryNo,
    frameNo,
    simno,
    customerName,
    dealerName,
    groupDetails
  } = deviceInfo;

  const handleBackToDevices = () => {
    navigate('/devices');
  };

  // Generate historical data for graphs (last 30 data points)
  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // Every minute
      data.push({
        time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: timestamp,
        
        // Brake vs Throttle
        throttle: Math.max(0, Math.min(100, 45 + (Math.random() - 0.5) * 40)),
        brake: Math.max(0, Math.min(100, 5 + (Math.random() - 0.5) * 20)),
        
        // Ignition vs Side Stand (0 or 1 for boolean values)
        ignition: Math.random() > 0.2 ? 1 : 0, // 80% on, 20% off
        sideStand: Math.random() > 0.8 ? 1 : 0, // 20% down, 80% up
        
        // Power vs Eco Speed
        powerSpeed: Math.max(0, Math.min(80, 75 + (Math.random() - 0.5) * 20)),
        ecoSpeed: Math.max(0, Math.min(45, 42 + (Math.random() - 0.5) * 10)),
        
        // Phase Current
        phaseCurrent: Math.max(0, 12.5 + (Math.random() - 0.5) * 8),
        
        // Input DC Current (Battery Current)
        inputDCCurrent: Math.max(0, 8.3 + (Math.random() - 0.5) * 6),
        
        // Drive Mode (randomly assign ECO, POWER, NORMAL with ECO being most common)
        driveMode: (() => {
          const rand = Math.random();
          if (rand < 0.6) return 'ECO';      // 60% ECO
          if (rand < 0.8) return 'NORMAL';   // 20% NORMAL
          return 'POWER';                    // 20% POWER
        })()
      });
    }
    return data;
  };

  // Mock real-time vehicle data
  const [vehicleData, setVehicleData] = useState({
    // Status indicators
    ignitionStatus: true,
    sideStandStatus: false,
    connectionStatus: 'connected',
    
    // Distance metrics
    totalDistanceDriven: 15347.8, // km
    connectedRideDistance: 127.3, // km
    todayDistance: 28.7, // km
    
    // Vehicle modes and controls
    driveMode: 'ECO', // POWER, ECO, NORMAL
    brakePosition: 0, // 0-100
    throttlePosition: 45, // 0-100
    
    // Speed metrics
    currentSpeed: 35, // km/h
    maxSpeedToday: 58, // km/h
    powerModeMaxSpeed: 80, // km/h
    ecoModeMaxSpeed: 45, // km/h
    
    // Electrical data
    phaseCurrent: 12.5, // A
    inputDCCurrent: 8.3, // A (battery current)
    batteryVoltage: 52.4, // V
    batterySOC: 78, // %
    batteryTemperature: 32, // °C
    
    // Performance metrics
    motorRPM: 2450,
    powerOutput: 2.8, // kW
    energyEfficiency: 85, // %
    regenBraking: true,
    
    // Additional metrics
    motorTemperature: 38, // °C
    controllerTemperature: 41, // °C
    signalStrength: 85, // %
    gpsAccuracy: 3.2 // meters
  });

  // Historical data for graphs
  const [historicalData, setHistoricalData] = useState(generateHistoricalData());

  // Function to calculate Min, Max, Mean
  const calculateStats = (data, key) => {
    const values = data.map(item => item[key]).filter(val => val !== undefined && val !== null);
    if (values.length === 0) return { min: 0, max: 0, mean: 0 };
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    return {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      mean: parseFloat(mean.toFixed(2))
    };
  };

  // Function to calculate Drive Mode distribution
  const calculateDriveModeDistribution = (data) => {
    const modeCount = {};
    const total = data.length;
    
    // Count occurrences of each drive mode
    data.forEach(item => {
      const mode = item.driveMode;
      modeCount[mode] = (modeCount[mode] || 0) + 1;
    });
    
    // Convert to percentage and create chart data
    return Object.entries(modeCount).map(([mode, count]) => ({
      name: mode,
      value: count,
      percentage: ((count / total) * 100).toFixed(1)
    }));
  };

  // Colors for drive modes
  const DRIVE_MODE_COLORS = {
    'ECO': '#22c55e',     // Green
    'NORMAL': '#3b82f6',  // Blue  
    'POWER': '#ef4444'    // Red
  };

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update current vehicle data
      setVehicleData(prev => {
        // Occasionally change drive mode (10% chance)
        let newDriveMode = prev.driveMode;
        if (Math.random() < 0.1) {
          const modes = ['ECO', 'NORMAL', 'POWER'];
          newDriveMode = modes[Math.floor(Math.random() * modes.length)];
        }

        return {
          ...prev,
          currentSpeed: Math.max(0, prev.currentSpeed + (Math.random() - 0.5) * 10),
          throttlePosition: Math.max(0, Math.min(100, prev.throttlePosition + (Math.random() - 0.5) * 20)),
          brakePosition: Math.max(0, Math.min(100, prev.brakePosition + (Math.random() - 0.5) * 15)),
          phaseCurrent: Math.max(0, prev.phaseCurrent + (Math.random() - 0.5) * 2),
          inputDCCurrent: Math.max(0, prev.inputDCCurrent + (Math.random() - 0.5) * 1.5),
          batterySOC: Math.max(0, Math.min(100, prev.batterySOC + (Math.random() - 0.5) * 0.5)),
          motorRPM: Math.max(0, prev.motorRPM + (Math.random() - 0.5) * 200),
          powerOutput: Math.max(0, prev.powerOutput + (Math.random() - 0.5) * 0.5),
          batteryTemperature: Math.max(0, prev.batteryTemperature + (Math.random() - 0.5) * 2),
          motorTemperature: Math.max(0, prev.motorTemperature + (Math.random() - 0.5) * 2),
          controllerTemperature: Math.max(0, prev.controllerTemperature + (Math.random() - 0.5) * 2),
          driveMode: newDriveMode
        };
      });

      // Update historical data (add new point, remove oldest)
      setHistoricalData(prev => {
        const newData = [...prev];
        const now = new Date();
        
        // Add new data point
        const newPoint = {
          time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: now,
          throttle: Math.max(0, Math.min(100, 45 + (Math.random() - 0.5) * 40)),
          brake: Math.max(0, Math.min(100, 5 + (Math.random() - 0.5) * 20)),
          ignition: Math.random() > 0.2 ? 1 : 0,
          sideStand: Math.random() > 0.8 ? 1 : 0,
          powerSpeed: Math.max(0, Math.min(80, 75 + (Math.random() - 0.5) * 20)),
          ecoSpeed: Math.max(0, Math.min(45, 42 + (Math.random() - 0.5) * 10)),
          phaseCurrent: Math.max(0, 12.5 + (Math.random() - 0.5) * 8),
          inputDCCurrent: Math.max(0, 8.3 + (Math.random() - 0.5) * 6),
          driveMode: (() => {
            const rand = Math.random();
            if (rand < 0.6) return 'ECO';
            if (rand < 0.8) return 'NORMAL';
            return 'POWER';
          })()
        };
        
        // Remove oldest point and add new one
        newData.shift();
        newData.push(newPoint);
        
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isActive) => isActive ? 'text-green-600' : 'text-red-600';
  const getStatusBg = (isActive) => isActive ? 'bg-green-100' : 'bg-red-100';
  
  const getDriveModeColor = (mode) => {
    switch(mode) {
      case 'POWER': return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'ECO': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'NORMAL': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="space-y-6">
          {/* Enhanced Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToDevices}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 border-slate-300/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Devices
              </Button>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 via-blue-700 to-purple-800 bg-clip-text text-transparent">
                  Device Analytics
                </h1>
                <p className="text-lg font-semibold text-slate-600 mt-1">Real-time monitoring for {deviceName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className={`px-4 py-2 text-sm font-bold ${vehicleData.connectionStatus === 'connected' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                <Signal className="w-4 h-4 mr-2" />
                {vehicleData.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-4 py-2 text-sm font-bold">
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Live Data
              </Badge>
            </div>
          </div>

          {/* Vehicle Status Header Card */}
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Car className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black">{deviceName}</h2>
                    <p className="text-blue-100 text-lg font-semibold">IMEI: {imei}</p>
                    <p className="text-blue-200 text-sm">Real-time Vehicle Telemetry</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-black">{vehicleData.currentSpeed.toFixed(0)}</div>
                  <div className="text-lg font-bold text-blue-100">km/h</div>
                  <div className="text-sm text-blue-200">Current Speed</div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Critical Status Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Ignition Status */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-xl ${getStatusBg(vehicleData.ignitionStatus)}`}>
                    <Zap className={`w-5 h-5 ${getStatusColor(vehicleData.ignitionStatus)}`} />
                  </div>
                  Ignition Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black ${getStatusColor(vehicleData.ignitionStatus)}`}>
                    {vehicleData.ignitionStatus ? 'ON' : 'OFF'}
                  </span>
                  {vehicleData.ignitionStatus ? 
                    <CheckCircle className="w-8 h-8 text-green-600" /> : 
                    <XCircle className="w-8 h-8 text-red-600" />
                  }
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {vehicleData.ignitionStatus ? 'Engine Running' : 'Engine Stopped'}
                </p>
              </CardContent>
            </Card>

            {/* Side Stand Status */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className={`p-2 rounded-xl ${getStatusBg(!vehicleData.sideStandStatus)}`}>
                    <Disc className={`w-5 h-5 ${getStatusColor(!vehicleData.sideStandStatus)}`} />
                  </div>
                  Side Stand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black ${getStatusColor(!vehicleData.sideStandStatus)}`}>
                    {vehicleData.sideStandStatus ? 'DOWN' : 'UP'}
                  </span>
                  {!vehicleData.sideStandStatus ? 
                    <CheckCircle className="w-8 h-8 text-green-600" /> : 
                    <XCircle className="w-8 h-8 text-red-600" />
                  }
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {vehicleData.sideStandStatus ? 'Stand Down' : 'Ready to Ride'}
                </p>
              </CardContent>
            </Card>

            {/* Drive Mode */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Settings className="w-5 h-5 text-purple-600" />
                  </div>
                  Drive Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`text-2xl font-black text-white px-4 py-2 rounded-xl ${getDriveModeColor(vehicleData.driveMode)}`}>
                    {vehicleData.driveMode}
                  </span>
                  <Power className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Current driving mode
                </p>
              </CardContent>
            </Card>

            {/* Battery SOC */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <Battery className="w-5 h-5 text-orange-600" />
                  </div>
                  Battery SOC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-black text-orange-600">
                    {vehicleData.batterySOC.toFixed(1)}%
                  </span>
                  <Battery className="w-8 h-8 text-orange-600" />
                </div>
                                 <div className="relative h-2 w-full overflow-hidden rounded-full bg-orange-100">
                   <div className="h-full bg-orange-500 transition-all" style={{ width: `${vehicleData.batterySOC}%` }} />
                 </div>
                <p className="text-sm text-slate-600 mt-2">
                  {vehicleData.batteryVoltage.toFixed(1)}V
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                    <Route className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent font-black">
                    Total Distance
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-black text-blue-600 mb-2">
                    {vehicleData.totalDistanceDriven.toLocaleString()}
                  </div>
                  <div className="text-lg font-bold text-slate-600">kilometers driven</div>
                  <div className="text-sm text-slate-500 mt-2">Lifetime odometer reading</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-black">
                    Connected Ride
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-600 mb-2">
                    {vehicleData.connectedRideDistance.toFixed(1)}
                  </div>
                  <div className="text-lg font-bold text-slate-600">km this ride</div>
                  <div className="text-sm text-slate-500 mt-2">Current trip distance</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent font-black">
                    Today's Distance
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-black text-purple-600 mb-2">
                    {vehicleData.todayDistance.toFixed(1)}
                  </div>
                  <div className="text-lg font-bold text-slate-600">km today</div>
                  <div className="text-sm text-slate-500 mt-2">Daily usage</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Drive Mode Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent font-black">
                  Drive Mode Distribution
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Drive Mode */}
              <div className="text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                  <Power className="w-6 h-6" />
                  <span className="text-2xl font-black">Current: {vehicleData.driveMode}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Donut Chart */}
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-bold text-slate-700 mb-4">Usage Distribution</h3>
                  <div className="relative w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={calculateDriveModeDistribution(historicalData)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {calculateDriveModeDistribution(historicalData).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={DRIVE_MODE_COLORS[entry.name] || '#94a3b8'} 
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value, name, props) => [
                            `${props.payload.percentage}% (${value} times)`,
                            `${name} Mode`
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Center Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-2xl font-black text-slate-800">Drive</div>
                        <div className="text-lg font-bold text-slate-600">Modes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-700">Mode Statistics</h3>
                  
                  {calculateDriveModeDistribution(historicalData).map((mode, index) => (
                    <div key={mode.name} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: DRIVE_MODE_COLORS[mode.name] }}
                        ></div>
                        <div>
                          <div className="font-bold text-slate-800">{mode.name} Mode</div>
                          <div className="text-sm text-slate-600">
                            {mode.name === 'ECO' && 'Energy efficient driving'}
                            {mode.name === 'NORMAL' && 'Balanced performance'}
                            {mode.name === 'POWER' && 'Maximum performance'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black" style={{ color: DRIVE_MODE_COLORS[mode.name] }}>
                          {mode.percentage}%
                        </div>
                        <div className="text-sm text-slate-600">{mode.value} times</div>
                      </div>
                    </div>
                  ))}

                  {/* Summary */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                    <div className="text-center">
                      <div className="text-sm font-bold text-purple-700 mb-2">Total Data Points</div>
                      <div className="text-3xl font-black text-purple-600">{historicalData.length}</div>
                      <div className="text-xs text-purple-600 mt-1">Last 30 minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Controls and Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Brake vs Throttle */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl">
                    <Gauge className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-red-700 to-orange-700 bg-clip-text text-transparent font-black">
                    Brake vs Throttle
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Values */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ArrowUp className="w-4 h-4 text-green-600" />
                        Throttle Position
                      </span>
                      <span className="text-lg font-black text-green-600">{vehicleData.throttlePosition.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-green-100">
                      <div className="h-full bg-green-500 transition-all" style={{ width: `${vehicleData.throttlePosition}%` }} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <ArrowDown className="w-4 h-4 text-red-600" />
                        Brake Position
                      </span>
                      <span className="text-lg font-black text-red-600">{vehicleData.brakePosition.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-red-100">
                      <div className="h-full bg-red-500 transition-all" style={{ width: `${vehicleData.brakePosition}%` }} />
                    </div>
                  </div>
                </div>

                {/* Line Graph */}
                <div className="mt-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="throttle" 
                          stroke="#22c55e" 
                          strokeWidth={3}
                          dot={false}
                          name="Throttle (%)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="brake" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          dot={false}
                          name="Brake (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="text-center text-sm font-bold text-green-700">Throttle Statistics</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-black text-green-600">{calculateStats(historicalData, 'throttle').min}%</div>
                        <div className="text-slate-600">Min</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-green-600">{calculateStats(historicalData, 'throttle').max}%</div>
                        <div className="text-slate-600">Max</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-green-600">{calculateStats(historicalData, 'throttle').mean}%</div>
                        <div className="text-slate-600">Mean</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center text-sm font-bold text-red-700">Brake Statistics</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-black text-red-600">{calculateStats(historicalData, 'brake').min}%</div>
                        <div className="text-slate-600">Min</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-red-600">{calculateStats(historicalData, 'brake').max}%</div>
                        <div className="text-slate-600">Max</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-red-600">{calculateStats(historicalData, 'brake').mean}%</div>
                        <div className="text-slate-600">Mean</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Speed Modes Comparison */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent font-black">
                    Power vs Eco Speed
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Values */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                    <Power className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-black text-red-600">{vehicleData.powerModeMaxSpeed}</div>
                    <div className="text-sm font-bold text-red-700">POWER Mode</div>
                    <div className="text-xs text-red-600">Max Speed (km/h)</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <Layers className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-black text-green-600">{vehicleData.ecoModeMaxSpeed}</div>
                    <div className="text-sm font-bold text-green-700">ECO Mode</div>
                    <div className="text-xs text-green-600">Max Speed (km/h)</div>
                  </div>
                </div>

                {/* Line Graph */}
                <div className="mt-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="powerSpeed" 
                          stroke="#dc2626" 
                          strokeWidth={3}
                          dot={false}
                          name="Power Speed (km/h)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ecoSpeed" 
                          stroke="#16a34a" 
                          strokeWidth={3}
                          dot={false}
                          name="Eco Speed (km/h)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                  <div className="space-y-3">
                    <div className="text-center text-sm font-bold text-red-700">Power Speed Statistics</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-black text-red-600">{calculateStats(historicalData, 'powerSpeed').min}</div>
                        <div className="text-slate-600">Min</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-red-600">{calculateStats(historicalData, 'powerSpeed').max}</div>
                        <div className="text-slate-600">Max</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-red-600">{calculateStats(historicalData, 'powerSpeed').mean}</div>
                        <div className="text-slate-600">Mean</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center text-sm font-bold text-green-700">Eco Speed Statistics</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-black text-green-600">{calculateStats(historicalData, 'ecoSpeed').min}</div>
                        <div className="text-slate-600">Min</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-green-600">{calculateStats(historicalData, 'ecoSpeed').max}</div>
                        <div className="text-slate-600">Max</div>
                      </div>
                      <div className="text-center">
                        <div className="font-black text-green-600">{calculateStats(historicalData, 'ecoSpeed').mean}</div>
                        <div className="text-slate-600">Mean</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Readings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Phase Current */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl">
                    <CircuitBoard className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-yellow-700 to-orange-700 bg-clip-text text-transparent font-black">
                    Phase Current
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Value */}
                <div className="text-center">
                  <div className="text-5xl font-black text-yellow-600 mb-3">
                    {vehicleData.phaseCurrent.toFixed(1)}
                  </div>
                  <div className="text-xl font-bold text-slate-600">Amperes</div>
                  <div className="text-sm text-slate-500 mt-2">AC Motor Current</div>
                </div>

                {/* Line Graph */}
                <div className="mt-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 'dataMax + 2']}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="phaseCurrent" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={false}
                          name="Phase Current (A)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-black text-yellow-600">{calculateStats(historicalData, 'phaseCurrent').min}A</div>
                    <div className="text-xs font-semibold text-slate-600">Min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-yellow-600">{calculateStats(historicalData, 'phaseCurrent').max}A</div>
                    <div className="text-xs font-semibold text-slate-600">Max</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-yellow-600">{calculateStats(historicalData, 'phaseCurrent').mean}A</div>
                    <div className="text-xs font-semibold text-slate-600">Mean</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-black text-slate-800">{vehicleData.energyEfficiency}%</div>
                      <div className="text-xs font-semibold text-slate-600">Efficiency</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-800">{vehicleData.regenBraking ? 'ON' : 'OFF'}</div>
                      <div className="text-xs font-semibold text-slate-600">Regen Brake</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DC Current (Battery Current) */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
                    <Bolt className="w-6 h-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-700 to-cyan-700 bg-clip-text text-transparent font-black">
                    Input DC Current
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Value */}
                <div className="text-center">
                  <div className="text-5xl font-black text-blue-600 mb-3">
                    {vehicleData.inputDCCurrent.toFixed(1)}
                  </div>
                  <div className="text-xl font-bold text-slate-600">Amperes</div>
                  <div className="text-sm text-slate-500 mt-2">Battery Current</div>
                </div>

                {/* Line Graph */}
                <div className="mt-6">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#64748b"
                          fontSize={12}
                          tickLine={false}
                          domain={[0, 'dataMax + 2']}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="inputDCCurrent" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          dot={false}
                          name="Input DC Current (A)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-black text-blue-600">{calculateStats(historicalData, 'inputDCCurrent').min}A</div>
                    <div className="text-xs font-semibold text-slate-600">Min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-blue-600">{calculateStats(historicalData, 'inputDCCurrent').max}A</div>
                    <div className="text-xs font-semibold text-slate-600">Max</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-blue-600">{calculateStats(historicalData, 'inputDCCurrent').mean}A</div>
                    <div className="text-xs font-semibold text-slate-600">Mean</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-black text-slate-800">{vehicleData.batteryVoltage.toFixed(1)}V</div>
                      <div className="text-xs font-semibold text-slate-600">Voltage</div>
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-800">{(vehicleData.batteryVoltage * vehicleData.inputDCCurrent / 1000).toFixed(2)} kW</div>
                      <div className="text-xs font-semibold text-slate-600">Power</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ignition vs Side Stand Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent font-black">
                  Ignition vs Side Stand Status
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current Status */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-green-600">{vehicleData.ignitionStatus ? 'ON' : 'OFF'}</div>
                  <div className="text-sm font-bold text-green-700">Ignition</div>
                  <div className="text-xs text-green-600">Current Status</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <Disc className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-black text-blue-600">{vehicleData.sideStandStatus ? 'DOWN' : 'UP'}</div>
                  <div className="text-sm font-bold text-blue-700">Side Stand</div>
                  <div className="text-xs text-blue-600">Current Position</div>
                </div>
              </div>

              {/* Line Graph */}
              <div className="mt-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        domain={[0, 1]}
                        tickFormatter={(value) => value === 1 ? 'ON/DOWN' : 'OFF/UP'}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        }}
                        formatter={(value, name) => [
                          name === 'Ignition Status' 
                            ? (value === 1 ? 'ON' : 'OFF')
                            : (value === 1 ? 'DOWN' : 'UP'),
                          name
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="stepAfter" 
                        dataKey="ignition" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                        dot={false}
                        name="Ignition Status"
                      />
                      <Line 
                        type="stepAfter" 
                        dataKey="sideStand" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={false}
                        name="Side Stand Status"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-3">
                  <div className="text-center text-sm font-bold text-green-700">Ignition Statistics</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-black text-green-600">{calculateStats(historicalData, 'ignition').min}</div>
                      <div className="text-slate-600">Min</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-green-600">{calculateStats(historicalData, 'ignition').max}</div>
                      <div className="text-slate-600">Max</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-green-600">{calculateStats(historicalData, 'ignition').mean}</div>
                      <div className="text-slate-600">Mean</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-center text-sm font-bold text-blue-700">Side Stand Statistics</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="font-black text-blue-600">{calculateStats(historicalData, 'sideStand').min}</div>
                      <div className="text-slate-600">Min</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-blue-600">{calculateStats(historicalData, 'sideStand').max}</div>
                      <div className="text-slate-600">Max</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-blue-600">{calculateStats(historicalData, 'sideStand').mean}</div>
                      <div className="text-slate-600">Mean</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Monitoring */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl">
                  <Thermometer className="w-6 h-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent font-black">
                  Temperature Monitoring
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                  <Battery className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                  <div className="text-3xl font-black text-orange-600">{vehicleData.batteryTemperature.toFixed(0)}°C</div>
                  <div className="text-sm font-bold text-orange-700">Battery</div>
                  <div className="text-xs text-orange-600 mt-1">Temperature</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <Settings className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                  <div className="text-3xl font-black text-blue-600">{vehicleData.motorTemperature.toFixed(0)}°C</div>
                  <div className="text-sm font-bold text-blue-700">Motor</div>
                  <div className="text-xs text-blue-600 mt-1">Temperature</div>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <CircuitBoard className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                  <div className="text-3xl font-black text-purple-600">{vehicleData.controllerTemperature.toFixed(0)}°C</div>
                  <div className="text-sm font-bold text-purple-700">Controller</div>
                  <div className="text-xs text-purple-600 mt-1">Temperature</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/battery')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Battery className="w-5 h-5 text-orange-600" />
                  Battery Deep Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">View detailed battery performance, cell voltages, and health metrics</p>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  View Battery Dashboard
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer" onClick={() => navigate('/location')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  Location & Route Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">Track GPS location, route history, and geographical performance data</p>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600">
                  View Location Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDataDashboard; 