const express = require('express');
const { SerialPort } = require('serialport');
const bodyParser = require('body-parser');

const app = express();
const porta = 3000;

const serial = new SerialPort({
  path: 'COM3',
  baudRate: 115200,
});

serial.on('open', () => {
  console.log('✅ Conectado à COM3');
});

serial.on('error', (err) => {
  console.error('❌ Erro serial:', err.message);
});

app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Servidor serial ativo. Use POST /api/comando');
});

app.post('/api/comando', (req, res) => {
  const { comando } = req.body;
  if (!['ligar', 'desligar'].includes(comando)) {
    return res.status(400).json({ erro: 'Comando inválido' });
  }

  const sinal = comando === 'ligar' ? '1' : '0';

  serial.write(sinal, (err) => {
    if (err) {
      console.error('Erro ao enviar para serial:', err);
      return res.status(500).json({ erro: 'Falha na comunicação serial' });
    }
    res.json({ status: 'Comando enviado', comando });
  });
});

app.get('/api/comando', (req, res) => {
  res.status(405).send('Use POST para enviar comandos.');
});

app.listen(porta, () => {
  console.log(`🚀 Servidor HTTP escutando em http://localhost:${porta}`);
});