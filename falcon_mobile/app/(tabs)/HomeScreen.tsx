import React, { useEffect, useRef, useState } from 'react';
import { getServerIP } from '../../utils/getServerIP';
import { Alert, StyleSheet, ScrollView, Text } from 'react-native';

const FALCON_WIFI = getServerIP();

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 3000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export default function HomeScreen() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');
  const alertaExibido = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const buscarDadoSerial = async () => {
      try {
        const resposta = await fetchWithTimeout(`${FALCON_WIFI}/api/distancia`, {}, 3000);

        if (!resposta.ok) {
          throw new Error(`Erro HTTP ${resposta.status} (${resposta.statusText})`);
        }

        const contentType = resposta.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const texto = await resposta.text();
          throw new Error(`Resposta inesperada (não-JSON): ${texto}`);
        }

        const json = await resposta.json();
        if (isMounted) {
          setDadoSerial(JSON.stringify(json, null, 2));
          alertaExibido.current = false; // reset após sucesso
        }
      } catch (err) {
        if (isMounted && !alertaExibido.current) {
          if (err instanceof Error) {
            if (err.name === 'AbortError' || err.message.includes('Timeout')) {
              Alert.alert('Erro de conexão', 'Tempo de requisição esgotado. Verifique a conexão com o ESP32.');
            } else {
              Alert.alert('Erro ao buscar dado', err.message);
            }
          } else {
            Alert.alert('Erro desconhecido ao buscar dado');
          }
          alertaExibido.current = true;
          setDadoSerial('Erro');
        }
      }
    };

    buscarDadoSerial();
    const intervalo = setInterval(buscarDadoSerial, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalo);
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.ipText}>Conectando a: {FALCON_WIFI}</Text>
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