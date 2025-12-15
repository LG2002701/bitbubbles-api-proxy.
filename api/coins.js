const axios = require('axios');

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_SECONDS = 60;

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d';

module.exports = async (req, res) => {
  const now = Date.now();

  if (cachedData && now - cacheTimestamp < CACHE_DURATION_SECONDS * 1000) {
    return res.status(200).json(cachedData);
  }

  try {
    const response = await axios.get(COINGECKO_URL);
    cachedData = response.data;
    cacheTimestamp = now;
    res.status(200).json(cachedData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar CoinGecko' });
  }
};
