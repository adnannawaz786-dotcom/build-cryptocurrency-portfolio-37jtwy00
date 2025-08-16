import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

const PriceChart = ({ coinId, coinName, currentPrice }) => {
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('7');
  const [loading, setLoading] = useState(true);
  const [priceChange, setPriceChange] = useState(0);

  const timeframeOptions = [
    { value: '1', label: '24H' },
    { value: '7', label: '7D' },
    { value: '30', label: '30D' },
    { value: '90', label: '90D' },
    { value: '365', label: '1Y' }
  ];

  useEffect(() => {
    if (coinId) {
      fetchChartData();
    }
  }, [coinId, timeframe]);

  const fetchChartData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${timeframe}&interval=${timeframe === '1' ? 'hourly' : 'daily'}`
      );
      const data = await response.json();
      
      if (data.prices) {
        const formattedData = data.prices.map(([timestamp, price]) => ({
          timestamp,
          price: parseFloat(price.toFixed(6)),
          date: new Date(timestamp).toLocaleDateString(),
          time: new Date(timestamp).toLocaleTimeString()
        }));
        
        setChartData(formattedData);
        
        // Calculate price change
        if (formattedData.length > 1) {
          const firstPrice = formattedData[0].price;
          const lastPrice = formattedData[formattedData.length - 1].price;
          const change = ((lastPrice - firstPrice) / firstPrice) * 100;
          setPriceChange(change);
        }
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTooltipValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(value);
  };

  const formatAxisValue = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {timeframe === '1' ? data.time : data.date}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatTooltipValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Price Chart
            </h3>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {coinName} Price Chart
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTooltipValue(currentPrice)}
              </span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                priceChange >= 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {priceChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{Math.abs(priceChange).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeframe(option.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                timeframe === option.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-600" />
            <XAxis 
              dataKey="timestamp"
              tickFormatter={(timestamp) => {
                const date = new Date(timestamp);
                if (timeframe === '1') {
                  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
                return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
              }}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={formatAxisValue}
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: priceChange >= 0 ? '#10b981' : '#ef4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {timeframe === '1' ? 'Last 24 hours' : 
           timeframe === '7' ? 'Last 7 days' :
           timeframe === '30' ? 'Last 30 days' :
           timeframe === '90' ? 'Last 90 days' : 'Last year'} price movement
        </p>
      </div>
    </div>
  );
};

export default PriceChart;