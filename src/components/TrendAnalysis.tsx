import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { TrendingUp, Activity, BarChart, Info } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface TrendAnalysisProps {
  data: TimeSeriesData[];
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data }) => {
  const [selectedDecomposition, setSelectedDecomposition] = useState<'trend' | 'seasonal' | 'residual'>('trend');

  const analysis = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const n = values.length;
    
    // Simple moving average for trend
    const windowSize = Math.max(7, Math.floor(n / 20));
    const trend = values.map((_, index) => {
      const start = Math.max(0, index - Math.floor(windowSize / 2));
      const end = Math.min(n, index + Math.floor(windowSize / 2) + 1);
      const window = values.slice(start, end);
      return window.reduce((sum, val) => sum + val, 0) / window.length;
    });

    // Detrended data
    const detrended = values.map((val, i) => val - trend[i]);
    
    // Simple seasonal decomposition (assuming weekly pattern)
    const seasonalPeriod = Math.min(52, Math.floor(n / 4)); // Weekly or quarterly
    const seasonal = values.map((_, index) => {
      const seasonalIndex = index % seasonalPeriod;
      const seasonalValues = [];
      for (let i = seasonalIndex; i < n; i += seasonalPeriod) {
        if (detrended[i] !== undefined) {
          seasonalValues.push(detrended[i]);
        }
      }
      return seasonalValues.length > 0 
        ? seasonalValues.reduce((sum, val) => sum + val, 0) / seasonalValues.length
        : 0;
    });

    // Residual
    const residual = values.map((val, i) => val - trend[i] - seasonal[i]);

    // Statistics
    const trendSlope = (trend[n - 1] - trend[0]) / n;
    const seasonalStrength = Math.sqrt(seasonal.reduce((sum, val) => sum + val * val, 0) / n);
    const residualStd = Math.sqrt(residual.reduce((sum, val) => sum + val * val, 0) / n);

    return {
      original: data,
      trend: trend.map((val, i) => ({ date: data[i].date, value: val })),
      seasonal: seasonal.map((val, i) => ({ date: data[i].date, value: val })),
      residual: residual.map((val, i) => ({ date: data[i].date, value: val })),
      stats: {
        trendSlope: trendSlope.toFixed(4),
        seasonalStrength: seasonalStrength.toFixed(2),
        residualStd: residualStd.toFixed(2),
        trendDirection: trendSlope > 0 ? 'Upward' : trendSlope < 0 ? 'Downward' : 'Flat'
      }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Trend & Seasonality Analysis</h1>
          <p className="text-gray-600">Decompose your time series to understand underlying patterns</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <BarChart size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload your time series data to perform trend analysis</p>
        </div>
      </div>
    );
  }

  const currentData = analysis ? {
    trend: analysis.trend,
    seasonal: analysis.seasonal,
    residual: analysis.residual
  }[selectedDecomposition] : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Trend & Seasonality Analysis</h1>
        <p className="text-gray-600">Decompose your time series to understand underlying patterns</p>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Trend Direction</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analysis.stats.trendDirection}</p>
            <p className="text-sm text-gray-600">Slope: {analysis.stats.trendSlope}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Seasonal Strength</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analysis.stats.seasonalStrength}</p>
            <p className="text-sm text-gray-600">Average seasonal variation</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Residual Noise</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analysis.stats.residualStd}</p>
            <p className="text-sm text-gray-600">Standard deviation</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Time Series Decomposition</h2>
              <div className="flex gap-2">
                {['trend', 'seasonal', 'residual'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedDecomposition(type as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedDecomposition === type
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-96">
              <TimeSeriesChart data={currentData} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Decomposition Guide</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-blue-700">Trend:</strong>
                <p className="text-gray-600">Long-term direction of the data</p>
              </div>
              <div>
                <strong className="text-green-700">Seasonal:</strong>
                <p className="text-gray-600">Repeating patterns over time periods</p>
              </div>
              <div>
                <strong className="text-purple-700">Residual:</strong>
                <p className="text-gray-600">Random noise after removing trend and seasonality</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Analysis Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Strong trend indicates predictable long-term changes</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Clear seasonality helps with pattern-based forecasting</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Low residual noise indicates good decomposition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};