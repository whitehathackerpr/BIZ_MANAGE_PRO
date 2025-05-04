import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../app/store';
import {
  fetchSalesTrends,
  fetchTopProducts,
  fetchInventoryTrends,
  fetchKPIs,
} from '../features/dashboard/dashboardSlice';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface FinancialForecast {
  date: string;
  predicted_revenue: number;
}

interface MLForecastData {
  business_id: number;
  days_forecast: number;
  forecast: {
    total_predicted_revenue: number;
    daily_average: number;
    confidence: number;
    daily_predictions: FinancialForecast[];
  };
}

const DashboardAnalyticsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { salesTrends, topProducts, inventoryTrends, kpis, loading, error } = useSelector((state: RootState) => state.dashboard);
  const user = useSelector((state: RootState) => state.auth.user);
  const [forecastData, setForecastData] = useState<MLForecastData | null>(null);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<number>(30);
  const businessId = 1; // Replace with actual businessId

  useEffect(() => {
    dispatch(fetchSalesTrends(businessId));
    dispatch(fetchTopProducts(businessId));
    dispatch(fetchInventoryTrends(businessId));
    dispatch(fetchKPIs(businessId));

    const fetchData = async () => {
      try {
        // In a real implementation, use actual API
        // const response = await api.get(`/api/v1/ml-analytics/financial-forecast/${businessId}?days=${selectedTimePeriod}`);
        // setForecastData(response.data);
        
        // Mock data for demonstration
        const mockData: MLForecastData = {
          business_id: businessId,
          days_forecast: selectedTimePeriod,
          forecast: {
            total_predicted_revenue: 35420.75,
            daily_average: 1180.69,
            confidence: 0.78,
            daily_predictions: Array.from({ length: selectedTimePeriod }, (_, i) => {
              // Create slightly random data for demonstration
              const date = new Date();
              date.setDate(date.getDate() + i + 1);
              const baseValue = 1200;
              const randomFactor = Math.random() * 0.5 + 0.75; // Between 0.75 and 1.25
              
              // Add weekly pattern: weekends have lower sales
              const dayOfWeek = date.getDay();
              const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1;
              
              return {
                date: date.toISOString().split('T')[0],
                predicted_revenue: baseValue * randomFactor * weekendFactor
              };
            })
          }
        };
        
        setForecastData(mockData);
      } catch (err: any) {
        console.error('Error fetching forecast data:', err.message || 'Failed to fetch forecast data');
      }
    };

    fetchData();
  }, [dispatch, businessId, selectedTimePeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error loading forecast data: {error}</p>
      </div>
    );
  }

  // Get maximum value of predicted revenue (safely)
  const maxRevenueValue = forecastData?.forecast.daily_predictions
    ? Math.max(...forecastData.forecast.daily_predictions.map(d => d.predicted_revenue))
    : 0;
    
  // Get the daily average value safely
  const dailyAverage = forecastData?.forecast?.daily_average || 0;
  
  // Determine performance based on daily average
  const isStrongPerformance = dailyAverage > 1000;

  return (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-6">Business Analytics Dashboard</h2>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Forecasting</h1>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setSelectedTimePeriod(7)} 
            className={`px-3 py-1 rounded ${selectedTimePeriod === 7 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => setSelectedTimePeriod(14)} 
            className={`px-3 py-1 rounded ${selectedTimePeriod === 14 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            14 Days
          </button>
          <button 
            onClick={() => setSelectedTimePeriod(30)} 
            className={`px-3 py-1 rounded ${selectedTimePeriod === 30 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            30 Days
          </button>
          <button 
            onClick={() => setSelectedTimePeriod(90)} 
            className={`px-3 py-1 rounded ${selectedTimePeriod === 90 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            90 Days
          </button>
        </div>
      </div>
      
      {/* AI model explanation */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg p-4 mb-6 border border-indigo-200">
        <h3 className="font-bold text-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          ML-Powered Financial Analysis
        </h3>
        <p className="text-sm text-gray-700 mt-1">
          Our advanced machine learning model analyzes your historical sales data, seasonal patterns, market trends, and business-specific factors to generate accurate financial forecasts.
        </p>
        <div className="mt-2 flex items-center">
          <span className="mr-2 text-sm font-medium">Model confidence:</span>
          <span className={`text-sm font-bold ${getConfidenceColor(forecastData?.forecast.confidence || 0)}`}>
            {getConfidenceLabel(forecastData?.forecast.confidence || 0)} ({Math.round((forecastData?.forecast.confidence || 0) * 100)}%)
          </span>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Forecast Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total Predicted Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(forecastData?.forecast.total_predicted_revenue || 0)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Daily Average</p>
              <p className="text-2xl font-bold">{formatCurrency(dailyAverage)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Forecast Period</p>
              <p className="text-xl font-semibold">{forecastData?.days_forecast} days</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Model Confidence</p>
              <p className={`text-xl font-semibold ${getConfidenceColor(forecastData?.forecast.confidence || 0)}`}>
                {Math.round((forecastData?.forecast.confidence || 0) * 100)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Business Insights</h2>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expected <strong>{formatCurrency(forecastData?.forecast.total_predicted_revenue || 0)}</strong> in revenue over the next {forecastData?.days_forecast} days</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Daily average of <strong>{formatCurrency(dailyAverage)}</strong> shows {isStrongPerformance ? 'strong' : 'moderate'} performance</span>
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Expected weekend revenue dips of approximately 30% compared to weekdays</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Revenue chart */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Revenue Forecast Chart</h2>
        
        {/* In a real implementation, use Chart.js or similar library */}
        <div className="h-80 flex flex-col">
          <div className="flex-1 flex">
            {forecastData?.forecast.daily_predictions.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end">
                <div className="w-full bg-green-500 rounded-t" style={{ 
                  height: `${(day.predicted_revenue / maxRevenueValue) * 100}%` 
                }}></div>
                {/* Only show dates for first day, last day, and every 5th day to avoid overcrowding */}
                {(index === 0 || index === forecastData.forecast.daily_predictions.length - 1 || index % 5 === 0) && (
                  <div className="text-xs text-gray-600 mt-2 rotate-45 origin-top-left">
                    {new Date(day.date).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Detailed predictions table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Detailed Forecast</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-4 text-left">Date</th>
                <th className="py-2 px-4 text-left">Day</th>
                <th className="py-2 px-4 text-left">Predicted Revenue</th>
              </tr>
            </thead>
            <tbody>
              {forecastData?.forecast.daily_predictions.map((prediction, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4">{prediction.date}</td>
                  <td className="py-2 px-4">{new Date(prediction.date).toLocaleDateString('en-US', { weekday: 'long' })}</td>
                  <td className="py-2 px-4">{formatCurrency(prediction.predicted_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalyticsPage; 