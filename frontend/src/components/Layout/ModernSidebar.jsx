import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import { 
  Battery, 
  BarChart3, 
  Settings, 
  Home, 
  Activity, 
  Zap, 
  Thermometer,
  ChevronLeft,
  ChevronRight,
  Menu,
  TrendingUp,
  Database,
  Shield,
  Bell,
  DeviceHub,
  User,
  LogOut,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ModernSidebar = ({ className }) => {
  const { currentView, navigateTo } = useNavigation();
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: Home,
      badge: null,
      description: 'System overview',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'devices',
      label: 'Device Dashboard',
      icon: DeviceHub,
      badge: '4',
      description: 'Device management',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'battery',
      label: 'Battery Analytics',
      icon: Battery,
      badge: 'Live',
      description: 'Real-time monitoring',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'location',
      label: 'Location Tracking',
      icon: MapPin,
      badge: 'GPS',
      description: 'Vehicle location',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'dtc',
      label: 'DTC Summary',
      icon: AlertTriangle,
      badge: '23',
      description: 'Diagnostic codes',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: TrendingUp,
      badge: null,
      description: 'System metrics',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'temperature',
      label: 'Temperature',
      icon: Thermometer,
      badge: '4',
      description: 'Thermal monitoring',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'voltage',
      label: 'Voltage Analysis',
      icon: Zap,
      badge: null,
      description: 'Cell voltages',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'health',
      label: 'System Health',
      icon: Activity,
      badge: 'OK',
      description: 'Health status',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'data',
      label: 'Data Management',
      icon: Database,
      badge: null,
      description: 'Data operations',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badge: '2',
      description: 'Notifications',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
      description: 'Configuration',
      color: 'from-slate-500 to-slate-600'
    }
  ];

  const isExpanded = isHovered;

  return (
    <div 
      className={cn(
        "group relative flex flex-col h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-700/30 transition-all duration-500 ease-out shadow-2xl backdrop-blur-xl",
        isExpanded ? "w-80" : "w-20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Glowing border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
      
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6 border-b border-slate-700/30">
        <div className={cn(
          "flex items-center gap-4 transition-all duration-500 ease-out",
          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        )}>
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/25">
              <Battery className="w-7 h-7 text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-md"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text">
              BatteryMS
            </h1>
            <p className="text-sm text-slate-400 font-medium">Management System</p>
          </div>
        </div>
        
        {/* Collapse indicator - only show when not expanded */}
        {!isExpanded && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-600/30">
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="relative z-10 flex-1 overflow-y-auto py-6 px-3 space-y-2">
        <div className={cn(
          "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3 transition-all duration-500",
          isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        )}>
          Navigation
        </div>
        
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <div
              key={item.id}
              className={cn(
                "relative transition-all duration-300 ease-out",
                isExpanded ? "translate-x-0" : "translate-x-0"
              )}
              style={{ 
                transitionDelay: isExpanded ? `${index * 50}ms` : '0ms' 
              }}
            >
              <button
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group/item relative overflow-hidden",
                  isActive 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-2xl shadow-current/25 scale-105` 
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50 hover:scale-105",
                  !isExpanded && "justify-center"
                )}
              >
                {/* Active glow effect */}
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-20 blur-xl transition-opacity duration-500",
                    item.color
                  )}></div>
                )}
                
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-white rounded-r-full shadow-lg"></div>
                )}
                
                {/* Icon container */}
                <div className="relative flex items-center justify-center">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive 
                      ? "bg-white/20 shadow-lg" 
                      : "group-hover/item:bg-slate-700/50"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-300",
                      isActive ? "text-white" : "text-slate-400 group-hover/item:text-white"
                    )} />
                  </div>
                  
                  {/* Badge */}
                  {item.badge && (
                    <Badge 
                      className={cn(
                        "absolute -top-1 -right-1 px-2 py-0.5 text-xs min-w-0 h-5 border-2 border-slate-900 transition-all duration-300",
                        item.badge === 'Live' && "bg-green-500 text-white animate-pulse shadow-lg shadow-green-500/50",
                        item.badge === 'OK' && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50",
                        !isNaN(item.badge) && "bg-red-500 text-white shadow-lg shadow-red-500/50"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                
                {/* Label and description */}
                <div className={cn(
                  "flex-1 text-left transition-all duration-500 ease-out",
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                )}>
                  <div className="font-semibold text-sm leading-tight">{item.label}</div>
                  <div className={cn(
                    "text-xs leading-tight transition-colors duration-300",
                    isActive ? "text-white/80" : "text-slate-400 group-hover/item:text-slate-300"
                  )}>
                    {item.description}
                  </div>
                </div>

                {/* Hover tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-4 px-4 py-3 bg-slate-800/95 backdrop-blur-xl text-white text-sm rounded-xl shadow-2xl opacity-0 group-hover/item:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap border border-slate-600/50">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs text-slate-300 mt-1">{item.description}</div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-3 h-3 bg-slate-800/95 border-l border-b border-slate-600/50 rotate-45"></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-slate-700/30">
        <div className={cn(
          "transition-all duration-500 ease-out",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-4 border border-slate-600/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">Admin User</div>
                <div className="text-xs text-slate-400">System Administrator</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-xs text-slate-400 font-medium">Online</span>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0 text-slate-400 hover:text-white hover:bg-slate-600/50 rounded-lg transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-8 h-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collapsed footer */}
        {!isExpanded && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-white">A</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSidebar; 