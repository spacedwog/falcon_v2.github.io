const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const porta = 3000;

app.use(cors());

app.get('/ps', (req, res) => {
  exec('powershell.exe "Get-Process | Sort-Object CPU -Descending | Select-Object -First 3"', (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ output: stderr });
    }
    res.json({ output: stdout });
  });
});

app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});