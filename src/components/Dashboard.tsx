import React from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { StatsCard } from './StatsCard';
import { TrendingUp, TrendingDown, Activity, Calendar } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface DashboardProps {
  data: TimeSeriesData[];
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const calculateStats = () => {
    if (data.length === 0) {
      return {
        mean: 0,
        trend: 0,
        volatility: 0,
        dataPoints: 0
      };
    }

    const values = data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Simple trend calculation
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstMean = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondMean = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const trend = ((secondMean - firstMean) / firstMean) * 100;
    
    // Volatility (standard deviation)
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const volatility = Math.sqrt(variance);

    return {
      mean: mean.toFixed(2),
      trend: trend.toFixed(2),
      volatility: volatility.toFixed(2),
      dataPoints: data.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Time Series Dashboard</h1>
        <p className="text-gray-600">Comprehensive overview of your time series data and analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Average Value"
          value={stats.mean}
          icon={Activity}
          color="blue"
        />
        <StatsCard
          title="Trend"
          value={`${stats.trend}%`}
          icon={parseFloat(stats.trend) >= 0 ? TrendingUp : TrendingDown}
          color={parseFloat(stats.trend) >= 0 ? "green" : "red"}
        />
        <StatsCard
          title="Volatility"
          value={stats.volatility}
          icon={Activity}
          color="orange"
        />
        <StatsCard
          title="Data Points"
          value={stats.dataPoints.toString()}
          icon={Calendar}
          color="purple"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Time Series Overview</h2>
          {data.length === 0 && (
            <span className="text-sm text-gray-500">Upload data to see visualization</span>
          )}
        </div>
        
        <div className="h-96">
          <TimeSeriesChart data={data} />
        </div>
      </div>

      {data.length > 0 && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Analysis</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Date Range:</span>
                <span className="font-medium">
                  {data[0]?.date} to {data[data.length - 1]?.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Min Value:</span>
                <span className="font-medium">
                  {Math.min(...data.map(d => d.value)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Value:</span>
                <span className="font-medium">
                  {Math.max(...data.map(d => d.value)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended Actions</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <span>Start with Trend Analysis to understand patterns</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span>Apply Feature Engineering for better insights</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Compare multiple forecasting models</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};