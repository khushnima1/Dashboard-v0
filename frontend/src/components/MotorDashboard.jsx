import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  Thermometer, 
  Gauge, 
  Battery, 
  Search, 
  Filter, 
  RefreshCw,
  Settings,
  Activity,
  Power,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

const MotorDashboard = () => {
  const [motorData, setMotorData] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // API configuration
  const API_BASE_URL = 'https://ev-backend.trakmatesolutions.com/extapi';
  const API_KEY = '82fcc5bc-4748-42b3-b664-a3768b5175b9';

  // First fetch all devices to get IMEIs
  const fetchDevices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/devices`, {
        params: {
          currentIndex: 0,
          sizePerPage: 100 // Get more devices
        },
        headers: {
          'accept': '*/*',
          'apikey': API_KEY
        }
      });

      if (response.data && response.data.entities) {
        setDevices(response.data.entities);
        return response.data.entities;
      }
      return [];
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  };

  // Fetch motor data for a specific IMEI
  const fetchMotorDataForDevice = async (imei) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/devices/data/${imei}`, {
        headers: {
          'accept': '*/*',
          'apikey': API_KEY
        }
      });

      if (response.data && response.data.batteryLog) {
        // Extract ignition status from locationLog
        const ignitionStatus = response.data.locationLog?.ign || false;
        
        return {
          imei: imei,
          ...response.data.batteryLog,
          locationLog: response.data.locationLog,
          // Add ignition status to motor data
          motor_ign: ignitionStatus ? 1 : 0,
          // Also extract other location data that might be useful
          motor_speed: response.data.locationLog?.spd || 0,
          motor_satellites: response.data.locationLog?.sat || 0,
          motor_heading: response.data.locationLog?.hdg || 0,
          motor_odometer: response.data.locationLog?.odo || 0,
          motor_live: response.data.locationLog?.liv || false,
          motor_moving: response.data.locationLog?.mvg || false
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching motor data for ${imei}:`, error);
      return null;
    }
  };

  // Fetch motor data for all devices
  const fetchAllMotorData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const deviceList = await fetchDevices();
      if (deviceList.length === 0) {
        throw new Error('No devices found');
      }

      // Fetch motor data for each device
      const motorDataPromises = deviceList.map(device => 
        fetchMotorDataForDevice(device.imei)
      );

      const motorResults = await Promise.all(motorDataPromises);
      const validMotorData = motorResults.filter(data => data !== null);

      // Combine with device info
      const enrichedMotorData = validMotorData.map(motorData => {
        const deviceInfo = deviceList.find(device => device.imei === motorData.imei);
        return {
          ...motorData,
          deviceInfo: deviceInfo || {}
        };
      });

      setMotorData(enrichedMotorData);
    } catch (error) {
      console.error('Error fetching motor data:', error);
      setError(error.message || 'Failed to fetch motor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMotorData();
  }, []);

  // Filter motor data based on search term and status
  const filteredMotorData = motorData.filter(motor => {
    const matchesSearch = searchTerm === '' || 
      motor.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (motor.locationLog?.vehicleNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (motor.deviceInfo?.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'running' && motor.motor_rpm > 0 && motor.motor_ign === 1) ||
      (filterStatus === 'ignition' && motor.motor_ign === 1 && motor.motor_rpm === 0) ||
      (filterStatus === 'idle' && motor.motor_ign === 0) ||
      (filterStatus === 'fault' && motor.motor_fault > 0);
    
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = () => {
    fetchAllMotorData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMotorStatusColor = (motor) => {
    if (motor.motor_fault > 0) return 'bg-red-100 text-red-800 border-red-200';
    if (motor.motor_rpm > 0 && motor.motor_ign === 1) return 'bg-green-100 text-green-800 border-green-200';
    if (motor.motor_ign === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getMotorStatus = (motor) => {
    if (motor.motor_fault > 0) return 'Fault';
    if (motor.motor_rpm > 0 && motor.motor_ign === 1) return 'Running';
    if (motor.motor_ign === 1) return 'Ignition On';
    return 'Off';
  };

  const getMotorStatusIcon = (motor) => {
    if (motor.motor_fault > 0) return <XCircle className="w-4 h-4" />;
    if (motor.motor_rpm > 0 && motor.motor_ign === 1) return <CheckCircle className="w-4 h-4" />;
    if (motor.motor_ign === 1) return <Power className="w-4 h-4" />;
    return <Info className="w-4 h-4" />;
  };

  const getTemperatureColor = (temp) => {
    if (temp > 80) return 'text-red-600';
    if (temp > 60) return 'text-orange-600';
    if (temp > 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading && motorData.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">Loading Motor Data</h3>
            <p className="text-sm text-slate-600">Fetching motor information from all devices...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[500px] border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-lg bg-white/20 p-2">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold">Connection Error</div>
                <div className="text-red-100 text-sm">Unable to fetch motor data</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-slate-600">{error}</p>
              <div className="flex gap-3">
                <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => setError(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <Zap className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Motor Dashboard</h1>
                  <p className="text-purple-100 text-lg">Monitor motor performance and health</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{motorData.length}</div>
                <div className="text-purple-100 text-sm">Active Motors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {motorData.filter(m => m.motor_rpm > 0 && m.motor_ign === 1).length}
                </div>
                <div className="text-purple-100 text-sm">Running</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {motorData.filter(m => m.motor_ign === 1).length}
                </div>
                <div className="text-purple-100 text-sm">Ignition On</div>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by IMEI, Vehicle Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Motors</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="ignition">Ignition</SelectItem>
              <SelectItem value="idle">Idle</SelectItem>
              <SelectItem value="fault">Fault</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredMotorData.length} of {motorData.length} motors
        </div>
      </div>

      {/* Motor Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMotorData.map((motor) => (
          <Card key={motor.imei} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">Motor {motor.imei.slice(-4)}</div>
                    <div className="text-purple-300 text-sm">
                      {motor.locationLog?.vehicleNumber || motor.deviceInfo?.vehicleNo || 'Unknown Vehicle'}
                    </div>
                  </div>
                </div>
                <Badge className={`${getMotorStatusColor(motor)} border flex items-center gap-1`}>
                  {getMotorStatusIcon(motor)}
                  {getMotorStatus(motor)}
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              {/* Motor Performance Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Gauge className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-blue-900">{motor.motor_rpm}</div>
                  <div className="text-xs text-blue-600">RPM</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-green-900">{motor.motor_throt}%</div>
                  <div className="text-xs text-green-600">Throttle</div>
                </div>
              </div>

              {/* Motor Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Power className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Voltage:</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{motor.motor_vlt}V</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Current:</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{motor.motor_cur}A</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Temperature:</span>
                  </div>
                  <span className={`text-sm font-semibold ${getTemperatureColor(motor.motor_temp)}`}>
                    {motor.motor_temp}°C
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Controller Temp:</span>
                  </div>
                  <span className={`text-sm font-semibold ${getTemperatureColor(motor.motor_ctemp)}`}>
                    {motor.motor_ctemp}°C
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Power className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Ignition:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${motor.motor_ign === 1 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm font-semibold ${motor.motor_ign === 1 ? 'text-green-700' : 'text-red-700'}`}>
                      {motor.motor_ign === 1 ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Power Mode:</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{motor.motor_pmode}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Speed:</span>
                  </div>
                  <span className="text-sm text-gray-900 font-semibold">{motor.motor_speed?.toFixed(1) || 0} km/h</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Satellites:</span>
                  </div>
                  <span className={`text-sm font-semibold ${motor.motor_satellites >= 8 ? 'text-green-700' : motor.motor_satellites >= 4 ? 'text-yellow-700' : 'text-red-700'}`}>
                    {motor.motor_satellites || 0}
                  </span>
                </div>
              </div>

              {/* Fault Status */}
              {motor.motor_fault > 0 && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Fault Code:</span>
                    <span className="text-sm text-red-900 font-bold">{motor.motor_fault}</span>
                  </div>
                </div>
              )}

              {/* Battery Info */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Battery Status
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">SOC:</span>
                    <div className="font-semibold text-gray-900">{motor.soc}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Voltage:</span>
                    <div className="font-semibold text-gray-900">{motor.voltage}V</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Current:</span>
                    <div className="font-semibold text-gray-900">{motor.current}A</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Temp:</span>
                    <div className="font-semibold text-gray-900">{motor.temperature}°C</div>
                  </div>
                </div>
              </div>

              {/* Last Update */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Activity className="w-4 h-4" />
                  <span>Last Update: {formatDate(motor.time)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4 flex gap-2">
                <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMotorData.length === 0 && !loading && (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No motor data found</h3>
          <p className="text-gray-500">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No motor data is currently available'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MotorDashboard; 