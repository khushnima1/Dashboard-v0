import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import VehicleDashboard from './components/DeviceDashboard';
import BatteryDashboard from './components/BatteryDashboard';
import MotorDashboard from './components/MotorDashboard';
import LocationDashboard from './components/LocationDashboard';
import DevicesDashboard from './components/DevicesDashboard';
import ComprehensiveDashboard from './components/ComprehensiveDashboard';
import DTCSummaryDashboard from './components/DTCSummaryDashboard';
import DeviceDataDashboard from './components/DeviceDataDashboard';
import { 
  Smartphone, 
  Battery, 
  Menu, 
  Zap, 
  MapPin, 
  Car, 
  BarChart3,
  Search,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  X,
  AlertTriangle
} from 'lucide-react';

// Inner component that uses router hooks
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on a device data page
  const isDeviceDataPage = location.pathname.startsWith('/device-data/');
  
  const [activeTab, setActiveTab] = useState('comprehensive');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Update active tab based on URL
  useEffect(() => {
    if (!isDeviceDataPage) {
      const path = location.pathname;
      if (path === '/devices') {
        setActiveTab('devices');
      } else if (path === '/battery') {
        setActiveTab('battery');
      } else if (path === '/location') {
        setActiveTab('location');
      } else if (path === '/comprehensive') {
        setActiveTab('comprehensive');
      } else if (path === '/motor') {
        setActiveTab('motor');
      } else if (path === '/dtc') {
        setActiveTab('dtc');
      } else if (path === '/fleet') {
        setActiveTab('fleet');
      } else if (path === '/') {
        // Default route - redirect to comprehensive
        setActiveTab('comprehensive');
        navigate('/comprehensive', { replace: true });
      }
    }
  }, [location.pathname, isDeviceDataPage, navigate]);

  const navigationItems = [
    {
      id: 'comprehensive',
      name: 'Customer Ride Analytics',
      icon: BarChart3,
      shortName: 'Analytics',
      breadcrumb: ['Dashboard', 'Customer Ride Analytics']
    },
    {
      id: 'devices',
      name: 'Vehicle Dashboard',
      icon: Smartphone,
      shortName: 'Vehicles',
      breadcrumb: ['Dashboard', 'Vehicle Management']
    },
    {
      id: 'battery',
      name: 'Battery Analytics',
      icon: Battery,
      shortName: 'Battery',
      breadcrumb: ['Dashboard', 'Battery Analytics']
    },
    {
      id: 'motor',
      name: 'Motor Dashboard',
      icon: Zap,
      shortName: 'Motor',
      breadcrumb: ['Dashboard', 'Motor Performance']
    },
    {
      id: 'location',
      name: 'Location Statistics',
      icon: MapPin,
      shortName: 'Location',
      breadcrumb: ['Dashboard', 'Location Tracking']
    },
    {
      id: 'dtc',
      name: 'DTC Summary',
      icon: AlertTriangle,
      shortName: 'DTC',
      breadcrumb: ['Dashboard', 'DTC Analysis']
    },
    {
      id: 'fleet',
      name: 'Fleet Management',
      icon: Car,
      shortName: 'Fleet',
      breadcrumb: ['Dashboard', 'Fleet Management']
    }
  ];

  const currentItem = navigationItems.find(item => item.id === activeTab);

  // Determine if sidebar should be expanded (hover OR mobile menu open OR manually toggled)
  const isExpanded = isHovered || mobileMenuOpen || (sidebarCollapsed === false && window.innerWidth >= 1024);

  // Handle navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    
    // Navigate to appropriate URL
    const routeMap = {
      'comprehensive': '/comprehensive',
      'devices': '/devices',
      'battery': '/battery',
      'motor': '/motor',
      'location': '/location',
      'dtc': '/dtc',
      'fleet': '/fleet'
    };
    
    if (routeMap[tabId]) {
      navigate(routeMap[tabId]);
    }
  };

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // If we're on a device data page, render just that component
  if (isDeviceDataPage) {
    return <DeviceDataDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-black border-r border-gray-800/50 shadow-2xl z-50 transition-all duration-500 ease-in-out ${
          isExpanded ? 'w-64' : 'w-16'
        } ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
          {isExpanded ? (
            <div className={`flex items-center space-x-3 transition-all duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="w-15 h-15 bg-black rounded-lg flex items-center justify-center shadow-lg p-1">
                <img 
                  src="/Class 12  EV logo _3 for Vehicle and parts.jpg" 
                  alt="EV Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">EV Management</h1>
                <p className="text-xs text-slate-400">Fleet Analytics</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center mx-auto shadow-lg p-1">
              <img 
                src="/Class 12  EV logo _3 for Vehicle and parts.jpg" 
                alt="EV Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          {/* Collapse Toggle - Only show when expanded */}
          {isExpanded && (
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-800/50 transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* Mobile Close - only show on mobile when expanded */}
          {isExpanded && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800/50 transition-colors duration-200"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-300 text-left relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl scale-105'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:scale-105'
                  } ${!isExpanded ? 'justify-center' : 'space-x-3'}`}
                  title={!isExpanded ? item.name : undefined}
                >
                  {/* Active glow effect */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
                  )}
                  
                  {/* Active indicator line when collapsed */}
                  {isActive && !isExpanded && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                  )}
                  
                  {/* Icon container - ALWAYS VISIBLE */}
                  <div className="relative flex items-center justify-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 shadow-lg' 
                        : 'group-hover:bg-gray-700/50'
                    }`}>
                      <Icon className={`w-5 h-5 transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Label - Only show when expanded */}
                  {isExpanded && (
                    <span className={`text-sm transition-all duration-500 ${
                      isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}>
                      {item.name}
                    </span>
                  )}
                  
                  {/* Active indicator dot when expanded */}
                  {isActive && isExpanded && (
                    <div className="w-2 h-2 bg-white rounded-full ml-auto"></div>
                  )}
                </button>

                {/* Hover tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 whitespace-nowrap border border-gray-700/50">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900/95 rotate-45 border-l border-b border-gray-700/50"></div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800/50">
          {isExpanded ? (
            <div className={`transition-all duration-300 ${
              isExpanded ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Admin User</p>
                    <p className="text-xs text-gray-400 truncate">admin@ev-system.com</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
        isExpanded ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        {/* Top Navigation */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>

                {/* Breadcrumbs */}
                <nav className="hidden sm:flex items-center space-x-2 text-sm">
                  <Home className="w-4 h-4 text-gray-400" />
                  {currentItem?.breadcrumb.map((crumb, index) => (
                    <React.Fragment key={index}>
                      <span className="text-gray-400">/</span>
                      <span className={index === currentItem.breadcrumb.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                        {crumb}
                      </span>
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              {/* Center Section - Search */}
              <div className="flex-1 max-w-md mx-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search dashboards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 ${activeTab === 'dtc' ? '' : 'p-4 sm:p-6 lg:p-8'}`}>
          {activeTab === 'dtc' ? (
            // DTC Dashboard has its own styling and doesn't need container wrapper
            <DTCSummaryDashboard />
          ) : (
            <div className="max-w-7xl mx-auto">
              {/* Page Header */}
              {/* <div className="mb-8">
                <div className="flex items-center space-x-4 mb-2">
                  {currentItem && <currentItem.icon className="w-8 h-8 text-blue-600" />}
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      {currentItem?.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Monitor and analyze your EV fleet performance
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Dashboard Content */}
              <div className="transition-all duration-300 ease-in-out">
                {activeTab === 'comprehensive' && <ComprehensiveDashboard />}
                {activeTab === 'devices' && <VehicleDashboard />}
                {activeTab === 'battery' && <BatteryDashboard />}
                {activeTab === 'motor' && <MotorDashboard />}
                {activeTab === 'location' && <LocationDashboard />}
                {activeTab === 'fleet' && <DevicesDashboard />}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Main App component with Router wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 