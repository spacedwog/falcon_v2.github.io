// vespa-bridge.js (Wi-Fi version)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch'); // npm install node-fetch@2

const app = express();
const porta = 3000;

// IP do ESP32 (ajuste conforme necessário)
const IP_ESP32 = 'http://192.168.15.166:3000';

app.use(cors());
app.use(bodyParser.json());

let ultimoDadoESP = 'Sem dados ainda';

// Rota padrão
app.get('/', (req, res) => {
  res.send('🌐 API Vespa Wi-Fi Bridge rodando. Use /api/comando ou /api/dados_vespa');
});

// Enviar comando para ESP32 via Wi-Fi
app.post('/api/comando', async (req, res) => {
  const { comando } = req.body;

  if (!['ligar', 'desligar'].includes(comando)) {
    return res.status(400).json({ erro: 'Comando inválido. Use "ligar" ou "desligar".' });
  }

  const dados = {
    comando,
    origem: 'Vespa Bridge (Node.js)',
    timestamp: new Date().toISOString(),
  };

  try {
    const resposta = await fetch(`${IP_ESP32}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) {
      const texto = await resposta.text();
      throw new Error(`Erro HTTP ${resposta.status}: ${texto}`);
    }

    const json = await resposta.json();
    res.json({ status: 'Comando enviado com sucesso', retorno: json });
  } catch (erro) {
    console.error('❌ Erro ao enviar comando para ESP:', erro.message);
    res.status(500).json({ erro: 'Falha na comunicação com ESP32' });
  }
});

// Buscar dados do ESP32
app.get('/api/dados_vespa', async (req, res) => {
  try {
    const resposta = await fetch(`${IP_ESP32}/api/dados_vespa`);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}`);
    }

    const json = await resposta.json();
    ultimoDadoESP = json.dado || 'Sem dado';
    res.json({ dado: ultimoDadoESP });
  } catch (erro) {
    console.error('❌ Erro ao buscar dados do ESP:', erro.message);
    res.status(500).json({ erro: 'Falha ao buscar dados do ESP32' });
  }
});

// Inicia o servidor local
app.listen(porta, () => {
  console.log(`🚀 Servidor Wi-Fi rodando em http://localhost:${porta}`);
});