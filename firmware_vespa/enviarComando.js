const axios = require('axios');

// Substitua pelo IP real do seu ESP32
const IP_DO_ESP32 = 'http://192.168.15.8:3000';

async function enviarComando(comando) {
  try {
    if (!['ligar', 'desligar'].includes(comando)) {
      console.error('❌ Comando inválido. Use "ligar" ou "desligar".');
      return;
    }

    const corpo = {
      comando: comando,
      origem: 'nodejs',
      timestamp: new Date().toISOString()
    };

    const resposta = await axios.post(`${IP_DO_ESP32}/`, corpo, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resposta do ESP32:', resposta.data);
  } catch (erro) {
    console.error('❌ Erro ao enviar comando:', erro.message);
  }
}

// Exemplo de uso:
enviarComando('ligar'); // ou 'desligar'