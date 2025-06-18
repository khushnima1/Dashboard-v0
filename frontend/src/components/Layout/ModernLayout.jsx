import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigation } from '@/contexts/NavigationContext';
import ModernSidebar from './ModernSidebar';
import ModernHeader from './ModernHeader';
import MainDashboard from '../Dashboard/MainDashboard';
import DevicesDashboard from '../Dashboard/DevicesDashboard';
import BatteryDashboard from '../BatteryDashboard';
import LocationDashboard from '../LocationDashboard';
import DTCSummaryDashboard from '../DTCSummaryDashboard';

const ModernLayout = ({ className }) => {
  const { currentView } = useNavigation();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MainDashboard />;
      case 'devices':
        return <DevicesDashboard />;
      case 'battery':
        return <BatteryDashboard />;
      case 'location':
        return <LocationDashboard />;
      case 'dtc':
        return <DTCSummaryDashboard />;
      case 'performance':
        return <div className="p-8 text-center text-gray-500">Performance Dashboard - Coming Soon</div>;
      case 'temperature':
        return <div className="p-8 text-center text-gray-500">Temperature Dashboard - Coming Soon</div>;
      case 'voltage':
        return <div className="p-8 text-center text-gray-500">Voltage Dashboard - Coming Soon</div>;
      case 'health':
        return <div className="p-8 text-center text-gray-500">Health Dashboard - Coming Soon</div>;
      case 'data':
        return <div className="p-8 text-center text-gray-500">Data Management - Coming Soon</div>;
      case 'alerts':
        return <div className="p-8 text-center text-gray-500">Alerts Dashboard - Coming Soon</div>;
      case 'settings':
        return <div className="p-8 text-center text-gray-500">Settings - Coming Soon</div>;
      default:
        return <BatteryDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* Sidebar - Now handles its own hover expansion */}
      <ModernSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ModernHeader />
        
        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-white to-slate-50/50",
          className
        )}>
          {currentView === 'dtc' ? (
            // DTC Dashboard has its own styling and doesn't need container wrapper
            renderCurrentView()
          ) : (
            <div className="container mx-auto p-6 space-y-6">
              {renderCurrentView()}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModernLayout; 