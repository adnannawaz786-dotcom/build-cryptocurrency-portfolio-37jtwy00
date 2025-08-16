const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

// Rate limiting configuration
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests

// Helper function to handle rate limiting
const rateLimitedFetch = async (url, options = {}) => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => 
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
    );
  }
  
  lastRequestTime = Date.now();
  return fetch(url, options);
};

// Helper function to check cache
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

// Helper function to set cache
const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Fetch cryptocurrency market data
export const fetchCryptoMarketData = async (page = 1, perPage = 100) => {
  const cacheKey = `market_data_${page}_${perPage}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await rateLimitedFetch(
      `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=1h,24h,7d`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      price_change_percentage_1h_in_currency: coin.price_change_percentage_1h_in_currency,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      price_change_percentage_7d_in_currency: coin.price_change_percentage_7d_in_currency,
      total_volume: coin.total_volume,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply
    }));

    setCachedData(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    throw new Error('Failed to fetch cryptocurrency market data');
  }
};

// Fetch specific coin data
export const fetchCoinData = async (coinId) => {
  const cacheKey = `coin_${coinId}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await rateLimitedFetch(
      `${API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image?.large || data.image?.small,
      current_price: data.market_data?.current_price?.usd,
      market_cap: data.market_data?.market_cap?.usd,
      market_cap_rank: data.market_cap_rank,
      price_change_percentage_24h: data.market_data?.price_change_percentage_24h,
      price_change_percentage_7d: data.market_data?.price_change_percentage_7d,
      price_change_percentage_30d: data.market_data?.price_change_percentage_30d,
      total_volume: data.market_data?.total_volume?.usd,
      circulating_supply: data.market_data?.circulating_supply,
      total_supply: data.market_data?.total_supply,
      max_supply: data.market_data?.max_supply,
      description: data.description?.en
    };

    setCachedData(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching coin data:', error);
    throw new Error(`Failed to fetch data for ${coinId}`);
  }
};

// Fetch historical price data for charts
export const fetchCoinHistory = async (coinId, days = 7, interval = 'daily') => {
  const cacheKey = `history_${coinId}_${days}_${interval}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await rateLimitedFetch(
      `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = {
      prices: data.prices?.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp),
        price: price,
        date: new Date(timestamp).toLocaleDateString()
      })) || [],
      market_caps: data.market_caps?.map(([timestamp, market_cap]) => ({
        timestamp: new Date(timestamp),
        market_cap: market_cap
      })) || [],
      total_volumes: data.total_volumes?.map(([timestamp, volume]) => ({
        timestamp: new Date(timestamp),
        volume: volume
      })) || []
    };

    setCachedData(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching coin history:', error);
    throw new Error(`Failed to fetch price history for ${coinId}`);
  }
};

// Search coins
export const searchCoins = async (query) => {
  if (!query || query.length < 2) {
    return [];
  }

  const cacheKey = `search_${query.toLowerCase()}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await rateLimitedFetch(
      `${API_BASE_URL}/search?query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = data.coins?.slice(0, 10).map(coin => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      thumb: coin.thumb,
      market_cap_rank: coin.market_cap_rank
    })) || [];

    setCachedData(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error searching coins:', error);
    throw new Error('Failed to search cryptocurrencies');
  }
};

// Fetch trending coins
export const fetchTrendingCoins = async () => {
  const cacheKey = 'trending_coins';
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await rateLimitedFetch(`${API_BASE_URL}/search/trending`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = data.coins?.map(({ item }) => ({
      id: item.id,
      name: item.name,
      symbol: item.symbol.toUpperCase(),
      thumb: item.thumb,
      market_cap_rank: item.market_cap_rank,
      price_btc: item.price_btc
    })) || [];

    setCachedData(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    throw new Error('Failed to fetch trending cryptocurrencies');
  }
};

// Fetch global market data
export const fetchGlobalData = async () => {
  const cacheKey = 'global_data';
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await rateLimitedFetch(`${API_BASE_URL}/global`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = {
      total_market_cap: data.data?.total_market_cap?.usd,
      total_volume: data.data?.total_volume?.usd,
      market_cap_percentage: data.data?.market_cap_percentage,
      active_cryptocurrencies: data.data?.active_cryptocurrencies,
      markets: data.data?.markets,
      market_cap_change_percentage_24h_usd: data.data?.market_cap_change_percentage_24h_usd
    };

    setCachedData(cacheKey, formattedData);
    return formattedData;
  } catch (error) {
    console.error('Error fetching global data:', error);
    throw new Error('Failed to fetch global market data');
  }
};

// Clear cache function
export const clearCache = () => {
  cache.clear();
};

// Get cache size for debugging
export const getCacheSize = () => {
  return cache.size;
};