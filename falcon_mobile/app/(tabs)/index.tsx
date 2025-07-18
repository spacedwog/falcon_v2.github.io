// app/index.tsx
import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';

export default function Index() {
  const [status, setStatus] = useState('');
  const [distancia, setDistancia] = useState<number | null>(null);

  const IP_VESPA = 'http://192.168.4.1:3000';

  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    try {
      const resposta = await fetch(`${IP_VESPA}/`, {
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

  const lerDistancia = async () => {
    try {
      const resposta = await fetch(`${IP_VESPA}/api/distancia`);
      const json = await resposta.json();
      setDistancia(json.distancia_cm);
    } catch (err) {
      setDistancia(null);
      setStatus('Erro ao ler distância');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>
        Controle via Vespa (ESP32) + Sensor Ultrassônico
      </Text>

      <Button title="Ligar" onPress={() => enviarComando("ligar")} />
      <Button title="Desligar" onPress={() => enviarComando("desligar")} />
      <View style={{ marginVertical: 10 }} />

      <Button title="Ler Distância" onPress={lerDistancia} />

      <Text style={{ marginTop: 20 }}>
        Status: {status || 'Aguardando...'}
      </Text>

      <Text style={{ marginTop: 10 }}>
        Distância: {distancia !== null ? `${distancia.toFixed(2)} cm` : '---'}
      </Text>
    </View>
  );
}