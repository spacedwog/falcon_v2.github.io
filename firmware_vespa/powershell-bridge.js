const express = require('express');
const { SerialPort } = require('serialport');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Inicialização da porta serial
const portaSerial = new SerialPort({
  path: 'COM3',
  baudRate: 115200,
  autoOpen: false,
});

// Abrir porta serial
portaSerial.open((err) => {
  if (err) {
    return console.error('Erro ao abrir COM4:', err.message);
  }
  console.log('✅ Porta serial COM5 aberta com sucesso!');
});

// Monitoramento
portaSerial.on('data', (data) => {
  console.log('📥 Dados recebidos da serial:', data.toString());
});

// Rota padrão para GET /
app.get('/', (req, res) => {
  res.send('🛠️ API Vespa Bridge rodando. Use /api/comando ou /api/dados_vespa');
});

// API POST para enviar comando
app.post('/api/comando', (req, res) => {
  const { comando } = req.body;

  if (comando === 'ligar') {
    exec('powershell.exe "Start-Process notepad"', (err) => {
      if (err) {
        console.error('Erro ao executar PowerShell:', err);
      }
    });
  }

  if (!['ligar', 'desligar'].includes(comando)) {
    return res.status(400).json({ erro: 'Comando inválido' });
  }

  const mensagem = comando === 'ligar' ? 'L' : 'D';

  portaSerial.write(mensagem, (err) => {
    if (err) {
      console.error('Erro ao escrever na serial:', err.message);
      return res.status(500).json({ erro: 'Erro ao enviar comando' });
    }

    console.log(`📤 Comando "${comando}" enviado via serial (${mensagem})`);
    res.json({ status: 'Comando enviado', comando });
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor HTTP rodando em http://localhost:${port}`);
});