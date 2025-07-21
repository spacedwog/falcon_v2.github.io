import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { LineChart, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { getServerIP } from '../../utils/getServerIP';

const FALCON_WIFI = getServerIP();

export default function DataScienceScreen() {
  const [dados, setDados] = useState<number[]>([]);
  const [timestamp, setTimestamp] = useState<string[]>([]);

  const buscarDados = async () => {
    try {
      const resposta = await fetch(`${FALCON_WIFI}/api/data-science`);
      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status}`);
      }

      const json = await resposta.json();

      // Exemplo de formato esperado: { valores: [10, 20, 30], timestamps: ["12:00", "12:01", "12:02"] }
      setDados(json.valores || []);
      setTimestamp(json.timestamps || []);
    } catch (err) {
      Alert.alert('Erro ao buscar dados', err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  useEffect(() => {
    buscarDados();
    const intervalo = setInterval(buscarDados, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Análise de Dados (ESP32)</Text>

      <LineChart
        style={{ height: 200, width: '100%' }}
        data={dados}
        svg={{ stroke: '#007AFF' }}
        contentInset={{ top: 20, bottom: 20 }}
        curve={shape.curveNatural}
      >
        <Grid />
      </LineChart>

      <View style={styles.labelContainer}>
        {timestamp.map((label, index) => (
          <Text key={index} style={styles.label}>
            {label}
          </Text>
        ))}
      </View>

      <Button title="Atualizar Dados" onPress={buscarDados} color="#1E90FF" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 12,
  },
  label: {
    fontSize: 12,
    marginHorizontal: 4,
    color: '#666',
  },
});