const express = require('express');
const axios = require('axios'); 
const cors = require('cors'); 

const app = express();
app.use(cors());

// --- Variáveis de Cache ---
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_SECONDS = 60; 
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d';

app.get('/api/coins', async (req, res) => {
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < (CACHE_DURATION_SECONDS * 1000)) {
        return res.json(cachedData);
    }

    try {
        const response = await axios.get(COINGECKO_URL);
        cachedData = response.data;
        cacheTimestamp = now;
        res.json(cachedData);
    } catch (error) {
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        res.status(500).json({ error: 'Falha ao buscar CoinGecko e cache vazio.' });
    }
});

app.get('/', (req, res) => {
    res.send('BitBubbles Proxy está online e esperando chamadas para /api/coins.');
});

// EXPORTAÇÃO CRÍTICA PARA O VERVEL
module.exports = app;
