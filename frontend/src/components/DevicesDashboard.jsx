import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const DevicesDashboard = () => {
  const [allDevicesData, setAllDevicesData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalDevices: 0,
    activeDevices: 0,
    movingDevices: 0,
    idleDevices: 0,
    haltedDevices: 0,
    stoppedDevices: 0,
    inactiveDevices: 0,
    batteryCharging: 0,
    batteryDischarging: 0,
    batteryIdle: 0,
    statusBreakdown: {},
    deviceTypes: {},
    batteryLevels: []
  });

  // Filter options for the API
  const filterOptions = [
    { value: 'all', label: 'All Devices', icon: '🚗', color: '#6B7280' },
    { value: 'active', label: 'Active', icon: '✅', color: '#10B981' },
    { value: 'moving', label: 'Moving', icon: '🚛', color: '#3B82F6' },
    { value: 'idle', label: 'Idle', icon: '⏸️', color: '#F59E0B' },
    { value: 'halted', label: 'Halted', icon: '🛑', color: '#EF4444' },
    { value: 'stopped', label: 'Stopped', icon: '🚫', color: '#8B5CF6' },
    { value: 'inactive', label: 'Inactive', icon: '❌', color: '#EF4444' },
    { value: 'battery_charging', label: 'Charging', icon: '🔋', color: '#10B981' },
    { value: 'battery_discharging', label: 'Discharging', icon: '🪫', color: '#F59E0B' },
    { value: 'battery_idle', label: 'Battery Idle', icon: '🔋', color: '#6B7280' }
  ];

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);

  // API configuration
  const API_CONFIG = {
    baseURL: 'https://ev-backend.trakmatesolutions.com/extapi/devices/filter',
    apiKey: '82fcc5bc-4748-42b3-b664-a3768b5175b9'
  };

  // Fetch data for all filters to get comprehensive analytics
  const fetchAllFiltersData = async () => {
    const filterTypes = ['all', 'active', 'moving', 'idle', 'halted', 'stopped', 'inactive', 'battery_charging', 'battery_discharging', 'battery_idle'];
    const results = {};

    for (const filter of filterTypes) {
      try {
        const url = `${API_CONFIG.baseURL}?currentIndex=0&sizePerPage=100&filter=${filter}`;
        const response = await axios.get(url, {
          headers: {
            'accept': '*/*',
            'apikey': API_CONFIG.apiKey
          }
        });

        if (response.data && response.data.entities) {
          results[filter] = {
            totalCount: response.data.totalCount || 0,
            entities: response.data.entities || []
          };
        } else {
          results[filter] = { totalCount: 0, entities: [] };
        }
      } catch (err) {
        console.error(`Error fetching ${filter} data:`, err);
        results[filter] = { totalCount: 0, entities: [] };
      }
    }

    return results;
  };

  // Process comprehensive analytics from all filter data
  const processComprehensiveAnalytics = (allData) => {
    const allDevices = allData.all?.entities || [];
    const activeDevices = allData.active?.totalCount || 0;
    const movingDevices = allData.moving?.totalCount || 0;
    const idleDevices = allData.idle?.totalCount || 0;
    const haltedDevices = allData.halted?.totalCount || 0;
    const stoppedDevices = allData.stopped?.totalCount || 0;
    const inactiveDevices = allData.inactive?.totalCount || 0;
    const batteryCharging = allData.battery_charging?.totalCount || 0;
    const batteryDischarging = allData.battery_discharging?.totalCount || 0;
    const batteryIdle = allData.battery_idle?.totalCount || 0;

    // Create status breakdown for the chart
    const statusBreakdown = {
      'Moving': movingDevices,
      'Stopped': stoppedDevices,
      'Idle': idleDevices,
      'Disconnected': inactiveDevices,
      'Halted': haltedDevices
    };

    // Remove zero values for cleaner chart
    Object.keys(statusBreakdown).forEach(key => {
      if (statusBreakdown[key] === 0) {
        delete statusBreakdown[key];
      }
    });

    // Device types from all devices
    const deviceTypes = {};
    const batteryLevels = [];

    allDevices.forEach((device, index) => {
      const deviceType = device.deviceType || 'EV';
      deviceTypes[deviceType] = (deviceTypes[deviceType] || 0) + 1;

      // Process battery level from voltage
      if (device.voltage !== undefined && device.voltage !== null) {
        let batteryPercent = 0;
        if (device.voltage >= 12) {
          batteryPercent = Math.min(100, ((device.voltage - 12) / 3) * 100);
        }
        
        batteryLevels.push({
          id: device.imei,
          name: device.vehicleNumber || device.imei || `Device ${index}`,
          battery: Math.round(batteryPercent)
        });
      }
    });

    setAnalytics({
      totalDevices: allData.all?.totalCount || 0,
      activeDevices,
      movingDevices,
      idleDevices,
      haltedDevices,
      stoppedDevices,
      inactiveDevices,
      batteryCharging,
      batteryDischarging,
      batteryIdle,
      statusBreakdown,
      deviceTypes,
      batteryLevels
    });
  };

  // Fetch devices data from API
  const fetchDevicesData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching comprehensive device data...');

      // Fetch all filter data for analytics
      const allFiltersData = await fetchAllFiltersData();
      setAllDevicesData(allFiltersData);
      processComprehensiveAnalytics(allFiltersData);

      console.log('Comprehensive data fetched:', allFiltersData);
    } catch (err) {
      console.error('Error fetching devices data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch devices data');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setCurrentPage(0);
  };

  useEffect(() => {
    fetchDevicesData();
  }, []);

  // Get current filter devices for table display
  const getCurrentFilterDevices = () => {
    return allDevicesData[selectedFilter]?.entities || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading fleet analytics...</p>
          <p className="text-slate-500 text-sm mt-2">Fetching data from all endpoints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-3">Unable to Load Fleet Data</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button 
              onClick={fetchDevicesData}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              🔄 Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentDevices = getCurrentFilterDevices();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-xl rounded-b-3xl p-8 mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              🚗 Fleet Analytics Dashboard
            </h1>
            <p className="text-slate-600 text-lg">Real-time vehicle monitoring and comprehensive fleet insights</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className={`px-8 py-4 rounded-2xl shadow-lg ${
              analytics.totalDevices > 0 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  analytics.totalDevices > 0 ? 'bg-white animate-pulse' : 'bg-gray-300'
                }`}></div>
                <span className="font-bold text-xl">
                  {analytics.totalDevices > 0 ? `📡 ${analytics.totalDevices} Vehicles` : '📡 No Data'}
                </span>
              </div>
            </div>
            {analytics.totalDevices > 0 && (
              <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleTimeString()}</p>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-2xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Filter Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                🔍 Filter Vehicles
              </label>
              <select
                value={selectedFilter}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                📊 Page Size
              </label>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
              >
                <option value={10}>10 vehicles</option>
                <option value={25}>25 vehicles</option>
                <option value={50}>50 vehicles</option>
                <option value={100}>100 vehicles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                📄 Page Number
              </label>
              <input
                type="number"
                min="0"
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                placeholder="Page number"
              />
            </div>

            <div>
              <button
                onClick={fetchDevicesData}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    🔄 Refresh Data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Selection Info */}
          <div className="mt-4 p-4 bg-white rounded-xl border border-blue-200">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Filter: {filterOptions.find(f => f.value === selectedFilter)?.label || selectedFilter}
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Showing: {currentDevices.length} vehicles
              </span>
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Total Fleet: {analytics.totalDevices} vehicles
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* No Data State */}
        {!loading && analytics.totalDevices === 0 && !error && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Vehicles Found</h3>
              <p className="text-slate-500 mb-6">
                No vehicles found in your fleet. Please check your API configuration or add vehicles to your fleet.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  💡 Tip: Ensure your API key is valid and vehicles are properly registered.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Status Metrics Cards - Only show when data is available */}
        {analytics.totalDevices > 0 && (
          <>
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Total Vehicles */}
              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">Total Fleet</p>
                    <p className="text-2xl font-bold text-blue-800 group-hover:scale-105 transition-transform duration-300">{analytics.totalDevices}</p>
                  </div>
                </div>
              </div>

              {/* Active Vehicles */}
              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 hover:border-green-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">Active</p>
                    <p className="text-2xl font-bold text-green-800 group-hover:scale-105 transition-transform duration-300">{analytics.activeDevices}</p>
                  </div>
                </div>
              </div>

              {/* Moving Vehicles */}
              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 hover:border-blue-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">Moving</p>
                    <p className="text-2xl font-bold text-blue-800 group-hover:scale-105 transition-transform duration-300">{analytics.movingDevices}</p>
                  </div>
                </div>
              </div>

              {/* Idle Vehicles */}
              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-100 hover:border-yellow-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-yellow-600">Idle</p>
                    <p className="text-2xl font-bold text-yellow-800 group-hover:scale-105 transition-transform duration-300">{analytics.idleDevices}</p>
                  </div>
                </div>
              </div>

              {/* Stopped Vehicles */}
              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">Stopped</p>
                    <p className="text-2xl font-bold text-purple-800 group-hover:scale-105 transition-transform duration-300">{analytics.stoppedDevices}</p>
                  </div>
                </div>
              </div>

              {/* Disconnected Vehicles */}
              <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100 hover:border-red-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-white shadow-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">Disconnected</p>
                    <p className="text-2xl font-bold text-red-800 group-hover:scale-105 transition-transform duration-300">{analytics.inactiveDevices}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vehicle Status Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">Vehicle Status</h3>
                  <div className="flex items-center gap-2 text-slate-500">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm">Live</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-80 flex items-center justify-center">
                    <Doughnut
                      data={{
                        labels: Object.keys(analytics.statusBreakdown),
                        datasets: [{
                          data: Object.values(analytics.statusBreakdown),
                          backgroundColor: [
                            '#3B82F6', // Moving - Blue
                            '#10B981', // Stopped - Green  
                            '#F59E0B', // Idle - Yellow
                            '#EF4444', // Disconnected - Red
                            '#8B5CF6'  // Halted - Purple
                          ],
                          borderWidth: 0,
                          hoverBorderWidth: 4,
                          hoverBorderColor: '#ffffff'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: {
                            position: 'right',
                            labels: {
                              padding: 20,
                              usePointStyle: true,
                              font: {
                                size: 14,
                                weight: 500
                              },
                              generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                  return data.labels.map((label, i) => {
                                    const dataset = data.datasets[0];
                                    const value = dataset.data[i];
                                    const total = dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    
                                    return {
                                      text: `${label} (${percentage}%)`,
                                      fillStyle: dataset.backgroundColor[i],
                                      hidden: false,
                                      index: i
                                    };
                                  });
                                }
                                return [];
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-500 mb-1">Total</p>
                      <p className="text-4xl font-bold text-slate-800">{analytics.totalDevices}</p>
                      <p className="text-sm text-slate-500">vehicles</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Last Updated:</span>
                    <span className="font-medium text-slate-700">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Device Types Chart */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Fleet Composition</h3>
                </div>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: Object.keys(analytics.deviceTypes),
                      datasets: [
                        {
                          label: 'Number of Vehicles',
                          data: Object.values(analytics.deviceTypes),
                          backgroundColor: 'rgba(99, 102, 241, 0.8)',
                          borderColor: 'rgb(99, 102, 241)',
                          borderWidth: 2,
                          borderRadius: 8,
                          borderSkipped: false,
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          },
                          ticks: {
                            font: {
                              size: 12
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            font: {
                              size: 12,
                              weight: 500
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: 'white',
                          bodyColor: 'white',
                          borderColor: 'rgba(99, 102, 241, 0.8)',
                          borderWidth: 1
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Devices Table */}
        {analytics.totalDevices > 0 && (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Vehicle Fleet Details</h3>
                  <p className="text-slate-500">Detailed view of all vehicles in your fleet</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-xl text-sm font-bold border border-emerald-200">
                  📊 {currentDevices.length} vehicles shown
                </span>
                <button 
                  onClick={fetchDevicesData}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-lg"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-100 to-blue-50 border-b-2 border-slate-200">
                    <th className="text-left py-4 px-6 font-bold text-slate-700">Vehicle ID</th>
                    <th className="text-left py-4 px-6 font-bold text-slate-700">Vehicle Name</th>
                    <th className="text-left py-4 px-6 font-bold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 font-bold text-slate-700">Type</th>
                    <th className="text-left py-4 px-6 font-bold text-slate-700">Last Update</th>
                    <th className="text-left py-4 px-6 font-bold text-slate-700">Battery/Voltage</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDevices.map((device, index) => {
                    // Use actual API field names
                    const deviceId = device.imei || `device-${index}`;
                    const deviceName = device.vehicleNumber || device.imei || 'Unnamed Vehicle';
                    
                    // Determine status from API fields
                    let deviceStatus = 'unknown';
                    if (!device.liv) {
                      deviceStatus = 'offline';
                    } else if (device.mvg) {
                      deviceStatus = 'moving';
                    } else if (device.ign) {
                      deviceStatus = 'idle';
                    } else {
                      deviceStatus = 'stopped';
                    }
                    
                    const deviceType = device.deviceType || 'EV';
                    const lastUpdate = device.time;
                    
                    // Convert voltage to battery percentage
                    let batteryLevel = null;
                    if (device.voltage !== undefined && device.voltage !== null && device.voltage >= 12) {
                      batteryLevel = Math.min(100, Math.round(((device.voltage - 12) / 3) * 100));
                    }
                    
                    return (
                      <tr key={deviceId} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{deviceId}</div>
                          <div className="text-xs text-slate-500">IMEI: {device.imei}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800">{deviceName}</div>
                          {device.vehicleNumber && (
                            <div className="text-xs text-slate-500">ID: {device.vehicleNumber}</div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm border ${
                            deviceStatus === 'moving' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            deviceStatus === 'idle' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            deviceStatus === 'stopped' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            deviceStatus === 'offline' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {deviceStatus.toUpperCase()}
                          </span>
                          <div className="mt-1 text-xs text-slate-500">
                            {device.liv ? '🟢 Live' : '🔴 Offline'} • 
                            {device.mvg ? ' 🚛 Moving' : ''} 
                            {device.ign ? ' 🔥 Ignition ON' : ' ❄️ Ignition OFF'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            ⚡ {deviceType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-medium text-slate-700">
                            {lastUpdate ? new Date(lastUpdate).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'No timestamp'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {batteryLevel !== null ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <div className="w-20 bg-gray-200 rounded-full h-3 shadow-inner">
                                  <div 
                                    className={`h-3 rounded-full transition-all duration-300 ${
                                      batteryLevel > 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                      batteryLevel > 30 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                                      'bg-gradient-to-r from-red-400 to-red-500'
                                    }`}
                                    style={{ width: `${batteryLevel}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-slate-700">{batteryLevel}%</span>
                              </div>
                              <div className="text-xs text-slate-500">
                                ⚡ {device.voltage}V | 🔋 Battery Level
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700">
                                  {device.voltage ? `${device.voltage}V` : 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                ⚡ Raw Voltage
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Pagination */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>Showing {currentDevices.length} of {analytics.totalDevices} vehicles</span>
                <span className="text-slate-400">•</span>
                <span>Filter: {filterOptions.find(f => f.value === selectedFilter)?.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-lg text-sm font-bold">
                  Page {currentPage + 1}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentDevices.length < pageSize}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View All Devices Link */}
        {analytics.totalDevices > 0 && (
          <div className="text-center py-8">
            <button
              onClick={() => setSelectedFilter('all')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              <span>View All Devices</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevicesDashboard; 