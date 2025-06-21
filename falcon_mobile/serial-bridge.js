const express = require('express');
const SerialPort = require('serialport');
const bodyParser = require('body-parser');

const app = express();
const porta = 3000;

// Altere a porta conforme necessário
const serial = new SerialPort('COM3', {
  baudRate: 115200,
});

serial.on('open', () => {
  console.log('✅ Conectado à COM3');
});

serial.on('error', (err) => {
  console.error('❌ Erro serial:', err.message);
});

app.use(bodyParser.json());

app.post('/api/comando', (req, res) => {
  const { comando } = req.body;
  if (!comando || (comando !== 'ligar' && comando !== 'desligar')) {
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

app.listen(porta, () => {
  console.log(`🚀 Servidor HTTP escutando em http://localhost:${porta}`);
});