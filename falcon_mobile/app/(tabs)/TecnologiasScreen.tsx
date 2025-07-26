import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getServerIP } from '../../utils/getServerIP';

type Comando = {
  titulo: string;
  comando: string;
  angulo?: number;
  valor?: number;
};

const ESP32_IP = getServerIP();

const comandosPorCategoria: Record<string, Comando[]> = {
  frontend: [
    { titulo: 'Iniciar UI', comando: 'ligar' },
    { titulo: 'Parar UI', comando: 'desligar' },
  ],
  backend: [
    { titulo: 'Mover Frente', comando: 'frente' },
    { titulo: 'Mover Trás', comando: 'tras' },
    { titulo: 'Parar Motor', comando: 'parar' },
  ],
  clouddev: [
    { titulo: 'Girar 90º', comando: 'girar', angulo: 90 },
    { titulo: 'Girar 180º', comando: 'girar', angulo: 180 },
  ],
  devops: [
    { titulo: 'Distância', comando: 'distancia' },
    { titulo: 'Desligar Sensor', comando: 'desligar' },
  ],
};

const jsonToXml = (json: any): string => {
  let xml = '<resposta>';
  for (const key in json) {
    xml += `<${key}>${json[key]}</${key}>`;
  }
  xml += '</resposta>';
  return xml;
};

type ListItem =
  | { type: 'categoria'; titulo: string; comandos: Comando[] }
  | { type: 'resposta' }
  | { type: 'historico' };

const TecnologiasScreen = () => {
  const [resposta, setResposta] = useState('');
  const [historico, setHistorico] = useState<string[]>([]);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    const loadHistorico = async () => {
      const data = await AsyncStorage.getItem('historicoComandos');
      if (data) setHistorico(JSON.parse(data));
    };

    const testarConexao = async () => {
      try {
        const res = await fetch(`${ESP32_IP}/ping`);
        if (res.ok) setConectado(true);
        else setConectado(false);
      } catch {
        setConectado(false);
      }
    };

    loadHistorico();
    testarConexao();
  }, []);

  const salvarHistorico = async (comando: string) => {
    const novoHistorico = [comando, ...historico.slice(0, 19)];
    setHistorico(novoHistorico);
    await AsyncStorage.setItem('historicoComandos', JSON.stringify(novoHistorico));
  };

  const enviarComando = async (comando: string, extra: Partial<Comando> = {}) => {
    try {
      if (comando === 'distancia') {
        const res = await fetch(`${ESP32_IP}/api/distancia`);
        const json = await res.json();
        setResposta(JSON.stringify(json, null, 2));
        salvarHistorico(comando);
      } else {
        const body = {
          comando,
          origem: 'mobile',
          timestamp: new Date().toISOString(),
          valor: extra.valor ?? 150,
          angulo: extra.angulo ?? 0,
        };

        const res = await fetch(`${ESP32_IP}/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const json = await res.json();
        setResposta(JSON.stringify(json, null, 2));
        salvarHistorico(comando);
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao enviar comando');
    }
  };

  const exportarArquivo = async (formato: 'json' | 'xml') => {
    if (!resposta) return;
    const conteudo = formato === 'json' ? resposta : jsonToXml(JSON.parse(resposta));
    const path = `${FileSystem.documentDirectory}resposta.${formato}`;
    await FileSystem.writeAsStringAsync(path, conteudo);
    await Sharing.shareAsync(path);
  };

  const data: ListItem[] = [
    ...Object.entries(comandosPorCategoria).map(([titulo, comandos]) => ({
      type: "categoria" as const,
      titulo,
      comandos,
    })),
    { type: 'resposta' },
    { type: 'historico' },
  ];

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'categoria') {
      return (
        <Animated.View
          key={item.titulo}
          style={styles.card}
          entering={FadeInDown.duration(500)}
        >
          <Text style={styles.titulo}>{item.titulo.toUpperCase()}</Text>
          {item.comandos.map((btn, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.botao}
              onPress={() => enviarComando(btn.comando, btn)}
            >
              <Text style={styles.botaoTexto}>{btn.titulo}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      );
    }

    if (item.type === 'resposta') {
      return (
        <View style={styles.respostaContainer}>
          <Text style={styles.respostaTitulo}>📡 Resposta:</Text>
          <Text style={styles.respostaTexto}>
            {resposta || 'Nenhum comando enviado ainda.'}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 }}>
            <TouchableOpacity onPress={() => exportarArquivo('json')} style={styles.botaoExportar}>
              <Text style={styles.botaoTexto}>Exportar JSON</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => exportarArquivo('xml')} style={styles.botaoExportar}>
              <Text style={styles.botaoTexto}>Exportar XML</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.type === 'historico') {
      return (
        <View style={styles.historicoContainer}>
          <Text style={styles.titulo}>🕓 Histórico</Text>
          <FlatList
            data={historico}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <Text style={styles.historicoItem}>• {item}</Text>}
            scrollEnabled={false}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(item, index) => item.type + index}
      renderItem={renderItem}
      ListHeaderComponent={
        <View style={styles.statusContainer}>
          <Text style={[styles.statusTexto, { color: conectado ? 'lime' : 'red' }]}>
            {conectado ? '✅ Conectado ao ESP32' : '❌ Sem conexão com ESP32'}
          </Text>
        </View>
      }
      contentContainerStyle={styles.container}
    />
  );
};

export default TecnologiasScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#111',
  },
  card: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  titulo: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  botao: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  botaoTexto: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  respostaContainer: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  respostaTitulo: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  respostaTexto: {
    color: '#0f0',
    fontFamily: 'Courier',
  },
  botaoExportar: {
    backgroundColor: '#16a085',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  historicoContainer: {
    marginTop: 20,
    backgroundColor: '#1f1f1f',
    padding: 16,
    borderRadius: 10,
  },
  historicoItem: {
    color: '#ccc',
    paddingVertical: 4,
  },
  statusContainer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});