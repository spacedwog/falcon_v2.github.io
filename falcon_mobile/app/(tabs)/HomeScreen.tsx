import React from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

// Altere o IP conforme o modo de operação do ESP32:
// - Modo AP: 'http://192.168.4.1'
// - Modo STA: 'http://192.168.x.x' (conectado à rede Wi-Fi local)
const IP_NODEMCU = 'http://<IP_LOCAL>:3000'; // Dispositivo físico real (com Wi-Fi)

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
});