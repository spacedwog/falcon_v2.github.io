import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View, Text, ScrollView, Button, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const bleManager = new BleManager();

export default function HomeScreen() {
  const [dadoSerial, setDadoSerial] = useState<string>('---');
  const [device, setDevice] = useState<Device | null>(null);
  const alertaExibido = useRef(false);

  const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b'; // UUID do seu ESP32
  const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8'; // Característica de leitura/escrita

  // Solicitar permissões Android
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }
  };

  // Escanear dispositivos e conectar ao ESP32
  const conectarESP32 = () => {
    bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
      if (error) {
        Alert.alert('Erro ao escanear', error.message);
        return;
      }

      if (scannedDevice?.name?.includes('ESP32')) {
        bleManager.stopDeviceScan();
        try {
          const d = await scannedDevice.connect();
          await d.discoverAllServicesAndCharacteristics();
          setDevice(d);
          Alert.alert('Conectado a', d.name ?? 'ESP32');
        } catch (e) {
          Alert.alert('Erro ao conectar', e instanceof Error ? e.message : 'Desconhecido');
        }
      }
    });
  };

  // Buscar dado via BLE a cada 2s
  const buscarDadoSerial = async () => {
    if (!device) return;

    try {
      const characteristic = await device.readCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID);
      const valorBase64 = characteristic.value;
      const decoded = atob(valorBase64 || ''); // Decodifica base64 para string
      setDadoSerial(decoded.trim());
      alertaExibido.current = false;
    } catch (err) {
      if (!alertaExibido.current) {
        Alert.alert('Erro ao ler dado via Bluetooth', err instanceof Error ? err.message : 'Erro desconhecido');
        alertaExibido.current = true;
      }
      setDadoSerial('Erro');
    }
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      bleManager.destroy();
    };
  }, []);

  useEffect(() => {
    if (!device) return;
    const intervalo = setInterval(buscarDadoSerial, 2000);
    return () => clearInterval(intervalo);
  }, [device]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.ipText}>
        {device ? `Conectado a: ${device.name}` : 'Bluetooth não conectado'}
      </Text>
      <Text style={styles.serialText}>Dado da Vespa (BLE): {dadoSerial}</Text>
      <Button title="Conectar ao ESP32 via Bluetooth" onPress={conectarESP32} />
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
});