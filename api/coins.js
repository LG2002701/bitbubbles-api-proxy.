import axios from 'axios';

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd' +
  '&order=market_cap_desc' +
  '&per_page=50' +
  '&page=1' +
  '&sparkline=false' +
  '&price_change_percentage=1h%2C24h%2C7d';

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 60s

export default async function handler(req, res) {
  // ✅ CORS — ISSO É O QUE FALTAVA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const now = Date.now();

  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    return res.status(200).json(cachedData);
  }

  try {
    const response = await axios.get(COINGECKO_URL);
    cachedData = response.data;
    cacheTimestamp = now;
    return res.status(200).json(cachedData);
  } catch (error) {
    if (cachedData) {
      return res.status(200).json(cachedData);
    }
    return res.status(500).json({ error: 'Erro ao buscar CoinGecko' });
  }
}
