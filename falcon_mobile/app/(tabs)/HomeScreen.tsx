import React from 'react';
import { Alert, Button, Platform, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import WifiManager from 'react-native-wifi-reborn';
import { PermissionsAndroid } from 'react-native';

export default function HomeScreen() {
  
  const enviarParaBlackboard = async () => {
    const ssid = 'Vespa-AP';
    const senha = 'senha1234'; // ou "" se for uma rede aberta
  
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permissão negada', 'Ative a localização para usar Wi-Fi.');
          return;
        }
      }
  
      await WifiManager.connectToProtectedSSID(ssid, senha, true, false);
  
      const dados = {
        comando: 'ligar',
        origem: 'HomeScreen',
        timestamp: new Date().toISOString(),
      };
  
      const resposta = await fetch('http://192.168.4.1/api/comando', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });
  
      if (resposta.ok) {
        Alert.alert('Sucesso', 'Comando enviado para o Blackboard via Wi-Fi AP.');
      } else {
        Alert.alert('Erro', `Falha ao enviar: ${resposta.status}`);
      }
    } catch (erro) {
      Alert.alert('Erro', (erro as Error).message);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bem-vindo!</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Etapa 1: Experimente</ThemedText>
        <ThemedText>
          Edite <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> para ver mudanças.
          Pressione{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          para abrir as ferramentas do desenvolvedor.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Etapa 2: Explore</ThemedText>
        <ThemedText>
          Toque na aba "Explore" para saber mais sobre o que está incluído neste app inicial.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Etapa 3: Novo começo</ThemedText>
        <ThemedText>
          Quando estiver pronto, execute{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> para começar do zero.
        </ThemedText>
      </ThemedView>

      {/* Botão para enviar dados */}
      <View style={{ marginVertical: 20, alignItems: 'center' }}>
        <Button title="Enviar Comando para o Blackboard" onPress={enviarParaBlackboard} />
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});