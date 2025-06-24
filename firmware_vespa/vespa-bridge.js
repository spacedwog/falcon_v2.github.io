// vespa-bridge.js

const express = require('express');
const { SerialPort } = require('serialport');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const porta = 3000;

let ultimoDadoSerial = ''; // Armazena o último dado recebido da serial

// Ativa o CORS para permitir requisições de apps externos
app.use(cors());

// Middleware para processar JSON no corpo das requisições
app.use(bodyParser.json());

// Configuração da porta serial (ajuste 'COM4' conforme necessário no seu sistema)
const serial = new SerialPort({
  path: 'COM4',
  baudRate: 115200,
});

// Evento: porta serial conectada
serial.on('open', () => {
  console.log('✅ Conectado à COM4');
});

// Evento: dado recebido da serial
serial.on('data', (data) => {
  const texto = data.toString().trim();
  console.log('📥 Dado recebido:', texto);
  ultimoDadoSerial = texto;
});

// Evento: erro na porta serial
serial.on('error', (err) => {
  console.error('❌ Erro serial:', err.message);
});

// Endpoint POST: envia comando à placa
app.post('/api/comando', (req, res) => {
  const { comando } = req.body;

  if (!['ligar', 'desligar'].includes(comando)) {
    return res.status(400).json({ erro: 'Comando inválido. Use "ligar" ou "desligar".' });
  }

  const sinal = comando === 'ligar' ? 'L' : 'D';

  serial.write(sinal, (err) => {
    if (err) {
      console.error('❌ Erro ao enviar para a serial:', err);
      return res.status(500).json({ erro: 'Falha na comunicação serial' });
    }

    console.log(`➡️ Comando enviado: ${sinal}`);
    res.json({ status: 'Comando enviado com sucesso', comando });
  });
});

// Endpoint GET: retorna o último dado recebido da placa
app.get('/api/dados_vespa', (req, res) => {
  res.json({ dado: ultimoDadoSerial || 'Sem dados ainda' });
});

// Inicializa o servidor HTTP
app.listen(porta, () => {
  console.log(`🚀 Servidor HTTP rodando em http://localhost:${porta}`);
});