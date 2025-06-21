// HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, View, Text } from 'react-native';

// IP da VESPA (ESP32) em modo Access Point ou Station (ajuste conforme necessário)
const IP_NODEMCU = "http://192.168.4.1"; // ou http://192.168.0.x se estiver na rede do roteador

export default function App() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');

  // Função para enviar comando 'ligar' ou 'desligar' ao ESP32
  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    const dados = {
      comando,
      origem: 'ReactNativeApp',
      timestamp: new Date().toISOString(),
    };

    try {
      const resposta = await fetch(`${IP_NODEMCU}/api/comando`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`);
      }

      const resultado = await resposta.json();
      Alert.alert('Resposta do ESP32', JSON.stringify(resultado, null, 2));
    } catch (erro) {
      Alert.alert('Erro de comunicação', (erro as Error).message);
    }
  };

  // Função que busca o dado serial do ESP32
  const buscarDadoSerial = async () => {
    try {
      const resposta = await fetch(`${IP_NODEMCU}/api/dados`);
      const json = await resposta.json();
      setDadoSerial(json.dado || 'Sem dado');
    } catch (err) {
      setDadoSerial('Erro');
    }
  };

  // Efeito que atualiza a cada 2 segundos
  useEffect(() => {
    const intervalo = setInterval(buscarDadoSerial, 2000); // a cada 2 segundos
    return () => clearInterval(intervalo);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>
      <Text style={styles.serialText}>Dado da COM3: {dadoSerial}</Text>

      <View style={{ height: 16 }} />
      <Button title="Ligar LED" onPress={() => enviarComando('ligar')} />
      <View style={{ height: 16 }} />
      <Button title="Desligar LED" onPress={() => enviarComando('desligar')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F0F8FF',
  },
  ipText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    color: '#555',
  },
  serialText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#222',
  },
});