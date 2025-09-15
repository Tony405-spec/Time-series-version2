import React from 'react';
import { X, BookOpen } from 'lucide-react';

interface ConceptsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
}

const conceptsData = {
  dashboard: {
    title: "Time Series Dashboard",
    concepts: [
      {
        term: "Time Series",
        definition: "A sequence of data points indexed in time order, typically collected at regular intervals."
      },
      {
        term: "Trend",
        definition: "The long-term direction or movement in the data over time."
      },
      {
        term: "Volatility",
        definition: "The degree of variation of data points from their mean value."
      }
    ]
  },
  trend: {
    title: "Trend & Seasonality",
    concepts: [
      {
        term: "Decomposition",
        definition: "Breaking down a time series into its constituent components: trend, seasonality, and residuals."
      },
      {
        term: "Seasonality",
        definition: "Predictable patterns that repeat over fixed periods (daily, weekly, yearly)."
      },
      {
        term: "Residuals",
        definition: "The random, unpredictable component left after removing trend and seasonality."
      }
    ]
  },
  regression: {
    title: "Linear Regression",
    concepts: [
      {
        term: "R-Squared",
        definition: "Coefficient of determination measuring how well the model explains the variance in data (0-1)."
      },
      {
        term: "RMSE",
        definition: "Root Mean Square Error - measures average prediction error in original units."
      },
      {
        term: "Residuals",
        definition: "Differences between actual and predicted values. Should be randomly distributed."
      }
    ]
  },
  features: {
    title: "Feature Engineering",
    concepts: [
      {
        term: "Lag Features",
        definition: "Using past values of the time series as predictive features for future values."
      },
      {
        term: "Rolling Statistics",
        definition: "Moving averages, medians, or standard deviations calculated over a sliding window."
      },
      {
        term: "Differencing",
        definition: "Subtracting previous values to remove trends and make data stationary."
      },
      {
        term: "Stationarity",
        definition: "Property where statistical characteristics like mean and variance don't change over time."
      }
    ]
  },
  hybrid: {
    title: "Hybrid Models",
    concepts: [
      {
        term: "Hybrid Modeling",
        definition: "Combining statistical models (like ARIMA) with machine learning approaches for better accuracy."
      },
      {
        term: "Ensemble Methods",
        definition: "Combining predictions from multiple models to improve overall performance."
      },
      {
        term: "Statistical + ML",
        definition: "Using statistical models for trend/seasonality and ML for complex residual patterns."
      }
    ]
  },
  forecasting: {
    title: "Forecasting Models",
    concepts: [
      {
        term: "ARIMA",
        definition: "AutoRegressive Integrated Moving Average - statistical model for stationary time series."
      },
      {
        term: "Prophet",
        definition: "Facebook's forecasting procedure designed for business time series with strong seasonal effects."
      },
      {
        term: "Random Forest",
        definition: "Ensemble learning method using multiple decision trees for prediction."
      },
      {
        term: "XGBoost",
        definition: "Gradient boosting framework optimized for speed and performance."
      }
    ]
  },
  comparison: {
    title: "Model Comparison",
    concepts: [
      {
        term: "MAE",
        definition: "Mean Absolute Error - average absolute difference between predicted and actual values."
      },
      {
        term: "RMSE",
        definition: "Root Mean Square Error - gives higher weight to large errors than MAE."
      },
      {
        term: "MAPE",
        definition: "Mean Absolute Percentage Error - measures accuracy as a percentage of actual values."
      },
      {
        term: "Cross-Validation",
        definition: "Technique to assess model performance by training on historical data and testing on unseen data."
      }
    ]
  }
};

export const ConceptsSidebar: React.FC<ConceptsSidebarProps> = ({ isOpen, onClose, currentTab }) => {
  const currentConcepts = conceptsData[currentTab as keyof typeof conceptsData] || conceptsData.dashboard;

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Concepts Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-800 mb-2">{currentConcepts.title}</h3>
          <p className="text-sm text-gray-600">Key concepts and definitions for this section</p>
        </div>

        <div className="space-y-4">
          {currentConcepts.concepts.map((concept, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">{concept.term}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{concept.definition}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Learning Tip</h4>
          <p className="text-sm text-blue-700">
            Start with the basics and gradually move to more complex models. 
            Always validate your results and understand the assumptions behind each method.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="font-semibold text-gray-800">Quick Navigation</h4>
          {Object.entries(conceptsData).map(([key, value]) => (
            <button
              key={key}
              className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                currentTab === key
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => {/* This would trigger tab change if we had that functionality */}}
            >
              {value.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};