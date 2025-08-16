import React, { useState, useEffect } from 'react';
import { cn } from './lib/utils';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, RefreshCw, Search, Trash2 } from 'lucide-react';

const CryptocurrencyPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHolding, setNewHolding] = useState({
    symbol: '',
    amount: '',
    purchasePrice: ''
  });
  const [cryptoData, setCryptoData] = useState({});

  // Mock cryptocurrency data (in a real app, this would come from an API)
  const mockCryptoData = {
    BTC: { name: 'Bitcoin', price: 43250, change24h: 2.5, icon: '₿' },
    ETH: { name: 'Ethereum', price: 2580, change24h: -1.2, icon: 'Ξ' },
    ADA: { name: 'Cardano', price: 0.52, change24h: 3.8, icon: '₳' },
    DOT: { name: 'Polkadot', price: 7.25, change24h: -0.5, icon: '●' },
    LINK: { name: 'Chainlink', price: 15.80, change24h: 4.2, icon: '◎' },
    SOL: { name: 'Solana', price: 98.50, change24h: 6.1, icon: '◉' }
  };

  useEffect(() => {
    setCryptoData(mockCryptoData);
    // Load portfolio from localStorage
    const savedPortfolio = localStorage.getItem('cryptoPortfolio');
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio));
    }
  }, []);

  useEffect(() => {
    // Save portfolio to localStorage whenever it changes
    localStorage.setItem('cryptoPortfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  const addHolding = () => {
    if (!newHolding.symbol || !newHolding.amount || !newHolding.purchasePrice) return;
    
    const holding = {
      id: Date.now(),
      symbol: newHolding.symbol.toUpperCase(),
      amount: parseFloat(newHolding.amount),
      purchasePrice: parseFloat(newHolding.purchasePrice),
      dateAdded: new Date().toISOString()
    };

    setPortfolio([...portfolio, holding]);
    setNewHolding({ symbol: '', amount: '', purchasePrice: '' });
    setShowAddModal(false);
  };

  const removeHolding = (id) => {
    setPortfolio(portfolio.filter(holding => holding.id !== id));
  };

  const calculatePortfolioValue = () => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = cryptoData[holding.symbol]?.price || 0;
      return total + (holding.amount * currentPrice);
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return portfolio.reduce((total, holding) => {
      const currentPrice = cryptoData[holding.symbol]?.price || 0;
      const currentValue = holding.amount * currentPrice;
      const purchaseValue = holding.amount * holding.purchasePrice;
      return total + (currentValue - purchaseValue);
    }, 0);
  };

  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const filteredPortfolio = portfolio.filter(holding =>
    holding.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cryptoData[holding.symbol]?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = calculatePortfolioValue();
  const totalGainLoss = calculateTotalGainLoss();
  const totalGainLossPercentage = totalValue > 0 ? ((totalGainLoss / (totalValue - totalGainLoss)) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cryptocurrency Portfolio</h1>
              <p className="text-gray-600">Track your crypto investments in real-time</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Holding
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                <p className={cn("text-2xl font-bold", totalGainLoss >= 0 ? "text-green-600" : "text-red-600")}>
                  ${totalGainLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={cn("text-sm", totalGainLoss >= 0 ? "text-green-600" : "text-red-600")}>
                  {totalGainLossPercentage.toFixed(2)}%
                </p>
              </div>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Holdings</p>
                <p className="text-2xl font-bold text-gray-900">{portfolio.length}</p>
              </div>
              <PieChart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Holdings</h2>
          </div>
          
          {filteredPortfolio.length === 0 ? (
            <div className="text-center py-12">
              <PieChart className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No holdings found. Add your first cryptocurrency to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holdings</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain/Loss</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPortfolio.map((holding) => {
                    const crypto = cryptoData[holding.symbol];
                    const currentValue = holding.amount * (crypto?.price || 0);
                    const purchaseValue = holding.amount * holding.purchasePrice;
                    const gainLoss = currentValue - purchaseValue;
                    const gainLossPercentage = purchaseValue > 0 ? ((gainLoss / purchaseValue) * 100) : 0;

                    return (
                      <tr key={holding.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold">
                                {crypto?.icon || holding.symbol[0]}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                              <div className="text-sm text-gray-500">{crypto?.name || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {holding.amount.toFixed(8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${crypto?.price?.toLocaleString() || 'N/A'}</div>
                          <div className={cn("text-sm", (crypto?.change24h || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                            {(crypto?.change24h || 0) >= 0 ? '+' : ''}{crypto?.change24h?.toFixed(2) || 0}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${holding.purchasePrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${currentValue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={cn("text-sm font-medium", gainLoss >= 0 ? "text-green-600" : "text-red-600")}>
                            ${gainLoss.toFixed(2)}
                          </div>
                          <div className={cn("text-sm", gainLoss >= 0 ? "text-green-600" : "text-red-600")}>
                            {gainLoss >= 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => removeHolding(holding.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add New Holding</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cryptocurrency Symbol
                </label>
                <input
                  type="text"
                  placeholder="e.g., BTC, ETH"
                  value={newHolding.symbol}
                  onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Held
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={newHolding.amount}
                  onChange={(e) => setNewHolding({ ...newHolding, amount: e.target.value })}
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
                  placeholder="0.00"
                  value={newHolding.purchasePrice}
                  onChange={(e) => setNewHolding({ ...newHolding, purchasePrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addHolding}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Holding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptocurrencyPortfolio;