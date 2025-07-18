import React, { useEffect, useRef, useState } from 'react';
import { getServerIP } from '../../utils/getServerIP';
import { Alert, StyleSheet, View, Text, ScrollView } from 'react-native';

const IP_NODEMCU = getServerIP();

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 3000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout na requisição')), timeout)
    )
  ]) as Promise<Response>;
};

export default function HomeScreen() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');
  const alertaExibido = useRef(false); // <- controle de alerta

  const buscarDadoSerial = async () => {
    try {
      const resposta = await fetchWithTimeout(`${IP_NODEMCU}/api/distancia`, {}, 3000);

      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} (${resposta.statusText})`);
      }

      const contentType = resposta.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const texto = await resposta.text();
        throw new Error(`Resposta inesperada (não-JSON): ${texto}`);
      }

      const json = await resposta.json();
      setDadoSerial(JSON.stringify(json, null, 2));

    } catch (err) {
      if (!alertaExibido.current) {
        if (err instanceof Error) {
          if (err.message.includes('Timeout')) {
            Alert.alert('Erro de conexão', 'Tempo de requisição esgotado. Verifique a conexão com o ESP32.');
          } else {
            Alert.alert('Erro ao buscar dado', err.message);
          }
        } else {
          Alert.alert('Erro desconhecido ao buscar dado');
        }
        alertaExibido.current = true;
      }

      setDadoSerial('Erro');
    }
  };

  useEffect(() => {
    const intervalo = setInterval(buscarDadoSerial, 2000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>
      <Text style={styles.serialText}>Dado da Vespa: {dadoSerial}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 80,
    backgroundColor: '#F0F8FF',
    flexGrow: 1,
    justifyContent: 'center',
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