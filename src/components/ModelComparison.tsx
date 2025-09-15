import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { GitCompare, Target, Activity, BarChart3, Download, Info } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface ModelComparisonProps {
  data: TimeSeriesData[];
}

interface ModelMetrics {
  name: string;
  mae: number;
  rmse: number;
  mape: number;
  predictions: TimeSeriesData[];
  color: string;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ data }) => {
  const [selectedModels, setSelectedModels] = useState(['ARIMA', 'Prophet', 'XGBoost']);

  const modelComparison = useMemo(() => {
    if (data.length === 0) return null;

    const values = data.map(d => d.value);
    const n = values.length;

    // Split data: 80% training, 20% testing
    const trainSize = Math.floor(n * 0.8);
    const trainData = values.slice(0, trainSize);
    const testData = values.slice(trainSize);
    
    const generatePredictions = (modelType: string) => {
      const predictions = [];
      
      switch (modelType) {
        case 'ARIMA': {
          const trend = (trainData[trainData.length - 1] - trainData[0]) / trainData.length;
          let lastValue = trainData[trainData.length - 1];
          
          for (let i = 0; i < testData.length; i++) {
            lastValue = lastValue + trend + (Math.random() - 0.5) * 5;
            predictions.push(lastValue);
          }
          break;
        }
        
        case 'Prophet': {
          const trend = (trainData[trainData.length - 1] - trainData[0]) / trainData.length;
          
          for (let i = 0; i < testData.length; i++) {
            const trendComponent = trainData[trainData.length - 1] + trend * (i + 1);
            const seasonalComponent = 15 * Math.sin((2 * Math.PI * (trainSize + i)) / 52);
            predictions.push(trendComponent + seasonalComponent);
          }
          break;
        }
        
        case 'Random Forest': {
          const windowSize = Math.min(7, trainSize);
          const recentAvg = trainData.slice(-windowSize).reduce((a, b) => a + b, 0) / windowSize;
          
          for (let i = 0; i < testData.length; i++) {
            const noise = (Math.random() - 0.5) * 20;
            predictions.push(recentAvg + noise);
          }
          break;
        }
        
        case 'XGBoost': {
          const trend = (trainData[trainData.length - 1] - trainData[0]) / trainData.length;
          let currentValue = trainData[trainData.length - 1];
          
          for (let i = 0; i < testData.length; i++) {
            currentValue = currentValue + trend * 0.8 + (Math.random() - 0.5) * 10;
            predictions.push(currentValue);
          }
          break;
        }
        
        case 'Linear Regression': {
          const slope = (trainData[trainData.length - 1] - trainData[0]) / trainData.length;
          const intercept = trainData[0];
          
          for (let i = 0; i < testData.length; i++) {
            predictions.push(slope * (trainSize + i) + intercept);
          }
          break;
        }
        
        default:
          return Array(testData.length).fill(trainData[trainData.length - 1]);
      }
      
      return predictions;
    };

    const calculateMetrics = (actual: number[], predicted: number[]) => {
      const errors = actual.map((val, i) => val - predicted[i]);
      const mae = errors.reduce((sum, err) => sum + Math.abs(err), 0) / errors.length;
      const rmse = Math.sqrt(errors.reduce((sum, err) => sum + err * err, 0) / errors.length);
      const mape = errors.reduce((sum, err, i) => sum + Math.abs(err / actual[i]), 0) / errors.length * 100;
      
      return { mae, rmse, mape };
    };

    const models = ['ARIMA', 'Prophet', 'Random Forest', 'XGBoost', 'Linear Regression'];
    const colors = ['#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c'];

    const results: ModelMetrics[] = models.map((modelName, index) => {
      const predictions = generatePredictions(modelName);
      const metrics = calculateMetrics(testData, predictions);
      
      // Create full prediction series
      const trainPredictions = Array(trainSize).fill(null).map((_, i) => trainData[i]);
      const fullPredictions = [
        ...trainPredictions.map((val, i) => ({ date: data[i].date, value: val })),
        ...predictions.map((val, i) => ({ date: data[trainSize + i].date, value: val }))
      ];

      return {
        name: modelName,
        mae: metrics.mae,
        rmse: metrics.rmse,
        mape: metrics.mape,
        predictions: fullPredictions,
        color: colors[index]
      };
    });

    return {
      models: results,
      trainSize,
      testSize: testData.length
    };
  }, [data]);

  const toggleModel = (modelName: string) => {
    setSelectedModels(prev => 
      prev.includes(modelName) 
        ? prev.filter(m => m !== modelName)
        : [...prev, modelName]
    );
  };

  const exportResults = () => {
    if (!modelComparison) return;
    
    const results = modelComparison.models.map(model => ({
      Model: model.name,
      MAE: model.mae.toFixed(3),
      RMSE: model.rmse.toFixed(3),
      MAPE: model.mape.toFixed(2) + '%'
    }));

    const csvContent = [
      Object.keys(results[0]).join(','),
      ...results.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model_comparison_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Model Comparison</h1>
          <p className="text-gray-600">Compare performance of different forecasting models</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <GitCompare size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload your time series data to compare model performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Model Comparison</h1>
          <p className="text-gray-600">Compare performance of different forecasting models</p>
        </div>
        <button
          onClick={exportResults}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download size={16} />
          Export Results
        </button>
      </div>

      {modelComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Best MAE</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.min(...modelComparison.models.map(m => m.mae)).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {modelComparison.models.find(m => m.mae === Math.min(...modelComparison.models.map(m => m.mae)))?.name}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Best RMSE</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.min(...modelComparison.models.map(m => m.rmse)).toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {modelComparison.models.find(m => m.rmse === Math.min(...modelComparison.models.map(m => m.rmse)))?.name}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">Best MAPE</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.min(...modelComparison.models.map(m => m.mape)).toFixed(2)}%
            </p>
            <p className="text-sm text-gray-600">
              {modelComparison.models.find(m => m.mape === Math.min(...modelComparison.models.map(m => m.mape)))?.name}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Model Predictions Comparison</h2>
              <div className="text-sm text-gray-600">
                Training: {modelComparison?.trainSize} points | Testing: {modelComparison?.testSize} points
              </div>
            </div>
            
            <div className="h-96 relative">
              <TimeSeriesChart data={data} />
              {modelComparison?.models
                .filter(model => selectedModels.includes(model.name))
                .map((model, index) => (
                  <div key={model.name} className="absolute inset-0 pointer-events-none opacity-70">
                    <TimeSeriesChart data={model.predictions} />
                  </div>
                ))
              }
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
                <span className="text-sm">Actual Data</span>
              </div>
              {modelComparison?.models
                .filter(model => selectedModels.includes(model.name))
                .map((model) => (
                  <div key={model.name} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: model.color }}
                    ></div>
                    <span className="text-sm">{model.name}</span>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Performance Metrics</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-medium text-gray-700">Model</th>
                    <th className="text-right py-2 font-medium text-gray-700">MAE</th>
                    <th className="text-right py-2 font-medium text-gray-700">RMSE</th>
                    <th className="text-right py-2 font-medium text-gray-700">MAPE</th>
                    <th className="text-center py-2 font-medium text-gray-700">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparison?.models
                    .sort((a, b) => a.mae - b.mae)
                    .map((model, index) => (
                      <tr key={model.name} className={`border-b border-gray-100 ${selectedModels.includes(model.name) ? 'bg-blue-50' : ''}`}>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: model.color }}
                            ></div>
                            <span className="font-medium">{model.name}</span>
                          </div>
                        </td>
                        <td className="text-right py-3">{model.mae.toFixed(3)}</td>
                        <td className="text-right py-3">{model.rmse.toFixed(3)}</td>
                        <td className="text-right py-3">{model.mape.toFixed(2)}%</td>
                        <td className="text-center py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            index === 0 ? 'bg-green-100 text-green-700' :
                            index === 1 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            #{index + 1}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Select Models</h3>
            <div className="space-y-2">
              {modelComparison?.models.map((model) => (
                <label key={model.name} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(model.name)}
                    onChange={() => toggleModel(model.name)}
                    className="rounded"
                  />
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: model.color }}
                  ></div>
                  <span className="text-sm font-medium">{model.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Metrics Guide</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-blue-700">MAE:</strong>
                <p className="text-gray-600">Mean Absolute Error - average absolute difference</p>
              </div>
              <div>
                <strong className="text-green-700">RMSE:</strong>
                <p className="text-gray-600">Root Mean Square Error - penalizes large errors more</p>
              </div>
              <div>
                <strong className="text-purple-700">MAPE:</strong>
                <p className="text-gray-600">Mean Absolute Percentage Error - relative accuracy</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Recommendations</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Choose model with lowest MAPE for percentage accuracy</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Use RMSE when large errors are costly</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Consider ensemble methods for best performance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};