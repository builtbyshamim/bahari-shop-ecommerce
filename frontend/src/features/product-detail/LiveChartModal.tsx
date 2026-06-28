import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, Download, Bell } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const LiveChartModal = ({ product, variant, onClose }:any) => {
  const [timeRange, setTimeRange] = useState('30d');
  const [chartData, setChartData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchPriceHistory();
  }, [timeRange, variant]);

  const fetchPriceHistory = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockData = generateMockPriceData(timeRange);
      setChartData(mockData);
    } catch (error) {
      console.error('Error fetching price history:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPriceData = (range:any) => {
    const data = [];
    const points = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const basePrice = product.price;
    
    for (let i = 0; i < points; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (points - i - 1));
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: basePrice + (Math.random() - 0.5) * 20,
        volume: Math.floor(Math.random() * 100) + 50
      });
    }
    return data;
  };

  const stats:any = {
    current: product.price,
    low: Math.min(...chartData.map((d:any) => d.price)),
    high: Math.max(...chartData.map((d:any) => d.price)),
    average: (chartData.reduce((acc:any, d:any) => acc + d.price, 0) / chartData.length).toFixed(2),
    change: ((chartData[chartData.length - 1]?.price - chartData[0]?.price) / chartData[0]?.price * 100).toFixed(2)
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-black-800">Price History</h2>
            <p className="text-sm text-black-500 mt-1">
              {product.name} {variant && `- ${variant.color}`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-black-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-primary-500 text-white'
                      : 'bg-black-100 text-black-600 hover:bg-primary-100'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setChartType('line')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'line'
                    ? 'bg-primary-500 text-white'
                    : 'bg-black-100 text-black-600 hover:bg-primary-100'
                }`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartType === 'area'
                    ? 'bg-primary-500 text-white'
                    : 'bg-black-100 text-black-600 hover:bg-primary-100'
                }`}
              >
                Area
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 grid grid-cols-5 gap-4 border-b border-black-200">
          <div className="bg-black-100 rounded-lg p-3">
            <p className="text-xs text-black-500 mb-1">Current</p>
            <p className="text-lg font-bold text-black-800">${stats.current}</p>
          </div>
          <div className="bg-black-100 rounded-lg p-3">
            <p className="text-xs text-black-500 mb-1">Low</p>
            <p className="text-lg font-bold text-green-600">${stats.low.toFixed(2)}</p>
          </div>
          <div className="bg-black-100 rounded-lg p-3">
            <p className="text-xs text-black-500 mb-1">High</p>
            <p className="text-lg font-bold text-orange-600">${stats.high.toFixed(2)}</p>
          </div>
          <div className="bg-black-100 rounded-lg p-3">
            <p className="text-xs text-black-500 mb-1">Average</p>
            <p className="text-lg font-bold text-black-800">${stats.average}</p>
          </div>
          <div className={`bg-black-100 rounded-lg p-3 ${
            stats.change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            <p className="text-xs text-black-500 mb-1">Change</p>
            <p className="text-lg font-bold flex items-center gap-1">
              {stats.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(stats.change)}%
            </p>
          </div>
        </div>

  

        {/* Footer */}
        <div className="p-6 border-t border-black-200 flex items-center justify-between">
          <div className="flex gap-3">
            <input 
              type="number" 
              placeholder="Set price alert"
              className="border-2 border-black-200 rounded-lg px-4 py-2 w-40 focus:border-primary-500 focus:outline-none"
            />
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
              <Bell size={16} />
              Notify me
            </button>
          </div>
          
          <button className="border-2 border-black-200 hover:border-primary-500 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChartModal;