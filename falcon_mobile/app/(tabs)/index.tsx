import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator } from 'react-native';

export default function Index() {
  const [status, setStatus] = useState('');
  const [distancia, setDistancia] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  const IP_VESPA = 'http://192.168.4.1:3000';

  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    setCarregando(true);
    try {
      const resposta = await fetch(`${IP_VESPA}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comando }),
      });

      const json = await resposta.json();
      setStatus(json.status || json.erro || 'Comando enviado');
    } catch (err) {
      setStatus('Erro na conexão');
    } finally {
      setCarregando(false);
    }
  };

  const lerDistancia = async () => {
    setCarregando(true);
    try {
      const resposta = await fetch(`${IP_VESPA}/api/distancia`);
      const json = await resposta.json();

      if (typeof json.distancia_cm === 'number') {
        setDistancia(json.distancia_cm);
        setStatus('Distância lida com sucesso');
      } else {
        setDistancia(null);
        setStatus(json.erro || 'Valor inválido recebido');
      }
    } catch (err) {
      setDistancia(null);
      setStatus('Erro ao ler distância');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Controle via Vespa (ESP32) + Sensor Ultrassônico
      </Text>

      <View style={styles.buttonGroup}>
        <Button title="Ligar Sensor" onPress={() => enviarComando('ligar')} disabled={carregando} />
        <Button title="Desligar Sensor" onPress={() => enviarComando('desligar')} disabled={carregando} />
        <View style={{ marginVertical: 10 }} />
        <Button title="Ler Distância" onPress={lerDistancia} disabled={carregando} />
      </View>

      {carregando && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}

      <Text style={styles.status}>
        Status: {status || 'Aguardando...'}
      </Text>

      <Text style={styles.distancia}>
        Distância: {distancia !== null ? `${distancia.toFixed(2)} cm` : '---'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonGroup: {
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    color: '#333',
  },
  distancia: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});