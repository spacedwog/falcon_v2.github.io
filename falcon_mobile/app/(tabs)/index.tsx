// app/index.tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function Index() {
  const [status, setStatus] = useState('');

  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    try {
      const resposta = await fetch('http://192.168.15.166:3000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comando }),
      });

      const json = await resposta.json();
      setStatus(json.status || json.erro);
    } catch (err) {
      setStatus('Erro na conexão');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Controle via Nodemcu(esp8266) + PowerShell</Text>
      <Button title="Ligar" onPress={() => enviarComando('ligar')} />
      <Button title="Desligar" onPress={() => enviarComando('desligar')} />
      <Text style={{ marginTop: 20 }}>{status}</Text>
    </View>
  );
}