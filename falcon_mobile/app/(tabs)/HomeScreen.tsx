import React, { useEffect, useRef, useState } from 'react';
import { getServerIP } from '../../utils/getServerIP';
import { Alert, StyleSheet, View, Text, ScrollView } from 'react-native';
import { LineChart, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';

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
  const [dados, setDados] = useState<number[]>([]);
  const [dadoAtual, setDadoAtual] = useState<string>('---');
  const alertaExibido = useRef(false);

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
      const distancia = parseFloat(json?.distancia ?? 'NaN');

      if (!isNaN(distancia)) {
        setDados((prev) => {
          const novo = [...prev, distancia];
          return novo.length > 20 ? novo.slice(novo.length - 20) : novo;
        });
        setDadoAtual(distancia.toFixed(2) + ' cm');
      } else {
        throw new Error('Valor inválido recebido');
      }

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

      setDadoAtual('Erro');
    }
  };

  useEffect(() => {
    const intervalo = setInterval(buscarDadoSerial, 2000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>
      <Text style={styles.serialText}>Distância atual: {dadoAtual}</Text>

      <View style={styles.graficoContainer}>
        <Text style={styles.graficoTitulo}>Gráfico de Distância (últimos 20 valores)</Text>
        <LineChart
          style={styles.grafico}
          data={dados}
          svg={{ stroke: '#007AFF', strokeWidth: 2 }}
          contentInset={{ top: 20, bottom: 20 }}
          curve={shape.curveNatural}
        >
          <Grid />
        </LineChart>
      </View>
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
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  graficoContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  graficoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  grafico: {
    height: 200,
    width: '100%',
  },
});