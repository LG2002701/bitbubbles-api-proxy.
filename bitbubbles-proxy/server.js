const express = require('express');
const axios = require('axios'); // Usando axios para fetch
const cors = require('cors'); 

const app = express();

// Configuração CORS: Permite o acesso do seu front-end na Hostinger
app.use(cors());

// --- Variáveis de Cache ---
let cachedData = null;
let cacheTimestamp = 0;
// Duração do cache: 60 segundos
const CACHE_DURATION_SECONDS = 60; 

// URL da API CoinGecko que você usa
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d';

/**
 * Endpoint principal que o seu site irá chamar: /api/coins
 */
app.get('/api/coins', async (req, res) => {
    // 1. Verificar o Cache
    const now = Date.now();
    // Se tivermos dados e eles não tiverem expirado
    if (cachedData && (now - cacheTimestamp) < (CACHE_DURATION_SECONDS * 1000)) {
        console.log('Cache hit: Retornando dados em cache.');
        return res.json(cachedData);
    }

    // 2. Cache Miss: Buscar novos dados
    console.log('Cache miss: Buscando novos dados da CoinGecko...');
    try {
        const response = await axios.get(COINGECKO_URL);
        const data = response.data; // Axios retorna os dados em .data

        // 3. Atualizar Cache e Timestamp
        cachedData = data;
        cacheTimestamp = now;
        
        // 4. Retornar dados frescos
        res.json(data);

    } catch (error) {
        console.error('Erro de rede/servidor:', error);
        
        // Em caso de erro de rede, fallback para cache antigo
        if (cachedData) {
            console.warn('Erro na busca da API. Retornando dados antigos do cache.');
            return res.status(200).json(cachedData);
        }
        
        // Se não houver cache, falha
        res.status(500).json({ error: 'Falha ao buscar CoinGecko e cache vazio.' });
    }
});

// Endpoint de saúde do servidor (para verificar se está rodando)
app.get('/', (req, res) => {
    res.send('BitBubbles Proxy está online e esperando chamadas para /api/coins.');
});


// Mude AQUI: Removemos a variável PORT e a URL localhost, que causam conflito no Vercel.
app.listen(3000, () => {
    console.log('Proxy rodando e pronto para receber requisições do Vercel.');
});

// Exporta o aplicativo para o Vercel Serverless
module.exports = app;
