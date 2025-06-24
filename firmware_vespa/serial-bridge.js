const express = require('express');
const { SerialPort } = require('serialport');
const bodyParser = require('body-parser');

const app = express();
const porta = 3000;

let ultimoDadoSerial = ''; // Armazena o último dado recebido

const serial = new SerialPort({
  path: 'COM3',
  baudRate: 115200,
});

serial.on('open', () => {
  console.log('✅ Conectado à COM3');
});

serial.on('data', (data) => {
  const texto = data.toString().trim();
  console.log('📥 Dado recebido:', texto);
  ultimoDadoSerial = texto;
});

serial.on('error', (err) => {
  console.error('❌ Erro serial:', err.message);
});

app.use(bodyParser.json());

app.post('/api/comando', (req, res) => {
  const { comando } = req.body;
  if (!['ligar', 'desligar'].includes(comando)) {
    return res.status(400).json({ erro: 'Comando inválido' });
  }

  const sinal = comando === 'ligar' ? 'L' : 'D';

  serial.write(sinal, (err) => {
    if (err) {
      console.error('Erro ao enviar para serial:', err);
      return res.status(500).json({ erro: 'Falha na comunicação serial' });
    }
    res.json({ status: 'Comando enviado', comando });
  });
});

// ✅ Novo endpoint para o app React Native buscar os dados da serial
app.get('/api/dados', (req, res) => {
  res.json({ dado: ultimoDadoSerial });
});

// Endpoint GET: retorna o último dado recebido da placa
app.get('/api/dados_vespa', (req, res) => {
  res.json({ dado: ultimoDadoSerial || 'Sem dados ainda' });
});

app.listen(porta, () => {
  console.log(`🚀 Servidor HTTP rodando em http://localhost:${porta}`);
});