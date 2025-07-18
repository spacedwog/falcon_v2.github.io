import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, StyleSheet, View, Text, ScrollView } from 'react-native';
import { Camera } from 'expo-camera';
import { CameraType } from 'expo-camera';
import { getServerIP } from '../../utils/getServerIP';

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
  const alertaExibido = useRef(false);

  // Estado para permissão da câmera
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const enviarComando = async (comando: string, valor: number = 100, angulo: number = 90) => {
    const dados = {
      comando,
      origem: 'Falcon Mobile',
      timestamp: new Date().toISOString(),
      valor,
      angulo,
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
      if (!alertaExibido.current) {
        Alert.alert('Resposta da Vespa (ESP32)', JSON.stringify(resultado, null, 2));
        alertaExibido.current = true;
      }
    } catch (erro) {
      if (!alertaExibido.current) {
        if (erro instanceof Error && erro.message.includes('Timeout')) {
          Alert.alert('Erro de conexão', 'Tempo de requisição esgotado. Verifique a conexão com o ESP32.');
        } else {
          Alert.alert('Erro de comunicação', (erro as Error).message);
        }
        alertaExibido.current = true;
      }
    }
  };

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

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permissão para câmera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>Permissão para câmera negada.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.ipText}>Conectando a: {IP_NODEMCU}</Text>

      {/* Câmera Expo */}
      <View style={styles.cameraContainer}>
        <Camera style={styles.cameraPreview} type={type} />
      </View>

      {/* Dados da Vespa */}
      <Text style={styles.serialText}>Dado da Vespa: {dadoSerial}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controle de Movimento</Text>
        <Button title="Frente" onPress={() => enviarComando('frente', 100)} />
        <View style={{ height: 12 }} />
        <Button title="Trás" onPress={() => enviarComando('tras', 100)} />
        <View style={{ height: 12 }} />
        <Button title="Esquerda" onPress={() => enviarComando('esquerda', 100)} />
        <View style={{ height: 12 }} />
        <Button title="Direita" onPress={() => enviarComando('direita', 100)} />
        <View style={{ height: 12 }} />
        <Button title="Girar (90°)" onPress={() => enviarComando('girar', 60, 90)} />
        <View style={{ height: 12 }} />
        <Button title="Parar" onPress={() => enviarComando('parar')} />
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
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#222',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  cameraContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraPreview: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
  },
});