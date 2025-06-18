import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeviceHub, Wifi, WifiOff, Battery, Signal, MapPin } from 'lucide-react';

const DevicesDashboard = () => {
  const devices = [
    {
      id: '359214420463410',
      name: 'Battery Unit Alpha',
      status: 'online',
      battery: 85,
      signal: 4,
      location: 'Building A - Floor 2',
      lastSeen: '2 minutes ago',
      temperature: 32.5,
      voltage: 48.2
    },
    {
      id: '359214420463411',
      name: 'Battery Unit Beta',
      status: 'online',
      battery: 92,
      signal: 3,
      location: 'Building B - Floor 1',
      lastSeen: '5 minutes ago',
      temperature: 28.1,
      voltage: 47.8
    },
    {
      id: '359214420463412',
      name: 'Battery Unit Gamma',
      status: 'offline',
      battery: 67,
      signal: 0,
      location: 'Building C - Basement',
      lastSeen: '2 hours ago',
      temperature: 35.2,
      voltage: 46.5
    },
    {
      id: '359214420463413',
      name: 'Battery Unit Delta',
      status: 'warning',
      battery: 45,
      signal: 2,
      location: 'Building A - Floor 3',
      lastSeen: '1 minute ago',
      temperature: 42.8,
      voltage: 45.1
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignalBars = (signal) => {
    return Array.from({ length: 4 }, (_, i) => (
      <div
        key={i}
        className={`w-1 h-3 rounded-sm ${
          i < signal ? 'bg-green-500' : 'bg-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
              <DeviceHub className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Device Management</h1>
              <p className="text-cyan-100 text-lg">Monitor and manage all connected battery devices</p>
            </div>
          </div>
        </div>
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl"></div>
      </div>

      {/* Device Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wifi className="h-5 w-5" />
              Online Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-green-100 text-sm">75% connectivity</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <WifiOff className="h-5 w-5" />
              Offline Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1</div>
            <p className="text-red-100 text-sm">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Battery className="h-5 w-5" />
              Avg Battery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">72%</div>
            <p className="text-blue-100 text-sm">Good overall health</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Signal className="h-5 w-5" />
              Avg Signal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2.3/4</div>
            <p className="text-purple-100 text-sm">Moderate strength</p>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DeviceHub className="h-5 w-5 text-blue-600" />
            Connected Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <DeviceHub className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{device.name}</h3>
                      <p className="text-sm text-gray-600">ID: {device.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(device.status)}>
                      {device.status.charAt(0).toUpperCase() + device.status.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getSignalBars(device.signal)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Battery Level</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            device.battery > 70 ? 'bg-green-500' :
                            device.battery > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${device.battery}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{device.battery}%</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Temperature</p>
                    <p className="text-lg font-semibold">{device.temperature}°C</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Voltage</p>
                    <p className="text-lg font-semibold">{device.voltage}V</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Last Seen</p>
                    <p className="text-sm font-medium">{device.lastSeen}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{device.location}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevicesDashboard; 