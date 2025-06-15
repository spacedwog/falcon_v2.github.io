import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
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
          {`Toque na aba "Explore" para saber mais sobre o que está incluído neste app inicial.`}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Etapa 3: Novo começo</ThemedText>
        <ThemedText>
          {`Quando estiver pronto, execute `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> para começar do zero.
          Isso moverá o diretório atual <ThemedText type="defaultSemiBold">app</ThemedText> para{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
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