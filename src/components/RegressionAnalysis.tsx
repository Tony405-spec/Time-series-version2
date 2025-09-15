import React, { useMemo, useState } from 'react';
import { TimeSeriesChart } from './charts/TimeSeriesChart';
import { LineChart, Target, TrendingUp, Info } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface RegressionAnalysisProps {
  data: TimeSeriesData[];
}

export const RegressionAnalysis: React.FC<RegressionAnalysisProps> = ({ data }) => {
  const [showResiduals, setShowResiduals] = useState(false);

  const analysis = useMemo(() => {
    if (data.length === 0) return null;

    // Prepare data for regression (using time as x variable)
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.value);

    // Calculate linear regression coefficients
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate regression line
    const regressionLine = x.map((val, i) => ({
      date: data[i].date,
      value: slope * val + intercept
    }));

    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, val) => sum + (val - yMean) ** 2, 0);
    const ssRes = y.reduce((sum, val, i) => sum + (val - (slope * x[i] + intercept)) ** 2, 0);
    const rSquared = 1 - (ssRes / ssTotal);

    // Calculate residuals
    const residuals = y.map((val, i) => ({
      date: data[i].date,
      value: val - (slope * x[i] + intercept)
    }));

    // Additional statistics
    const mse = ssRes / n;
    const rmse = Math.sqrt(mse);
    const mae = y.reduce((sum, val, i) => sum + Math.abs(val - (slope * x[i] + intercept)), 0) / n;

    return {
      slope,
      intercept,
      rSquared,
      regressionLine,
      residuals,
      stats: {
        rmse: rmse.toFixed(2),
        mae: mae.toFixed(2),
        rSquared: rSquared.toFixed(4)
      }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Linear Regression Analysis</h1>
          <p className="text-gray-600">Fit linear models to your time series data</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4">
            <LineChart size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">Upload your time series data to perform regression analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Linear Regression Analysis</h1>
        <p className="text-gray-600">Fit linear models to your time series data</p>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="text-blue-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">R-Squared</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analysis.stats.rSquared}</p>
            <p className="text-sm text-gray-600">Model fit quality</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="text-green-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">RMSE</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analysis.stats.rmse}</p>
            <p className="text-sm text-gray-600">Root mean square error</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <LineChart className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-800">MAE</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{analysis.stats.mae}</p>
            <p className="text-sm text-gray-600">Mean absolute error</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {showResiduals ? 'Residuals Plot' : 'Regression Fit'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResiduals(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    !showResiduals
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Fit
                </button>
                <button
                  onClick={() => setShowResiduals(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    showResiduals
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Residuals
                </button>
              </div>
            </div>
            
            <div className="h-96 relative">
              {analysis && (
                <div>
                  {!showResiduals ? (
                    <div className="relative h-full">
                      <TimeSeriesChart data={data} />
                      <div className="absolute inset-0 pointer-events-none">
                        <TimeSeriesChart data={analysis.regressionLine} />
                      </div>
                    </div>
                  ) : (
                    <TimeSeriesChart data={analysis.residuals} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-800">Model Equation</h3>
            </div>
            {analysis && (
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                  y = {analysis.slope.toFixed(4)}x + {analysis.intercept.toFixed(2)}
                </div>
                <div className="text-gray-600">
                  <p><strong>Slope:</strong> {analysis.slope.toFixed(4)}</p>
                  <p><strong>Intercept:</strong> {analysis.intercept.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Interpretation Guide</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <strong className="text-blue-700">R-Squared:</strong>
                <p>Proportion of variance explained by the model (0-1)</p>
              </div>
              <div>
                <strong className="text-green-700">RMSE:</strong>
                <p>Average prediction error in original units</p>
              </div>
              <div>
                <strong className="text-purple-700">Residuals:</strong>
                <p>Should be randomly distributed around zero</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Next Steps</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Check residuals for patterns</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Consider non-linear models if R² is low</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Try feature engineering for better fits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};