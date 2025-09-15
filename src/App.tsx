import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DataUpload } from './components/DataUpload';
import { TrendAnalysis } from './components/TrendAnalysis';
import { RegressionAnalysis } from './components/RegressionAnalysis';
import { FeatureEngineering } from './components/FeatureEngineering';
import { HybridModels } from './components/HybridModels';
import { Forecasting } from './components/Forecasting';
import { ModelComparison } from './components/ModelComparison';
import { ConceptsSidebar } from './components/ConceptsSidebar';

export interface TimeSeriesData {
  date: string;
  value: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [showConceptsSidebar, setShowConceptsSidebar] = useState(false);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'upload':
        return <DataUpload onDataLoad={setData} />;
      case 'trend':
        return <TrendAnalysis data={data} />;
      case 'regression':
        return <RegressionAnalysis data={data} />;
      case 'features':
        return <FeatureEngineering data={data} />;
      case 'hybrid':
        return <HybridModels data={data} />;
      case 'forecasting':
        return <Forecasting data={data} />;
      case 'comparison':
        return <ModelComparison data={data} />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        dataCount={data.length}
        onToggleConceptsSidebar={() => setShowConceptsSidebar(!showConceptsSidebar)}
      />
      
      <div className="flex-1 flex">
        <main className={`flex-1 transition-all duration-300 ${showConceptsSidebar ? 'mr-80' : ''}`}>
          {renderActiveComponent()}
        </main>
        
        <ConceptsSidebar 
          isOpen={showConceptsSidebar}
          onClose={() => setShowConceptsSidebar(false)}
          currentTab={activeTab}
        />
      </div>
    </div>
  );
}

export default App;