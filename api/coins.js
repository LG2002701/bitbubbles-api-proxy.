const axios = require('axios');

let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_SECONDS = 60;

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d';

module.exports = async (req, res) => {
  // 🔥 ADICIONE ESTES HEADERS CORS:
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Permite apenas requisições GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  const now = Date.now();

  // Retorna dados do cache se ainda forem válidos
  if (cachedData && now - cacheTimestamp < CACHE_DURATION_SECONDS * 1000) {
    // Adiciona headers de cache para o cliente também
    res.setHeader('Cache-Control', 'public, max-age=30');
    return res.status(200).json(cachedData);
  }

  try {
    const response = await axios.get(COINGECKO_URL, {
      headers: {
        'User-Agent': 'BitBubbles/1.0',
        'Accept': 'application/json'
      }
    });
    
    cachedData = response.data;
    cacheTimestamp = now;
    
    // Headers de cache para o cliente
    res.setHeader('Cache-Control', 'public, max-age=30');
    
    return res.status(200).json(cachedData);
  } catch (error) {
    console.error('Erro na API CoinGecko:', error.message);
    
    // Se tiver dados em cache (mesmo expirados), retorna eles
    if (cachedData) {
      console.log('Retornando dados expirados do cache devido a erro na API');
      res.setHeader('Cache-Control', 'public, max-age=5'); // Cache curto para dados expirados
      return res.status(200).json(cachedData);
    }
    
    return res.status(500).json({ 
      error: 'Erro ao buscar dados da CoinGecko',
      message: error.message 
    });
  }
};
