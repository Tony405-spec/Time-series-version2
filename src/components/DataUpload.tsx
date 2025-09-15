import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { TimeSeriesData } from '../App';

interface DataUploadProps {
  onDataLoad: (data: TimeSeriesData[]) => void;
}

export const DataUpload: React.FC<DataUploadProps> = ({ onDataLoad }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const generateSampleData = useCallback(() => {
    const startDate = new Date('2023-01-01');
    const data: TimeSeriesData[] = [];
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Generate sample time series with trend and seasonality
      const trend = i * 0.1;
      const seasonal = 50 * Math.sin((2 * Math.PI * i) / 52); // Weekly seasonality
      const noise = (Math.random() - 0.5) * 20;
      const value = 1000 + trend + seasonal + noise;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }
    
    onDataLoad(data);
    setUploadStatus('success');
  }, [onDataLoad]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadStatus('loading');
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Expect columns: date, value (or similar)
        const dateColIndex = headers.findIndex(h => 
          h.toLowerCase().includes('date') || h.toLowerCase().includes('time')
        );
        const valueColIndex = headers.findIndex(h => 
          h.toLowerCase().includes('value') || h.toLowerCase().includes('price') || 
          h.toLowerCase().includes('amount') || h.toLowerCase().includes('sales')
        );

        if (dateColIndex === -1 || valueColIndex === -1) {
          throw new Error('CSV must contain date and value columns');
        }

        const data: TimeSeriesData[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= Math.max(dateColIndex, valueColIndex) + 1) {
            const dateStr = values[dateColIndex];
            const valueStr = values[valueColIndex];
            const value = parseFloat(valueStr);
            
            if (!isNaN(value)) {
              data.push({
                date: dateStr,
                value: value
              });
            }
          }
        }

        if (data.length === 0) {
          throw new Error('No valid data found in file');
        }

        onDataLoad(data);
        setUploadStatus('success');
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Error parsing file');
        setUploadStatus('error');
      }
    };

    reader.onerror = () => {
      setErrorMessage('Error reading file');
      setUploadStatus('error');
    };

    reader.readAsText(file);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Data Upload</h1>
        <p className="text-gray-600">Upload your time series data or use sample data to get started</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="space-y-4">
              <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center ${
                uploadStatus === 'success' ? 'bg-green-100' : 
                uploadStatus === 'error' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                {uploadStatus === 'loading' ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                ) : uploadStatus === 'success' ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="text-red-600" size={24} />
                ) : (
                  <Upload className="text-gray-600" size={24} />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Drop your file here</h3>
                <p className="text-gray-600">or click to browse</p>
                <p className="text-sm text-gray-500 mt-2">Supports CSV and Excel files</p>
              </div>

              {uploadStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-700 text-sm">File uploaded successfully!</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>
          </div>

          <button
            onClick={generateSampleData}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Use Sample Data
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <FileText className="text-blue-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Data Format Requirements</h3>
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Required Columns:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Date/Time column:</strong> Any column with "date" or "time" in the name</li>
                <li>• <strong>Value column:</strong> Numeric data (sales, price, value, etc.)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Supported Formats:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• CSV files (.csv)</li>
                <li>• Excel files (.xlsx, .xls)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-2">Example CSV Format:</h4>
              <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                date,value<br />
                2023-01-01,1000<br />
                2023-01-02,1050<br />
                2023-01-03,980<br />
                ...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};