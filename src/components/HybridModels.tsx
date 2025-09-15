import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { Zap, Activity, BarChart3, TrendingUp, Info } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface HybridModelsProps {
  data: TimeSeriesData[];
}

export const HybridModels: React.FC<HybridModelsProps> = ({ data }) => {
  const [selectedModel, setSelectedModel] = useState<'arima-ml' | 'trend-ml' | 'ensemble'>('arima-ml');

  const hybridAnalysis = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const n = values.length;

    // Simple ARIMA component (trend + autoregressive)
    const trend = values.map((_, index) => {
      const x = index;
      // Simple linear trend
      return values[0] + (values[n - 1] - values[0]) * (x / (n - 1));
    });

    // Residuals from trend
    const residuals = values.map((val, i) => val - trend[i]);

    // ML component (simple moving average of residuals)
    const mlComponent = residuals.map((_, index) => {
      const windowSize = Math.min(7, index + 1);
      const start = Math.max(0, index - windowSize + 1);
      const window = residuals.slice(start, index + 1);
      return window.reduce((sum, val) => sum + val, 0) / window.length;
    });

    // Hybrid predictions
    const arimaMlPredictions = trend.map((t, i) => t + mlComponent[i] * 0.7);
    
    // Trend + ML approach
    const trendMlPredictions = values.map((_, index) => {
      const trendComponent = trend[index];
      const seasonalComponent = 10 * Math.sin((2 * Math.PI * index) / 52);
      return trendComponent + seasonalComponent + mlComponent[index] * 0.5;
    });

    // Ensemble approach (average of multiple methods)
    const ensemblePredictions = values.map((_, i) => {
      const simple = values[Math.max(0, i - 1)] || values[0];
      const ma = i >= 6 ? values.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7 : simple;
      const trendPred = trendMlPredictions[i];
      return (simple * 0.3 + ma * 0.3 + trendPred * 0.4);
    });

    // Calculate performance metrics
    const calculateMetrics = (predictions: number[]) => {
      const errors = values.map((actual, i) => actual - predictions[i]);
      const mae = errors.reduce((sum, err) => sum + Math.abs(err), 0) / n;
      const rmse = Math.sqrt(errors.reduce((sum, err) => sum + err * err, 0) / n);
      const mape = errors.reduce((sum, err, i) => sum + Math.abs(err / values[i]), 0) / n * 100;
      
      return { mae: mae.toFixed(2), rmse: rmse.toFixed(2), mape: mape.toFixed(2) };
    };

    return {
      original: data,
      arimaMl: arimaMlPredictions.map((val, i) => ({ date: data[i].date, value: val })),
      trendMl: trendMlPredictions.map((val, i) => ({ date: data[i].date, value: val })),
      ensemble: ensemblePredictions.map((val, i) => ({ date: data[i].date, value: val })),
      metrics: {
        arimaMl: calculateMetrics(arimaMlPredictions),
        trendMl: calculateMetrics(trendMlPredictions),
        ensemble: calculateMetrics(ensemblePredictions)
      }
    };
  }, [data]);

  const getCurrentPredictions = () => {
    if (!hybridAnalysis) return [];
    switch (selectedModel) {
      case 'arima-ml':
        return hybridAnalysis.arimaMl;
      case 'trend-ml':
        return hybridAnalysis.trendMl;
      case 'ensemble':
        return hybridAnalysis.ensemble;
      default:
        return [];
    }
  };

  const getCurrentMetrics = () => {
    if (!hybridAnalysis) return { mae: '0', rmse: '0', mape: '0' };
    return hybridAnalysis.metrics[selectedModel] || { mae: '0', rmse: '0', mape: '0' };
  };

  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hybrid Models</h1>
          <p className="text-gray-600">Combine statistical and machine learning approaches</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Zap size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload your time series data to train hybrid models</p>
        </div>
      </div>
    );
  }

  const currentMetrics = getCurrentMetrics();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Hybrid Models</h1>
        <p className="text-gray-600">Combine statistical and machine learning approaches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">MAE</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentMetrics.mae}</p>
          <p className="text-sm text-gray-600">Mean Absolute Error</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">RMSE</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentMetrics.rmse}</p>
          <p className="text-sm text-gray-600">Root Mean Square Error</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">MAPE</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentMetrics.mape}%</p>
          <p className="text-sm text-gray-600">Mean Absolute Percentage Error</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Hybrid Model Predictions</h2>
              <div className="flex gap-2">
                {[
                  { key: 'arima-ml', label: 'ARIMA + ML' },
                  { key: 'trend-ml', label: 'Trend + ML' },
                  { key: 'ensemble', label: 'Ensemble' }
                ].map((option) => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedModel(option.key as any)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedModel === option.key
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
              <div className="absolute inset-0 pointer-events-none opacity-80">
                <TimeSeriesChart data={getCurrentPredictions()} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Hybrid Approaches</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <strong className="text-blue-700">ARIMA + ML:</strong>
                <p className="text-gray-600 mt-1">Statistical model for trend, ML for residuals</p>
              </div>
              <div>
                <strong className="text-green-700">Trend + ML:</strong>
                <p className="text-gray-600 mt-1">Linear trend with ML-based seasonal adjustment</p>
              </div>
              <div>
                <strong className="text-purple-700">Ensemble:</strong>
                <p className="text-gray-600 mt-1">Weighted combination of multiple methods</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Model Performance</h3>
            {hybridAnalysis && (
              <div className="space-y-3 text-sm">
                {Object.entries(hybridAnalysis.metrics).map(([model, metrics]) => (
                  <div 
                    key={model}
                    className={`p-3 rounded-lg border ${
                      selectedModel === model ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="font-medium capitalize mb-1">
                      {model.replace('-', ' + ').toUpperCase()}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <span>MAE: {metrics.mae}</span>
                      <span>RMSE: {metrics.rmse}</span>
                      <span>MAPE: {metrics.mape}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Advantages</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Combines best of statistical and ML models</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Better handles complex patterns</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>More robust to various data types</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};