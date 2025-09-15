import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { Settings, Activity, BarChart3, Info } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface FeatureEngineeringProps {
  data: TimeSeriesData[];
}

export const FeatureEngineering: React.FC<FeatureEngineeringProps> = ({ data }) => {
  const [selectedFeature, setSelectedFeature] = useState<'lag' | 'rolling' | 'diff'>('lag');
  const [lagPeriod, setLagPeriod] = useState(7);
  const [windowSize, setWindowSize] = useState(7);

  const features = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const n = values.length;

    // Lag features
    const lag1 = [null, ...values.slice(0, n - 1)];
    const lagN = [...Array(lagPeriod).fill(null), ...values.slice(0, n - lagPeriod)];

    // Rolling statistics
    const rollingMean = values.map((_, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const window = values.slice(start, index + 1);
      return window.reduce((sum, val) => sum + val, 0) / window.length;
    });

    const rollingStd = values.map((_, index) => {
      const start = Math.max(0, index - windowSize + 1);
      const window = values.slice(start, index + 1);
      const mean = window.reduce((sum, val) => sum + val, 0) / window.length;
      const variance = window.reduce((sum, val) => sum + (val - mean) ** 2, 0) / window.length;
      return Math.sqrt(variance);
    });

    // Differencing
    const diff1 = [null, ...values.slice(1).map((val, i) => val - values[i])];
    const diff2 = [null, null, ...values.slice(2).map((val, i) => val - values[i + 1])];

    return {
      lag1: lag1.map((val, i) => ({ date: data[i].date, value: val || 0 })),
      lagN: lagN.map((val, i) => ({ date: data[i].date, value: val || 0 })),
      rollingMean: rollingMean.map((val, i) => ({ date: data[i].date, value: val })),
      rollingStd: rollingStd.map((val, i) => ({ date: data[i].date, value: val })),
      diff1: diff1.map((val, i) => ({ date: data[i].date, value: val || 0 })),
      diff2: diff2.map((val, i) => ({ date: data[i].date, value: val || 0 }))
    };
  }, [data, lagPeriod, windowSize]);

  const getFeatureData = () => {
    if (!features) return [];
    
    switch (selectedFeature) {
      case 'lag':
        return features.lagN;
      case 'rolling':
        return features.rollingMean;
      case 'diff':
        return features.diff1;
      default:
        return [];
    }
  };

  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Feature Engineering</h1>
          <p className="text-gray-600">Create lag features, rolling statistics, and differences</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Settings size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload your time series data to perform feature engineering</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Feature Engineering</h1>
        <p className="text-gray-600">Create lag features, rolling statistics, and differences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Original vs Engineered Features</h2>
              <div className="flex gap-2">
                {[
                  { key: 'lag', label: 'Lag Features' },
                  { key: 'rolling', label: 'Rolling Stats' },
                  { key: 'diff', label: 'Differencing' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedFeature(option.key as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedFeature === option.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-96 relative">
              <TimeSeriesChart data={data} />
              <div className="absolute inset-0 pointer-events-none opacity-75">
                <TimeSeriesChart data={getFeatureData()} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Lag Features</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lag Period
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={lagPeriod}
                    onChange={(e) => setLagPeriod(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{lagPeriod} periods</div>
                </div>
                <p className="text-sm text-gray-600">
                  Use past values as predictive features
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="text-green-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Rolling Stats</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Window Size
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={windowSize}
                    onChange={(e) => setWindowSize(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">{windowSize} periods</div>
                </div>
                <p className="text-sm text-gray-600">
                  Moving averages and standard deviations
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="text-purple-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Differencing</h3>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Remove trends and make data stationary
                </p>
                <div className="text-xs text-gray-500">
                  First difference: y(t) - y(t-1)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Feature Guide</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <strong className="text-blue-700">Lag Features:</strong>
                <p className="text-gray-600 mt-1">Use historical values to predict future ones. Essential for autoregressive models.</p>
              </div>
              <div>
                <strong className="text-green-700">Rolling Statistics:</strong>
                <p className="text-gray-600 mt-1">Smooth out short-term fluctuations and capture local trends.</p>
              </div>
              <div>
                <strong className="text-purple-700">Differencing:</strong>
                <p className="text-gray-600 mt-1">Remove trends and seasonality to make data stationary.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Best Practices</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Start with 1-7 day lags for daily data</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use rolling windows of 7, 30, or seasonal periods</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Test stationarity before and after differencing</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Combine multiple features for better models</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Feature Matrix</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div className="grid grid-cols-3 gap-2 font-medium">
                <span>Feature</span>
                <span>Count</span>
                <span>Missing</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span>Lag-{lagPeriod}</span>
                <span>{data.length - lagPeriod}</span>
                <span>{lagPeriod}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span>MA-{windowSize}</span>
                <span>{data.length}</span>
                <span>0</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span>Diff-1</span>
                <span>{data.length - 1}</span>
                <span>1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};