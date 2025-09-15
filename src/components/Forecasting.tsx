import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { Target, Activity, BarChart3, TrendingUp, Info } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface ForecastingProps {
  data: TimeSeriesData[];
}

export const Forecasting: React.FC<ForecastingProps> = ({ data }) => {
  const [selectedModel, setSelectedModel] = useState<'arima' | 'prophet' | 'rf' | 'xgboost'>('arima');
  const [forecastHorizon, setForecastHorizon] = useState(30);

  const forecasts = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const n = values.length;
    
    // Generate future dates
    const lastDate = new Date(data[n - 1].date);
    const futureDates = Array.from({ length: forecastHorizon }, (_, i) => {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + i + 1);
      return date.toISOString().split('T')[0];
    });

    // ARIMA-like forecast (simple autoregressive)
    const arimaForecast = [];
    let lastValue = values[n - 1];
    const trend = (values[n - 1] - values[Math.max(0, n - 30)]) / 30;
    
    for (let i = 0; i < forecastHorizon; i++) {
      lastValue = lastValue + trend + (Math.random() - 0.5) * 10;
      arimaForecast.push(lastValue);
    }

    // Prophet-like forecast (trend + seasonality)
    const prophetForecast = [];
    const baseTrend = values[n - 1];
    
    for (let i = 0; i < forecastHorizon; i++) {
      const trendComponent = baseTrend + trend * i;
      const seasonalComponent = 20 * Math.sin((2 * Math.PI * (n + i)) / 52);
      prophetForecast.push(trendComponent + seasonalComponent);
    }

    // Random Forest-like forecast
    const rfForecast = [];
    const windowSize = Math.min(14, n);
    const recentValues = values.slice(-windowSize);
    const avgRecent = recentValues.reduce((sum, val) => sum + val, 0) / windowSize;
    
    for (let i = 0; i < forecastHorizon; i++) {
      const forecast = avgRecent + trend * i + (Math.random() - 0.5) * 15;
      rfForecast.push(forecast);
    }

    // XGBoost-like forecast
    const xgboostForecast = [];
    const features = values.slice(-7); // Last week as features
    let currentForecast = values[n - 1];
    
    for (let i = 0; i < forecastHorizon; i++) {
      currentForecast = currentForecast + trend + (Math.random() - 0.5) * 8;
      xgboostForecast.push(currentForecast);
    }

    // Combine historical and forecast data
    const createForecastSeries = (forecastValues: number[]) => [
      ...data,
      ...forecastValues.map((val, i) => ({ date: futureDates[i], value: val }))
    ];

    return {
      historical: data,
      arima: createForecastSeries(arimaForecast),
      prophet: createForecastSeries(prophetForecast),
      rf: createForecastSeries(rfForecast),
      xgboost: createForecastSeries(xgboostForecast),
      forecastStart: data.length
    };
  }, [data, forecastHorizon]);

  const getCurrentForecast = () => {
    if (!forecasts) return [];
    return forecasts[selectedModel] || [];
  };

  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Forecasting Models</h1>
          <p className="text-gray-600">Generate predictions using various ML and statistical models</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Target size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload your time series data to generate forecasts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Forecasting Models</h1>
        <p className="text-gray-600">Generate predictions using various ML and statistical models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">ARIMA</h3>
          </div>
          <p className="text-sm text-gray-600">Autoregressive Integrated Moving Average</p>
          <button
            onClick={() => setSelectedModel('arima')}
            className={`w-full mt-3 py-2 px-3 text-sm rounded-lg transition-colors ${
              selectedModel === 'arima'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Select
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Prophet</h3>
          </div>
          <p className="text-sm text-gray-600">Facebook's forecasting procedure</p>
          <button
            onClick={() => setSelectedModel('prophet')}
            className={`w-full mt-3 py-2 px-3 text-sm rounded-lg transition-colors ${
              selectedModel === 'prophet'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Select
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Random Forest</h3>
          </div>
          <p className="text-sm text-gray-600">Ensemble learning method</p>
          <button
            onClick={() => setSelectedModel('rf')}
            className={`w-full mt-3 py-2 px-3 text-sm rounded-lg transition-colors ${
              selectedModel === 'rf'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Select
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">XGBoost</h3>
          </div>
          <p className="text-sm text-gray-600">Gradient boosting framework</p>
          <button
            onClick={() => setSelectedModel('xgboost')}
            className={`w-full mt-3 py-2 px-3 text-sm rounded-lg transition-colors ${
              selectedModel === 'xgboost'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Select
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedModel.toUpperCase()} Forecast
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Horizon:</label>
                  <select
                    value={forecastHorizon}
                    onChange={(e) => setForecastHorizon(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="h-96">
              <TimeSeriesChart data={getCurrentForecast()} />
            </div>
            
            {forecasts && (
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Historical Data ({forecasts.historical.length} points)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Forecast ({forecastHorizon} points)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Model Info</h3>
            </div>
            <div className="space-y-3 text-sm">
              {selectedModel === 'arima' && (
                <div>
                  <strong className="text-blue-700">ARIMA:</strong>
                  <p className="text-gray-600 mt-1">Uses past values and errors to predict future values. Good for stationary data.</p>
                </div>
              )}
              {selectedModel === 'prophet' && (
                <div>
                  <strong className="text-green-700">Prophet:</strong>
                  <p className="text-gray-600 mt-1">Handles seasonality and holidays well. Robust to missing data and outliers.</p>
                </div>
              )}
              {selectedModel === 'rf' && (
                <div>
                  <strong className="text-orange-700">Random Forest:</strong>
                  <p className="text-gray-600 mt-1">Ensemble of decision trees. Good for capturing non-linear relationships.</p>
                </div>
              )}
              {selectedModel === 'xgboost' && (
                <div>
                  <strong className="text-purple-700">XGBoost:</strong>
                  <p className="text-gray-600 mt-1">Gradient boosting with high performance. Excellent for structured data.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Forecast Quality</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Confidence</span>
                <div className="flex items-center gap-2">
                  <div className={`w-16 h-2 rounded-full ${
                    selectedModel === 'prophet' ? 'bg-green-500' :
                    selectedModel === 'arima' ? 'bg-blue-500' :
                    selectedModel === 'xgboost' ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {selectedModel === 'prophet' ? 'High' :
                     selectedModel === 'arima' ? 'Medium' :
                     selectedModel === 'xgboost' ? 'High' : 'Medium'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Speed</span>
                <div className="flex items-center gap-2">
                  <div className={`w-16 h-2 rounded-full ${
                    selectedModel === 'arima' ? 'bg-green-500' :
                    selectedModel === 'rf' ? 'bg-orange-500' :
                    selectedModel === 'xgboost' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {selectedModel === 'arima' ? 'Fast' :
                     selectedModel === 'rf' ? 'Medium' :
                     selectedModel === 'xgboost' ? 'Fast' : 'Slow'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Best Use Cases</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {selectedModel === 'arima' && (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Stationary time series</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Short to medium-term forecasts</span>
                  </div>
                </>
              )}
              {selectedModel === 'prophet' && (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Strong seasonal patterns</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Holiday effects</span>
                  </div>
                </>
              )}
              {selectedModel === 'rf' && (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Non-linear relationships</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Multiple features</span>
                  </div>
                </>
              )}
              {selectedModel === 'xgboost' && (
                <>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>High-dimensional data</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Competition-grade accuracy</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};