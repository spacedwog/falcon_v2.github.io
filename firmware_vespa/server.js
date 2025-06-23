const express = require('express');
const SerialPort = require('serialport');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const portaSerial = new SerialPort('COM3', {
  baudRate: 115200,
});

portaSerial.on('open', () => {
  console.log('Conectado à COM3');
});

app.post('/api/comando', (req, res) => {
  const { comando } = req.body;

  if (!['ligar', 'desligar'].includes(comando)) {
    return res.status(400).json({ erro: 'Comando inválido' });
  }

  const mensagem = comando === 'ligar' ? '1' : '0';

  portaSerial.write(mensagem, (err) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao enviar comando' });
    }
    res.json({ status: 'Comando enviado', comando });
  });
});

app.listen(3000, () => {
  console.log('Servidor HTTP rodando em http://localhost:3000');
});