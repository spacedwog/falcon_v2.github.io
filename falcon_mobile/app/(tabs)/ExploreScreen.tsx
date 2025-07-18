import React, { useEffect, useState } from 'react';
import { getServerIP } from '../../utils/getServerIP';
import { Alert, Button, StyleSheet, View, Text } from 'react-native';

const IP_NODEMCU = getServerIP();

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 3000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout na requisição')), timeout)
    )
  ]) as Promise<Response>;
};

export default function ExploreScreen() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');
  const [estadoLed1, setEstadoLed1] = useState<number>(-1);
  const [estadoLed2, setEstadoLed2] = useState<number>(-1);

  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    const dados = {
      comando,
      origem: 'Falcon Mobile',
      timestamp: new Date().toISOString(),
    };

    try {
      const resposta = await fetchWithTimeout(`${IP_NODEMCU}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      }, 3000);

      if (!resposta.ok) {
        const erroJson = await resposta.json();
        throw new Error(`Erro HTTP: ${resposta.status}\nResposta: ${JSON.stringify(erroJson, null, 2)}`);
      }

      const resultado = await resposta.json();
      Alert.alert('Resposta da Vespa(ESP32)', JSON.stringify(resultado, null, 2));
    } catch (erro) {
      if (erro instanceof Error && erro.message.includes('Timeout')) {
        Alert.alert('Erro de conexão', 'Tempo de requisição esgotado. Verifique a conexão com o ESP32.');
      } else {
        Alert.alert('Erro de comunicação', (erro as Error).message);
      }
    }
  };

  const buscarDadoSerial = async () => {
    try {
      const resposta = await fetchWithTimeout(`${IP_NODEMCU}/api/dados_vespa`, {}, 3000);

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} (${resposta.statusText})`);
      }

      const contentType = resposta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const texto = await resposta.text();
        throw new Error(`Resposta inesperada (não-JSON): ${texto}`);
      }

      const json = await resposta.json();
      setEstadoLed1(json.led1);
      setEstadoLed2(json.led2);
      setDadoSerial(json.dado || 'Sem dado');
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Timeout')) {
          Alert.alert('Erro de conexão', 'Tempo de requisição esgotado. Verifique a conexão com o ESP32.');
        } else {
          Alert.alert('Erro ao buscar dado', err.message);
        }
        setDadoSerial('Erro ao buscar dado: ' + err.message);
        setEstadoLed1(-1);
        setEstadoLed2(-1);
      } else {
        setDadoSerial('Erro desconhecido ao buscar dado');
        setEstadoLed1(-1);
        setEstadoLed2(-1);
      }
    }
  };

  useEffect(() => {
    const intervalo = setInterval(buscarDadoSerial, 2000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>
      <Text style={styles.serialText}>Dado da Vespa: {dadoSerial}</Text>
      <Text style={styles.serialText}>
        LED1: {estadoLed1 === -1 ? '---' : estadoLed1 ? 'Ligado' : 'Desligado'}
      </Text>
      <Text style={styles.serialText}>
        LED2: {estadoLed2 === -1 ? '---' : estadoLed2 ? 'Ligado' : 'Desligado'}
      </Text>
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
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#222',
  },
});