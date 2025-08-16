import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Percent, Search, Edit, Trash2, X } from 'lucide-react';
import { cn } from '../lib/utils';

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    amount: '',
    purchasePrice: ''
  });

  // Mock crypto data - in real app, fetch from API
  const mockCryptoData = {
    'BTC': { name: 'Bitcoin', price: 45000, change24h: 2.5 },
    'ETH': { name: 'Ethereum', price: 3200, change24h: -1.2 },
    'ADA': { name: 'Cardano', price: 0.85, change24h: 4.8 },
    'SOL': { name: 'Solana', price: 120, change24h: -0.8 },
    'DOT': { name: 'Polkadot', price: 28, change24h: 3.2 },
    'MATIC': { name: 'Polygon', price: 1.45, change24h: 1.9 }
  };

  useEffect(() => {
    // Load holdings from localStorage
    const savedHoldings = localStorage.getItem('cryptoHoldings');
    if (savedHoldings) {
      setHoldings(JSON.parse(savedHoldings));
    }
    
    // Set mock prices
    setCryptoPrices(mockCryptoData);
  }, []);

  useEffect(() => {
    // Save holdings to localStorage
    localStorage.setItem('cryptoHoldings', JSON.stringify(holdings));
  }, [holdings]);

  const calculateHoldingValue = (holding) => {
    const currentPrice = cryptoPrices[holding.symbol]?.price || 0;
    return holding.amount * currentPrice;
  };

  const calculateProfitLoss = (holding) => {
    const currentValue = calculateHoldingValue(holding);
    const purchaseValue = holding.amount * holding.purchasePrice;
    return currentValue - purchaseValue;
  };

  const calculateProfitLossPercentage = (holding) => {
    const profitLoss = calculateProfitLoss(holding);
    const purchaseValue = holding.amount * holding.purchasePrice;
    return purchaseValue > 0 ? (profitLoss / purchaseValue) * 100 : 0;
  };

  const getTotalPortfolioValue = () => {
    return holdings.reduce((total, holding) => total + calculateHoldingValue(holding), 0);
  };

  const getTotalProfitLoss = () => {
    return holdings.reduce((total, holding) => total + calculateProfitLoss(holding), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newHolding = {
      id: editingHolding ? editingHolding.id : Date.now(),
      symbol: formData.symbol.toUpperCase(),
      name: formData.name || cryptoPrices[formData.symbol.toUpperCase()]?.name || formData.symbol,
      amount: parseFloat(formData.amount),
      purchasePrice: parseFloat(formData.purchasePrice),
      dateAdded: editingHolding ? editingHolding.dateAdded : new Date().toISOString()
    };

    if (editingHolding) {
      setHoldings(holdings.map(h => h.id === editingHolding.id ? newHolding : h));
      setEditingHolding(null);
    } else {
      setHoldings([...holdings, newHolding]);
    }

    setFormData({ symbol: '', name: '', amount: '', purchasePrice: '' });
    setShowAddForm(false);
  };

  const handleEdit = (holding) => {
    setEditingHolding(holding);
    setFormData({
      symbol: holding.symbol,
      name: holding.name,
      amount: holding.amount.toString(),
      purchasePrice: holding.purchasePrice.toString()
    });
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  const filteredHoldings = holdings.filter(holding =>
    holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    holding.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = getTotalPortfolioValue();
  const totalProfitLoss = getTotalProfitLoss();
  const totalProfitLossPercentage = totalValue > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Portfolio</h1>
          <p className="text-gray-600">Track and manage your cryptocurrency investments</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total P&L</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {totalProfitLoss >= 0 ? '+' : ''}${totalProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              {totalProfitLoss >= 0 ? 
                <TrendingUp className="h-8 w-8 text-green-600" /> :
                <TrendingDown className="h-8 w-8 text-red-600" />
              }
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total P&L %</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalProfitLossPercentage >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
                </p>
              </div>
              <Percent className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Holding
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingHolding ? 'Edit Holding' : 'Add New Holding'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingHolding(null);
                    setFormData({ symbol: '', name: '', amount: '', purchasePrice: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    placeholder="e.g., BTC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Bitcoin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingHolding(null);
                      setFormData({ symbol: '', name: '', amount: '', purchasePrice: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingHolding ? 'Update' : 'Add'} Holding
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holdings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHoldings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {holdings.length === 0 ? 'No holdings added yet' : 'No holdings match your search'}
                    </td>
                  </tr>
                ) : (
                  filteredHoldings.map((holding) => {
                    const currentPrice = cryptoPrices[holding.symbol]?.price || 0;
                    const currentValue = calculateHoldingValue(holding);
                    const profitLoss = calculateProfitLoss(holding);
                    const profitLossPercentage = calculateProfitLossPercentage(holding);
                    const priceChange24h = cryptoPrices[holding.symbol]?.change24h || 0;

                    return (
                      <tr key={holding.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {holding.symbol}
                            </div>
                            <div className="text-sm text-gray-500">
                              {holding.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={cn(
                            "text-sm",
                            priceChange24h >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={cn(
                            "text-sm font-medium",
                            profitLoss >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          <div className={cn(
                            "text-sm",
                            profitLoss >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(holding)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(holding.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;