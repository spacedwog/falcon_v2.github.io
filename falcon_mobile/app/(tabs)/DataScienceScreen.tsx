import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getServerIP } from '../../utils/getServerIP';

const screenWidth = Dimensions.get('window').width;
const FALCON_WIFI = getServerIP();

export default function DataScienceScreen() {
  const [valores, setValores] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);

  const buscarDados = async () => {
    try {
      const res = await fetch(`${FALCON_WIFI}/api/data-science`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setValores(json.valores || []);
      setTimestamps(json.timestamps || []);
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  useEffect(() => {
    buscarDados();
    const intervalo = setInterval(buscarDados, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Análise de Dados - Falcon</Text>

      {valores.length > 0 ? (
        <LineChart
          data={{
            labels: timestamps.map((label, index) =>
              index % 2 === 0 ? label : ''
            ),
            datasets: [{ data: valores }],
          }}
          width={screenWidth - 40}
          height={320}
          fromZero={true} // começa o eixo Y do zero
          yAxisSuffix="cm"
          yAxisInterval={1} // espaçamento de 1 unidade entre os valores do eixo Y
          yLabelsOffset={10} // desloca horizontalmente os rótulos do eixo Y
          chartConfig={{
            backgroundColor: '#f0f8ff',
            backgroundGradientFrom: '#e6f2ff',
            backgroundGradientTo: '#cce6ff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForHorizontalLabels: {
              rotation: 0,
              fontSize: 10,
            },
            propsForVerticalLabels: {
              fontSize: 12,
              fontWeight: 'bold',
            },
          }}
          style={{ borderRadius: 16, marginVertical: 10 }}
          horizontalLabelRotation={45}
        />
      ) : (
        <Text style={{ color: '#888', marginTop: 20 }}>Aguardando dados do ESP32...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 80,
    backgroundColor: '#F0F8FF',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});