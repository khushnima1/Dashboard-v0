import React, { useState, useEffect } from 'react';
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
  AlertTriangle, 
  Battery, 
  Calendar, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  Zap, 
  Shield, 
  ThermometerSun,
  Snowflake,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// Enhanced chart configurations
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          weight: '600',
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#374151'
      }
    },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      titleColor: '#F9FAFB',
      bodyColor: '#F9FAFB',
      borderColor: 'rgba(156, 163, 175, 0.2)',
      borderWidth: 1,
      cornerRadius: 12,
      padding: 12,
      displayColors: true,
      titleFont: { size: 13, weight: '600' },
      bodyFont: { size: 12, weight: '500' }
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(156, 163, 175, 0.1)', drawBorder: false },
      ticks: { color: '#6B7280', font: { size: 11, weight: '500' } }
    },
    y: {
      grid: { color: 'rgba(156, 163, 175, 0.1)', drawBorder: false },
      ticks: { color: '#6B7280', font: { size: 11, weight: '500' } }
    }
  }
};

// Color palette for DTC status
const dtcColors = {
  critical: { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' },
  warning: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' },
  normal: { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' },
  info: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' }
};

const DTCSummaryDashboard = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedBattery, setSelectedBattery] = useState('all');
  
  // Mock data for DTC analytics
  const [dtcData, setDtcData] = useState({
    summary: {
      totalDTCs: 23,
      criticalDTCs: 3,
      warningDTCs: 8,
      normalDTCs: 12,
      activeAlerts: 5
    },
    // Mock data for DTC_HDC (High Discharge Current)
    hdcData: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      values: [45, 52, 38, 67, 73, 45, 39],
      threshold: 70,
      unit: 'A'
    },
    // Mock data for DTC_LTD (Low Temperature Discharge)
    ltdData: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      values: [-5, -8, -3, 2, 8, 5, -1],
      threshold: -10,
      unit: '°C'
    },
    // Mock data for DTC_HTC (High Temperature Charge)
    htcData: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      values: [42, 45, 38, 48, 52, 47, 44],
      threshold: 50,
      unit: '°C'
    },
    // Mock data for DTC_HCC (High Charge Current)
    hccData: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
      values: [35, 42, 28, 55, 61, 38, 33],
      threshold: 60,
      unit: 'A'
    },
    // Mock data for DTC events
    cellImbalanceA: [
      { 
        dtcOnTime: '2024-01-15 08:23:15', 
        dtcOffTime: '2024-01-15 08:28:42', 
        timeDuration: '5m 27s', 
        vehicle: 'EV-001', 
        dtcFlagStatus: 'Active',
        severity: 'Normal'
      },
      { 
        dtcOnTime: '2024-01-15 10:45:30', 
        dtcOffTime: '2024-01-15 11:02:18', 
        timeDuration: '16m 48s', 
        vehicle: 'EV-001', 
        dtcFlagStatus: 'Resolved',
        severity: 'Warning'
      },
      { 
        dtcOnTime: '2024-01-15 14:12:08', 
        dtcOffTime: 'Active', 
        timeDuration: '3h 42m', 
        vehicle: 'EV-001', 
        dtcFlagStatus: 'Active',
        severity: 'Critical'
      },
      { 
        dtcOnTime: '2024-01-15 16:33:22', 
        dtcOffTime: '2024-01-15 16:35:10', 
        timeDuration: '1m 48s', 
        vehicle: 'EV-001', 
        dtcFlagStatus: 'Resolved',
        severity: 'Normal'
      },
      { 
        dtcOnTime: '2024-01-15 18:15:45', 
        dtcOffTime: '2024-01-15 18:22:33', 
        timeDuration: '6m 48s', 
        vehicle: 'EV-001', 
        dtcFlagStatus: 'Resolved',
        severity: 'Warning'
      }
    ],
    cellImbalanceB: [
      { 
        dtcOnTime: '2024-01-15 07:15:22', 
        dtcOffTime: '2024-01-15 07:18:45', 
        timeDuration: '3m 23s', 
        vehicle: 'EV-002', 
        dtcFlagStatus: 'Resolved',
        severity: 'Normal'
      },
      { 
        dtcOnTime: '2024-01-15 12:30:15', 
        dtcOffTime: '2024-01-15 12:45:30', 
        timeDuration: '15m 15s', 
        vehicle: 'EV-002', 
        dtcFlagStatus: 'Resolved',
        severity: 'Normal'
      },
      { 
        dtcOnTime: '2024-01-15 15:22:08', 
        dtcOffTime: 'Active', 
        timeDuration: '2h 32m', 
        vehicle: 'EV-002', 
        dtcFlagStatus: 'Active',
        severity: 'Warning'
      },
      { 
        dtcOnTime: '2024-01-15 17:45:12', 
        dtcOffTime: '2024-01-15 17:48:22', 
        timeDuration: '3m 10s', 
        vehicle: 'EV-002', 
        dtcFlagStatus: 'Resolved',
        severity: 'Normal'
      }
    ],
    cellImbalanceC: [
      { 
        dtcOnTime: '2024-01-15 09:12:33', 
        dtcOffTime: 'Active', 
        timeDuration: '8h 42m', 
        vehicle: 'EV-003', 
        dtcFlagStatus: 'Active',
        severity: 'Critical'
      },
      { 
        dtcOnTime: '2024-01-15 11:25:45', 
        dtcOffTime: '2024-01-15 11:32:18', 
        timeDuration: '6m 33s', 
        vehicle: 'EV-003', 
        dtcFlagStatus: 'Resolved',
        severity: 'Normal'
      },
      { 
        dtcOnTime: '2024-01-15 13:45:22', 
        dtcOffTime: '2024-01-15 14:15:45', 
        timeDuration: '30m 23s', 
        vehicle: 'EV-003', 
        dtcFlagStatus: 'Resolved',
        severity: 'Warning'
      },
      { 
        dtcOnTime: '2024-01-15 16:18:30', 
        dtcOffTime: '2024-01-15 16:22:15', 
        timeDuration: '3m 45s', 
        vehicle: 'EV-003', 
        dtcFlagStatus: 'Resolved',
        severity: 'Normal'
      },
      { 
        dtcOnTime: '2024-01-15 18:30:12', 
        dtcOffTime: 'Active', 
        timeDuration: '24m', 
        vehicle: 'EV-003', 
        dtcFlagStatus: 'Active',
        severity: 'Warning'
      }
    ]
  });

  // Mock function to simulate data refresh
  const refreshDTCData = async () => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real implementation, this would fetch from backend
    console.log('Refreshing DTC data...');
    setLoading(false);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'normal': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'critical': return <XCircle className="w-3 h-3" />;
      case 'warning': return <AlertCircle className="w-3 h-3" />;
      case 'normal': return <CheckCircle className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  // Get DTC flag status color
  const getDTCFlagColor = (flagStatus) => {
    switch (flagStatus.toLowerCase()) {
      case 'active': return 'bg-red-100 text-red-800 border-red-300';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get DTC flag status icon
  const getDTCFlagIcon = (flagStatus) => {
    switch (flagStatus.toLowerCase()) {
      case 'active': return <AlertTriangle className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Activity className="w-3 h-3" />;
      default: return <XCircle className="w-3 h-3" />;
    }
  };

  useEffect(() => {
    // Initial data load
    refreshDTCData();
  }, [selectedTimeRange, selectedBattery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/20 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
        <div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8 mb-6 lg:mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
                    DTC Summary Dashboard
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base lg:text-xl font-medium mt-2">
                    Diagnostic Trouble Code Analysis & Battery Health Monitoring
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
              <Badge variant="secondary" className="flex items-center gap-2 bg-red-900 text-red-100 border-red-950">
  <AlertTriangle className="w-3 h-3 animate-pulse text-red-100" />
  DTC Monitoring
</Badge>

<Badge variant="secondary" className="flex items-center gap-2 bg-orange-900 text-orange-100 border-orange-950">
  <Battery className="w-3 h-3 text-orange-100" />
  Battery Health
</Badge>

<Badge variant="secondary" className="flex items-center gap-2 bg-blue-900 text-blue-100 border-blue-950">
  <Shield className="w-3 h-3 text-blue-100" />
  Safety Analysis
</Badge>

              </div>
            </div>
            
            <Card className="flex-shrink-0 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 text-white border-0 shadow-2xl">
              <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">{dtcData.summary.totalDTCs}</div>
                <div className="text-sm sm:text-base lg:text-lg font-semibold opacity-90">Total DTCs</div>
                <div className="text-xs sm:text-sm opacity-75 mt-1">Active Codes</div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/30 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Battery className="w-4 h-4" />
                    Battery Pack
                  </label>
                  <Select value={selectedBattery} onValueChange={setSelectedBattery}>
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200/50 focus:ring-blue-300/50">
                      <SelectValue placeholder="Select battery..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batteries</SelectItem>
                      <SelectItem value="A">Battery A</SelectItem>
                      <SelectItem value="B">Battery B</SelectItem>
                      <SelectItem value="C">Battery C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Time Range
                  </label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="bg-white/80 backdrop-blur-sm border-purple-200/50 focus:ring-purple-300/50">
                      <SelectValue placeholder="Select range..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 opacity-0">Actions</label>
                  <Button
                    onClick={refreshDTCData}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 hover:from-red-700 hover:via-orange-700 hover:to-yellow-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Refreshing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Refresh Data
                      </div>
                    )}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 opacity-0">Export</label>
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    Export Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="relative px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
        {/* DTC Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total DTCs</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{dtcData.summary.totalDTCs}</div>
              <p className="text-xs text-slate-500 mt-1">All diagnostic codes</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Critical DTCs</CardTitle>
              <XCircle className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{dtcData.summary.criticalDTCs}</div>
              <p className="text-xs text-slate-500 mt-1">Requires immediate attention</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Warning DTCs</CardTitle>
              <AlertCircle className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">{dtcData.summary.warningDTCs}</div>
              <p className="text-xs text-slate-500 mt-1">Monitor closely</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Normal DTCs</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{dtcData.summary.normalDTCs}</div>
              <p className="text-xs text-slate-500 mt-1">Within normal range</p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Alerts</CardTitle>
              <Activity className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{dtcData.summary.activeAlerts}</div>
              <p className="text-xs text-slate-500 mt-1">Currently active</p>
            </CardContent>
          </Card>
        </div>

        {/* DTC Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* DTC_HDC Chart */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                DTC_HDC - High Discharge Current
              </CardTitle>
              <CardDescription>
                Monitoring high discharge current events over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <Bar
                  data={{
                    labels: dtcData.hdcData.labels,
                    datasets: [
                      {
                        label: `Current (${dtcData.hdcData.unit})`,
                        data: dtcData.hdcData.values,
                        backgroundColor: dtcData.hdcData.values.map(val => 
                          val > dtcData.hdcData.threshold ? dtcColors.critical.bg : dtcColors.normal.bg
                        ),
                        borderColor: dtcData.hdcData.values.map(val => 
                          val > dtcData.hdcData.threshold ? dtcColors.critical.border : dtcColors.normal.border
                        ),
                        borderWidth: 2,
                        borderRadius: 8
                      }
                    ]
                  }}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;
                            const threshold = dtcData.hdcData.threshold;
                            const status = value > threshold ? '⚠️ Above Threshold' : '✅ Normal';
                            return [`Current: ${value}${dtcData.hdcData.unit}`, status];
                          }
                        }
                      }
                    },
                    scales: {
                      ...chartDefaults.scales,
                      y: {
                        ...chartDefaults.scales.y,
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: `Current (${dtcData.hdcData.unit})`,
                          font: { weight: '600' }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Threshold: {dtcData.hdcData.threshold}{dtcData.hdcData.unit} | Current Max: {Math.max(...dtcData.hdcData.values)}{dtcData.hdcData.unit}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* DTC_LTD Chart */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Snowflake className="w-5 h-5 text-white" />
                </div>
                DTC_LTD - Low Temperature Discharge
              </CardTitle>
              <CardDescription>
                Temperature monitoring during discharge operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <Line
                  data={{
                    labels: dtcData.ltdData.labels,
                    datasets: [
                      {
                        label: `Temperature (${dtcData.ltdData.unit})`,
                        data: dtcData.ltdData.values,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 3,
                        pointBackgroundColor: dtcData.ltdData.values.map(val => 
                          val < dtcData.ltdData.threshold ? '#EF4444' : '#10B981'
                        )
                      }
                    ]
                  }}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;
                            const threshold = dtcData.ltdData.threshold;
                            const status = value < threshold ? '❄️ Below Threshold' : '✅ Normal';
                            return [`Temperature: ${value}${dtcData.ltdData.unit}`, status];
                          }
                        }
                      }
                    },
                    scales: {
                      ...chartDefaults.scales,
                      y: {
                        ...chartDefaults.scales.y,
                        title: {
                          display: true,
                          text: `Temperature (${dtcData.ltdData.unit})`,
                          font: { weight: '600' }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <Snowflake className="w-4 h-4 inline mr-2" />
                  Threshold: {dtcData.ltdData.threshold}{dtcData.ltdData.unit} | Current Min: {Math.min(...dtcData.ltdData.values)}{dtcData.ltdData.unit}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* DTC_HTC Chart */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <ThermometerSun className="w-5 h-5 text-white" />
                </div>
                DTC_HTC - High Temperature Charge
              </CardTitle>
              <CardDescription>
                Temperature monitoring during charging operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <Line
                  data={{
                    labels: dtcData.htcData.labels,
                    datasets: [
                      {
                        label: `Temperature (${dtcData.htcData.unit})`,
                        data: dtcData.htcData.values,
                        borderColor: 'rgba(245, 158, 11, 1)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 3,
                        pointBackgroundColor: dtcData.htcData.values.map(val => 
                          val > dtcData.htcData.threshold ? '#EF4444' : '#10B981'
                        )
                      }
                    ]
                  }}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;
                            const threshold = dtcData.htcData.threshold;
                            const status = value > threshold ? '🌡️ Above Threshold' : '✅ Normal';
                            return [`Temperature: ${value}${dtcData.htcData.unit}`, status];
                          }
                        }
                      }
                    },
                    scales: {
                      ...chartDefaults.scales,
                      y: {
                        ...chartDefaults.scales.y,
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: `Temperature (${dtcData.htcData.unit})`,
                          font: { weight: '600' }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  <ThermometerSun className="w-4 h-4 inline mr-2" />
                  Threshold: {dtcData.htcData.threshold}{dtcData.htcData.unit} | Current Max: {Math.max(...dtcData.htcData.values)}{dtcData.htcData.unit}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* DTC_HCC Chart */}
          <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                DTC_HCC - High Charge Current
              </CardTitle>
              <CardDescription>
                Monitoring high charge current events over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 sm:h-80">
                <Line
                  data={{
                    labels: dtcData.hccData.labels,
                    datasets: [
                      {
                        label: `Current (${dtcData.hccData.unit})`,
                        data: dtcData.hccData.values,
                        borderColor: 'rgba(139, 92, 246, 1)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        borderWidth: 3,
                        pointBackgroundColor: dtcData.hccData.values.map(val => 
                          val > dtcData.hccData.threshold ? '#EF4444' : '#10B981'
                        )
                      }
                    ]
                  }}
                  options={{
                    ...chartDefaults,
                    plugins: {
                      ...chartDefaults.plugins,
                      tooltip: {
                        ...chartDefaults.plugins.tooltip,
                        callbacks: {
                          label: function(context) {
                            const value = context.parsed.y;
                            const threshold = dtcData.hccData.threshold;
                            const status = value > threshold ? '⚡ Above Threshold' : '✅ Normal';
                            return [`Current: ${value}${dtcData.hccData.unit}`, status];
                          }
                        }
                      }
                    },
                    scales: {
                      ...chartDefaults.scales,
                      y: {
                        ...chartDefaults.scales.y,
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: `Current (${dtcData.hccData.unit})`,
                          font: { weight: '600' }
                        }
                      }
                    }
                  }}
                />
              </div>
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-700">
                  <Zap className="w-4 h-4 inline mr-2" />
                  Threshold: {dtcData.hccData.threshold}{dtcData.hccData.unit} | Current Max: {Math.max(...dtcData.hccData.values)}{dtcData.hccData.unit}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cell Imbalance Tables */}
        <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl">
                <Battery className="w-5 h-5 text-white" />
              </div>
              DTC Event Tracking & Analysis
            </CardTitle>
            <CardDescription>
              Real-time DTC event monitoring with detailed timing and status information for each vehicle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="battery-a" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="battery-a" className="flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Vehicle EV-001
                </TabsTrigger>
                <TabsTrigger value="battery-b" className="flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Vehicle EV-002
                </TabsTrigger>
                <TabsTrigger value="battery-c" className="flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Vehicle EV-003
                </TabsTrigger>
              </TabsList>

              <TabsContent value="battery-a" className="space-y-4">
                <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                        <TableHead className="font-semibold">DTC On Time</TableHead>
                        <TableHead className="font-semibold">DTC Off Time</TableHead>
                        <TableHead className="font-semibold">Time Duration</TableHead>
                        <TableHead className="font-semibold">Vehicle</TableHead>
                        <TableHead className="font-semibold">DTC Flag Status</TableHead>
                        <TableHead className="font-semibold">Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dtcData.cellImbalanceA.map((dtc, index) => (
                        <TableRow key={index} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <TableCell className="font-mono text-sm">{dtc.dtcOnTime}</TableCell>
                          <TableCell className="font-mono text-sm">{dtc.dtcOffTime}</TableCell>
                          <TableCell className="font-medium">{dtc.timeDuration}</TableCell>
                          <TableCell className="font-semibold text-blue-700">{dtc.vehicle}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getDTCFlagColor(dtc.dtcFlagStatus)}>
                              {getDTCFlagIcon(dtc.dtcFlagStatus)}
                              {dtc.dtcFlagStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(dtc.severity)}>
                              {getStatusIcon(dtc.severity)}
                              {dtc.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="battery-b" className="space-y-4">
                <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                        <TableHead className="font-semibold">DTC On Time</TableHead>
                        <TableHead className="font-semibold">DTC Off Time</TableHead>
                        <TableHead className="font-semibold">Time Duration</TableHead>
                        <TableHead className="font-semibold">Vehicle</TableHead>
                        <TableHead className="font-semibold">DTC Flag Status</TableHead>
                        <TableHead className="font-semibold">Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dtcData.cellImbalanceB.map((dtc, index) => (
                        <TableRow key={index} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <TableCell className="font-mono text-sm">{dtc.dtcOnTime}</TableCell>
                          <TableCell className="font-mono text-sm">{dtc.dtcOffTime}</TableCell>
                          <TableCell className="font-medium">{dtc.timeDuration}</TableCell>
                          <TableCell className="font-semibold text-blue-700">{dtc.vehicle}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getDTCFlagColor(dtc.dtcFlagStatus)}>
                              {getDTCFlagIcon(dtc.dtcFlagStatus)}
                              {dtc.dtcFlagStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(dtc.severity)}>
                              {getStatusIcon(dtc.severity)}
                              {dtc.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="battery-c" className="space-y-4">
                <div className="rounded-lg border border-slate-200/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-50 to-blue-50">
                        <TableHead className="font-semibold">DTC On Time</TableHead>
                        <TableHead className="font-semibold">DTC Off Time</TableHead>
                        <TableHead className="font-semibold">Time Duration</TableHead>
                        <TableHead className="font-semibold">Vehicle</TableHead>
                        <TableHead className="font-semibold">DTC Flag Status</TableHead>
                        <TableHead className="font-semibold">Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dtcData.cellImbalanceC.map((dtc, index) => (
                        <TableRow key={index} className="hover:bg-slate-50/50 transition-colors duration-200">
                          <TableCell className="font-mono text-sm">{dtc.dtcOnTime}</TableCell>
                          <TableCell className="font-mono text-sm">{dtc.dtcOffTime}</TableCell>
                          <TableCell className="font-medium">{dtc.timeDuration}</TableCell>
                          <TableCell className="font-semibold text-blue-700">{dtc.vehicle}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getDTCFlagColor(dtc.dtcFlagStatus)}>
                              {getDTCFlagIcon(dtc.dtcFlagStatus)}
                              {dtc.dtcFlagStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getStatusColor(dtc.severity)}>
                              {getStatusIcon(dtc.severity)}
                              {dtc.severity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-800">
                    {[...dtcData.cellImbalanceA, ...dtcData.cellImbalanceB, ...dtcData.cellImbalanceC]
                      .filter(dtc => dtc.severity === 'Normal').length}
                  </div>
                  <div className="text-sm font-medium text-blue-600">Normal Severity</div>
                  <div className="text-xs text-blue-500 mt-1">Low priority events</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-800">
                    {[...dtcData.cellImbalanceA, ...dtcData.cellImbalanceB, ...dtcData.cellImbalanceC]
                      .filter(dtc => dtc.severity === 'Warning').length}
                  </div>
                  <div className="text-sm font-medium text-yellow-600">Warning Severity</div>
                  <div className="text-xs text-yellow-500 mt-1">Medium priority events</div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-800">
                    {[...dtcData.cellImbalanceA, ...dtcData.cellImbalanceB, ...dtcData.cellImbalanceC]
                      .filter(dtc => dtc.severity === 'Critical').length}
                  </div>
                  <div className="text-sm font-medium text-red-600">Critical Severity</div>
                  <div className="text-xs text-red-500 mt-1">High priority events</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DTCSummaryDashboard; 