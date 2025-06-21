import React from 'react';
import { getServerIP } from '../../utils/getServerIP'; // helper criado
import { Alert, Button, StyleSheet, View, Text } from 'react-native'; // ✅ importe correto

const IP_NODEMCU = getServerIP();

export default function App() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
});