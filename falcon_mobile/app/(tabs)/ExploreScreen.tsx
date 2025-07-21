import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions
} from 'react-native';
import { getServerIP } from '../../utils/getServerIP';

const FALCON_WIFI = getServerIP();

const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 3000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout na requisição')), timeout)
    )
  ]) as Promise<Response>;
};

const { width } = Dimensions.get('window');
const stickRadius = 40;
const baseRadius = 80;

const Joystick = ({ onMove, onEnd }: {
  onMove: (event: { x: number; y: number }) => void;
  onEnd: () => void;
}) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let dx = gestureState.dx;
        let dy = gestureState.dy;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > baseRadius) {
          const angle = Math.atan2(dy, dx);
          dx = Math.cos(angle) * baseRadius;
          dy = Math.sin(angle) * baseRadius;
        }

        pan.setValue({ x: dx, y: dy });

        const normX = dx / baseRadius;
        const normY = dy / baseRadius;
        onMove({ x: normX, y: normY });
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
        onEnd();
      },
    })
  ).current;

  return (
    <View style={joystickStyles.base}>
      <Animated.View
        style={[
          joystickStyles.stick,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }],
          },
        ]}
        {...panResponder.panHandlers}
      />
    </View>
  );
};

const joystickStyles = StyleSheet.create({
  base: {
    width: baseRadius * 2,
    height: baseRadius * 2,
    borderRadius: baseRadius,
    backgroundColor: 'rgba(100,100,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  stick: {
    width: stickRadius * 2,
    height: stickRadius * 2,
    borderRadius: stickRadius,
    backgroundColor: 'rgba(30,144,255,0.6)',
    position: 'absolute',
  },
});

export default function ExploreScreen() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');
  const alertaEnvioExibido = useRef(false);
  const alertaLeituraExibido = useRef(false);

  const enviarComando = async (
    comando: string,
    valor: number = 100,
    angulo: number = 90
  ) => {
    const dados = {
      comando,
      origem: 'Falcon Mobile',
      timestamp: new Date().toISOString(),
      valor,
      angulo,
    };

    try {
      const resposta = await fetchWithTimeout(`${FALCON_WIFI}/`, {
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

      if (!alertaEnvioExibido.current) {
        Alert.alert('Resposta da Vespa (ESP32)', JSON.stringify(resultado, null, 2));
        alertaEnvioExibido.current = true;
      }

      alertaEnvioExibido.current = false; // Resetar alerta após sucesso

    } catch (erro) {
      if (!alertaEnvioExibido.current) {
        if (erro instanceof Error && erro.message.includes('Timeout')) {
          Alert.alert('Erro de conexão', 'Tempo de requisição esgotado. Verifique a conexão com o ESP32.');
        } else {
          Alert.alert('Erro de comunicação', (erro as Error).message);
        }
        alertaEnvioExibido.current = true;
      }
    }
  };

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
      setDadoSerial(JSON.stringify(json, null, 2));
      alertaLeituraExibido.current = false; // Resetar após sucesso

    } catch (err) {
      if (!alertaLeituraExibido.current) {
        if (err instanceof Error) {
          if (err.message.includes('Timeout')) {
            Alert.alert('Erro de conexão', 'Tempo de requisição esgotado. Verifique a conexão com o ESP32.');
          } else {
            Alert.alert('Erro ao buscar dado', err.message);
          }
        } else {
          Alert.alert('Erro desconhecido ao buscar dado');
        }
        alertaLeituraExibido.current = true;
      }

      setDadoSerial('Erro');
    }
  };

  useEffect(() => {
    const intervalo = setInterval(buscarDadoSerial, 2000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.ipText}>Conectando a: {FALCON_WIFI}</Text>
      <Text style={styles.serialText}>Dado da Vespa: {dadoSerial}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Controle de Movimento</Text>

        <Joystick
          onMove={({ x, y }) => {
            if (Math.abs(x) < 0.2 && Math.abs(y) < 0.2) {
              enviarComando('parar');
              return;
            }

            if (y < -0.5) enviarComando('frente', 100);
            else if (y > 0.5) enviarComando('tras', 100);
            else if (x < -0.5) enviarComando('esquerda', 100);
            else if (x > 0.5) enviarComando('direita', 100);
          }}
          onEnd={() => enviarComando('parar')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 80,
    backgroundColor: '#F0F8FF',
    flex: 1,
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
});