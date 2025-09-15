import React from 'react';
import { TimeSeriesData } from '../../App';

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  height?: number;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, height = 400 }) => {
  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No data available</p>
          <p className="text-gray-400 text-sm">Upload your time series data to see the visualization</p>
        </div>
      </div>
    );
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const range = maxValue - minValue;
  const padding = range * 0.1;
  const chartMinValue = minValue - padding;
  const chartMaxValue = maxValue + padding;
  const chartRange = chartMaxValue - chartMinValue;

  const svgWidth = 800;
  const svgHeight = height;
  const chartPadding = { top: 20, right: 40, bottom: 60, left: 60 };
  const chartWidth = svgWidth - chartPadding.left - chartPadding.right;
  const chartHeight = svgHeight - chartPadding.top - chartPadding.bottom;

  const points = data.map((d, index) => {
    const x = chartPadding.left + (index / (data.length - 1)) * chartWidth;
    const y = chartPadding.top + chartHeight - ((d.value - chartMinValue) / chartRange) * chartHeight;
    return { x, y, value: d.value, date: d.date };
  });

  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  // Y-axis ticks
  const yTicks = 6;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => 
    chartMinValue + (chartRange * i) / (yTicks - 1)
  );

  return (
    <div className="w-full h-full relative">
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="overflow-visible">
        {/* Grid lines */}
        {yTickValues.map((value, index) => {
          const y = chartPadding.top + chartHeight - ((value - chartMinValue) / chartRange) * chartHeight;
          return (
            <line
              key={index}
              x1={chartPadding.left}
              y1={y}
              x2={chartPadding.left + chartWidth}
              y2={y}
              stroke="#f3f4f6"
              strokeWidth={1}
            />
          );
        })}

        {/* X-axis */}
        <line
          x1={chartPadding.left}
          y1={chartPadding.top + chartHeight}
          x2={chartPadding.left + chartWidth}
          y2={chartPadding.top + chartHeight}
          stroke="#6b7280"
          strokeWidth={2}
        />

        {/* Y-axis */}
        <line
          x1={chartPadding.left}
          y1={chartPadding.top}
          x2={chartPadding.left}
          y2={chartPadding.top + chartHeight}
          stroke="#6b7280"
          strokeWidth={2}
        />

        {/* Y-axis labels */}
        {yTickValues.map((value, index) => {
          const y = chartPadding.top + chartHeight - ((value - chartMinValue) / chartRange) * chartHeight;
          return (
            <text
              key={index}
              x={chartPadding.left - 10}
              y={y + 5}
              textAnchor="end"
              className="fill-gray-600 text-xs"
            >
              {value.toFixed(1)}
            </text>
          );
        })}

        {/* Time series line */}
        <path
          d={pathData}
          fill="none"
          stroke="#2563eb"
          strokeWidth={2}
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill="#2563eb"
            className="hover:r-5 transition-all cursor-pointer"
          >
            <title>{`${point.date}: ${point.value.toFixed(2)}`}</title>
          </circle>
        ))}

        {/* X-axis labels */}
        {data.length > 0 && (
          <>
            <text
              x={chartPadding.left}
              y={svgHeight - 20}
              textAnchor="middle"
              className="fill-gray-600 text-xs"
            >
              {data[0].date}
            </text>
            <text
              x={chartPadding.left + chartWidth}
              y={svgHeight - 20}
              textAnchor="middle"
              className="fill-gray-600 text-xs"
            >
              {data[data.length - 1].date}
            </text>
          </>
        )}
      </svg>
    </div>
  );
};