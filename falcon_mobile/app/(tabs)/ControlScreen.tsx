import React, { useEffect, useState } from 'react';
import { getServerIP } from '../../utils/getServerIP';
import { Alert, Button, StyleSheet, View, Text } from 'react-native';

const IP_NODEMCU = getServerIP();

export default function ControlScreen() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');

  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    const dados = {
      comando,
      origem: 'Falcon Mobile',
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
        throw new Error(`Erro HTTP: ${resposta.status}\nResposta: ${JSON.stringify(resposta.json(), null, 2)}`);
      }

      const resultado = await resposta.json();
      Alert.alert('Resposta da Vespa(ESP32)', JSON.stringify(resultado, null, 2));
    } catch (erro) {
      Alert.alert('Erro de comunicação', (erro as Error).message);
    }
  };

  const buscarDadoSerial = async () => {
    try {
      const resposta = await fetch(`${IP_NODEMCU}/api/dados_vespa`);

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} (${resposta.statusText})`);
      }

      const contentType = resposta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const texto = await resposta.text();
        throw new Error(`Resposta inesperada (não-JSON): ${texto}`);
      }

      const json = await resposta.json();
      setDadoSerial(json.dado || 'Sem dado');
    }
    catch (err) {
      if (err instanceof Error) {
        setDadoSerial('Erro ao buscar dado: ' + err.message);
      } else {
        setDadoSerial('Erro desconhecido ao buscar dado');
      }
    }    
  };

  useEffect(() => {
    const intervalo = setInterval(buscarDadoSerial, 2000); // a cada 2 segundos
    return () => clearInterval(intervalo);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>
      <Text style={styles.serialText}>Dado da Vespa: {dadoSerial}</Text>
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