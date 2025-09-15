import React from 'react';
import { 
  BarChart3, 
  Upload, 
  TrendingUp, 
  LineChart, 
  Settings, 
  Zap, 
  Target, 
  GitCompare,
  BookOpen,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dataCount: number;
  onToggleConceptsSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  dataCount,
  onToggleConceptsSidebar 
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'upload', label: 'Data Upload', icon: Upload },
    { id: 'trend', label: 'Trend Analysis', icon: TrendingUp },
    { id: 'regression', label: 'Regression', icon: LineChart },
    { id: 'features', label: 'Feature Engineering', icon: Settings },
    { id: 'hybrid', label: 'Hybrid Models', icon: Zap },
    { id: 'forecasting', label: 'Forecasting', icon: Target },
    { id: 'comparison', label: 'Model Comparison', icon: GitCompare },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="text-blue-600" />
          TimeSeries Pro
        </h1>
        <p className="text-sm text-gray-600 mt-1">Data Science Learning Platform</p>
      </div>

      <div className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Database size={16} />
            <span>Data Points: {dataCount.toLocaleString()}</span>
          </div>
        </div>
        
        <button
          onClick={onToggleConceptsSidebar}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <BookOpen size={16} />
          Concepts Guide
        </button>
      </div>
    </div>
  );
};