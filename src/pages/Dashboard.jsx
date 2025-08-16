import React, { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Search, Settings, RefreshCw } from 'lucide-react'

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState([])
  const [totalValue, setTotalValue] = useState(0)
  const [totalChange, setTotalChange] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newCoin, setNewCoin] = useState({ symbol: '', amount: '', purchasePrice: '' })

  // Mock cryptocurrency data
  const mockCryptoData = {
    BTC: { name: 'Bitcoin', price: 42000, change24h: 2.5, icon: '₿' },
    ETH: { name: 'Ethereum', price: 2500, change24h: -1.2, icon: 'Ξ' },
    ADA: { name: 'Cardano', price: 0.45, change24h: 3.8, icon: '₳' },
    DOT: { name: 'Polkadot', price: 6.2, change24h: -2.1, icon: '●' },
    LINK: { name: 'Chainlink', price: 14.5, change24h: 5.2, icon: '⬢' }
  }

  useEffect(() => {
    // Initialize with some sample data
    const samplePortfolio = [
      { id: 1, symbol: 'BTC', amount: 0.5, purchasePrice: 40000 },
      { id: 2, symbol: 'ETH', amount: 2.3, purchasePrice: 2300 },
      { id: 3, symbol: 'ADA', amount: 1000, purchasePrice: 0.42 }
    ]
    setPortfolio(samplePortfolio)
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [portfolio])

  const calculateTotals = () => {
    let total = 0
    let totalPurchaseValue = 0

    portfolio.forEach(coin => {
      const currentPrice = mockCryptoData[coin.symbol]?.price || 0
      const currentValue = coin.amount * currentPrice
      const purchaseValue = coin.amount * coin.purchasePrice
      
      total += currentValue
      totalPurchaseValue += purchaseValue
    })

    setTotalValue(total)
    setTotalChange(((total - totalPurchaseValue) / totalPurchaseValue) * 100 || 0)
  }

  const handleAddCoin = () => {
    if (newCoin.symbol && newCoin.amount && newCoin.purchasePrice) {
      const coin = {
        id: Date.now(),
        symbol: newCoin.symbol.toUpperCase(),
        amount: parseFloat(newCoin.amount),
        purchasePrice: parseFloat(newCoin.purchasePrice)
      }
      setPortfolio([...portfolio, coin])
      setNewCoin({ symbol: '', amount: '', purchasePrice: '' })
      setShowAddModal(false)
    }
  }

  const removeCoin = (id) => {
    setPortfolio(portfolio.filter(coin => coin.id !== id))
  }

  const refreshData = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const filteredPortfolio = portfolio.filter(coin =>
    coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mockCryptoData[coin.symbol]?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your cryptocurrency investments</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              className={`flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings size={16} />
              Settings
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">24h Change</p>
                <p className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
                </p>
              </div>
              <div className={`p-3 rounded-full ${totalChange >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {totalChange >= 0 ? 
                  <TrendingUp className="h-6 w-6 text-green-600" /> : 
                  <TrendingDown className="h-6 w-6 text-red-600" />
                }
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Holdings</p>
                <p className="text-2xl font-bold text-gray-900">{portfolio.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search coins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Add Coin
          </button>
        </div>

        {/* Portfolio Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holdings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPortfolio.map((coin) => {
                  const cryptoData = mockCryptoData[coin.symbol]
                  const currentValue = coin.amount * (cryptoData?.price || 0)
                  const purchaseValue = coin.amount * coin.purchasePrice
                  const pnl = currentValue - purchaseValue
                  const pnlPercentage = (pnl / purchaseValue) * 100

                  return (
                    <tr key={coin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold">
                              {cryptoData?.icon || coin.symbol[0]}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{coin.symbol}</div>
                            <div className="text-sm text-gray-500">{cryptoData?.name || 'Unknown'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${cryptoData?.price?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coin.amount.toLocaleString()} {coin.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${currentValue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (cryptoData?.change24h || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {(cryptoData?.change24h || 0) >= 0 ? '+' : ''}{cryptoData?.change24h?.toFixed(2) || '0'}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                        </div>
                        <div className={`text-xs ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ({pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => removeCoin(coin.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Coin Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">Add New Coin</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                  <input
                    type="text"
                    value={newCoin.symbol}
                    onChange={(e) => setNewCoin({...newCoin, symbol: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="BTC, ETH, ADA..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newCoin.amount}
                    onChange={(e) => setNewCoin({...newCoin, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    value={newCoin.purchasePrice}
                    onChange={(e) => setNewCoin({...newCoin, purchasePrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCoin}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Coin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard