import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Smartphone, 
  Battery, 
  Wifi, 
  Calendar, 
  Search, 
  Filter, 
  RefreshCw,
  MapPin,
  Settings,
  Zap,
  Shield,
  Users,
  Car,
  User,
  Phone,
  Building,
  Hash
} from 'lucide-react';

const VehicleDashboard = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sizePerPage] = useState(10);

  // API configuration
  const API_BASE_URL = 'https://ev-backend.trakmatesolutions.com/extapi';
  const API_KEY = '82fcc5bc-4748-42b3-b664-a3768b5175b9';

  // Vehicle name mapping - IMEI to friendly names
  const vehicleNameMap = {
    '359214420551701': 'AB 01-P-01',
    '359214420463410': 'DC 01-P-01', 
    '864207076676382': 'DC 01-E-01',
    '864207076682877': 'AB 01-E-01'
  };

  // Function to get friendly vehicle name from IMEI
  const getVehicleName = (imei) => {
    return vehicleNameMap[imei] || `Vehicle ${imei.slice(-4)}`;
  };

  const fetchVehicles = async (page = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the enhanced endpoint that combines API and MongoDB data
      const response = await fetch(`https://dashboard-v0-k2gn.onrender.com/api/vehicles-enhanced?currentIndex=${page}&sizePerPage=${sizePerPage}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Enhanced API Response:', data);
      
      if (data && data.entities) {
        setVehicles(data.entities);
        setTotalCount(data.totalCount || 0);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError(error.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(currentPage);
  }, [currentPage]);

  // Filter vehicles based on search term and group
  const filteredVehicles = vehicles.filter(vehicle => {
    const friendlyName = getVehicleName(vehicle.imei);
    const matchesSearch = searchTerm === '' || 
      vehicle.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friendlyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.batteryNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.simno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.groupDetails?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleModel || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.dealerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.frameNo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = filterGroup === 'all' || 
      (vehicle.groupDetails?.name || '').toLowerCase() === filterGroup.toLowerCase();
    
    return matchesSearch && matchesGroup;
  });

  // Get unique groups for filter
  const uniqueGroups = [...new Set(vehicles.map(vehicle => vehicle.groupDetails?.name).filter(Boolean))];

  const handleRefresh = () => {
    fetchVehicles(currentPage);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Navigation handler for Monitor button
  const handleMonitorDevice = (vehicle) => {
    const deviceName = getVehicleName(vehicle.imei);
    // Navigate to device data dashboard with device information
    navigate(`/device-data/${vehicle.imei}`, {
      state: {
        deviceName,
        imei: vehicle.imei,
        vehicleNo: vehicle.vehicleNo,
        vehicleModel: vehicle.vehicleModel,
        batteryNo: vehicle.batteryNo,
        frameNo: vehicle.frameNo,
        simno: vehicle.simno,
        customerName: vehicle.customerName,
        dealerName: vehicle.dealerName,
        groupDetails: vehicle.groupDetails
      }
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSaleDate = (dateString) => {
    if (!dateString) return 'Not Available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVehicleStatusColor = (vehicle) => {
    // You can implement vehicle status logic here
    // For now, we'll use a simple logic based on creation date
    const daysSinceCreated = Math.floor((new Date() - new Date(vehicle.createdDate)) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated < 7) return 'bg-green-100 text-green-800 border-green-200';
    if (daysSinceCreated < 30) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getVehicleStatus = (vehicle) => {
    const daysSinceCreated = Math.floor((new Date() - new Date(vehicle.createdDate)) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated < 7) return 'Active';
    if (daysSinceCreated < 30) return 'Idle';
    return 'Inactive';
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-6 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">Loading Vehicles</h3>
            <p className="text-sm text-slate-600 font-medium">Fetching vehicle information...</p>
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
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold">Connection Error</div>
                <div className="text-red-100 text-sm">Unable to fetch vehicle data</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-slate-600 font-medium">{error}</p>
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                  <Smartphone className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Vehicle Dashboard</h1>
                  <p className="text-blue-100 text-lg">Monitor and manage all connected vehicles</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalCount}</div>
                <div className="text-blue-100 text-sm">Total Vehicles</div>
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
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl"></div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search by Vehicle Name, IMEI, Vehicle No, Battery, SIM, Model, Dealer, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-96"
            />
          </div>
          
          <Select value={filterGroup} onValueChange={setFilterGroup}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {uniqueGroups.map(group => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-slate-600 font-medium">
          Showing {filteredVehicles.length} of {vehicles.length} vehicles
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <Card 
            key={vehicle.id} 
            className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 cursor-pointer hover:scale-105 hover:border-blue-300 hover:ring-2 hover:ring-blue-200"
            onClick={() => handleMonitorDevice(vehicle)}
          >
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold">{getVehicleName(vehicle.imei)}</div>
                    <div className="text-slate-300 text-sm">IMEI: {vehicle.imei}</div>
                  </div>
                </div>
                <Badge 
                  className={`${getVehicleStatusColor(vehicle)} border`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {getVehicleStatus(vehicle)}
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-300 mt-2">
                {/* Removed Vehicle and Battery info from header - now shown in main section */}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              {/* Vehicle Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Vehicle No:</span>
                  <span className="text-sm text-slate-900 font-medium">
                    {vehicle.vehicleNo || 'Not Assigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Vehicle Model:</span>
                  <span className="text-sm text-slate-900 font-medium">
                    {vehicle.vehicleModel || 'Not Available'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Frame No:</span>
                  <span className="text-sm text-slate-900 font-mono">
                    {vehicle.frameNo || 'Not Available'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Battery className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Battery No:</span>
                  <span className="text-sm text-slate-900 font-medium">
                    {(vehicle.batteryNo && vehicle.batteryNo !== "0") ? vehicle.batteryNo : 'Not Assigned'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">IMEI:</span>
                  <span className="text-sm text-slate-900 font-mono">{vehicle.imei}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">SIM:</span>
                  <span className="text-sm text-slate-900 font-mono">{vehicle.simno}</span>
                </div>
                
                {vehicle.groupDetails && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700">Group:</span>
                    <Badge variant="outline" className="text-sm font-medium">
                      {vehicle.groupDetails.name}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700">Sale Date:</span>
                  <span className="text-sm text-slate-900 font-medium">
                    {formatSaleDate(vehicle.saleDate)}
                  </span>
                </div>
              </div>

              {/* Dealer Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Dealer Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 w-20">Name:</span>
                    <span className="text-sm text-slate-900 font-medium">
                      {vehicle.dealerName || 'Not Available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 w-20">Location:</span>
                    <span className="text-sm text-slate-900 font-medium">
                      {vehicle.dealerLocation || 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Customer Details
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 w-20">Name:</span>
                    <span className="text-sm text-slate-900 font-medium">
                      {vehicle.customerName || 'Not Available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700 w-16">Phone:</span>
                    <span className="text-sm text-slate-900 font-mono">
                      {vehicle.customerPhone || 'Not Available'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-700 w-16">Address:</span>
                    <span className="text-sm text-slate-900 font-medium leading-relaxed">
                      {vehicle.customerAddress || 'Not Available'}
                    </span>
                  </div>
                </div>
              </div>

              {/* BMS Specifications */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  BMS Specifications
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Software:</span>
                    <div className="text-sm font-mono text-slate-900">
                      {vehicle.bmsSoftware || vehicle.fwver || 'Not Available'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-700">Hardware:</span>
                    <div className="text-sm font-mono text-slate-900">
                      {vehicle.bmsHardware || vehicle.hwver || 'Not Available'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Creation Date */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Created: {formatDate(vehicle.createdDate)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-4 flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMonitorDevice(vehicle);
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Monitor
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > sizePerPage && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.ceil(totalCount / sizePerPage) }, (_, i) => (
              <Button
                key={i}
                variant={currentPage === i ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(i)}
                className="w-10 h-10"
              >
                {i + 1}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= Math.ceil(totalCount / sizePerPage) - 1}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredVehicles.length === 0 && !loading && (
        <div className="text-center py-12">
          <Smartphone className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">No vehicles found</h3>
          <p className="text-sm text-slate-600 font-medium">
            {searchTerm || filterGroup !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'No vehicles are currently registered'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleDashboard;