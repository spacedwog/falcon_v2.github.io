import React, { useState, useRef } from 'react';
import { getServerIP } from '../../utils/getServerIP';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';

export default function Index() {
  const [status, setStatus] = useState('');
  const [distancia, setDistancia] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const alertaErroExibido = useRef(false);

  const FALCON_WIFI = getServerIP();
  const TIMEOUT_MS = 4000;

  // fetch com timeout usando AbortController
  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = TIMEOUT_MS) => {
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

  const mostrarErro = (mensagem: string) => {
    if (!alertaErroExibido.current) {
      Alert.alert('Erro', mensagem);
      alertaErroExibido.current = true;
    }
  };

  const enviarComando = async (comando: 'ligar' | 'desligar') => {
    setCarregando(true);
    try {
      const resposta = await fetchWithTimeout(`${FALCON_WIFI}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comando }),
      });

      if (!resposta.ok) {
        const texto = await resposta.text();
        throw new Error(`Erro HTTP ${resposta.status}: ${texto}`);
      }

      const json = await resposta.json();
      const respostaStatus = json.status || json.erro || 'Comando enviado com sucesso';
      setStatus(respostaStatus);
      Alert.alert('Vespa', respostaStatus);
      alertaErroExibido.current = false; // Reset alerta após sucesso
    } catch (err) {
      setStatus('Erro na conexão');
      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))) {
        mostrarErro('Tempo de requisição esgotado. Verifique a conexão com a Vespa.');
      } else {
        mostrarErro('Não foi possível conectar à Vespa.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const lerDistancia = async () => {
    setCarregando(true);
    try {
      const resposta = await fetchWithTimeout(`${FALCON_WIFI}/api/distancia`);

      if (!resposta.ok) {
        const texto = await resposta.text();
        throw new Error(`Erro HTTP ${resposta.status}: ${texto}`);
      }

      const json = await resposta.json();

      if (typeof json.distancia_cm === 'number') {
        setDistancia(json.distancia_cm);
        setStatus('Distância lida com sucesso');
        alertaErroExibido.current = false; // Reset alerta após sucesso
      } else {
        setDistancia(null);
        setStatus(json.erro || 'Valor inválido recebido');
      }
    } catch (err) {
      setDistancia(null);
      setStatus('Erro ao ler distância');
      if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('abort'))) {
        mostrarErro('Tempo de requisição esgotado. Verifique a conexão com a Vespa.');
      } else {
        mostrarErro('Não foi possível ler a distância da Vespa.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle via Vespa (ESP32) + Sensor Ultrassônico</Text>

      <View style={styles.buttonGroup}>
        <Button title="Ligar Sensor" onPress={() => enviarComando('ligar')} disabled={carregando} />
        <View style={{ marginVertical: 10 }} />
        <Button title="Desligar Sensor" onPress={() => enviarComando('desligar')} disabled={carregando} />
        <View style={{ marginVertical: 10 }} />
        <Button title="Ler Distância" onPress={lerDistancia} disabled={carregando} />
      </View>

      {carregando && <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />}

      <Text style={styles.status}>Status: {status || 'Aguardando...'}</Text>

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