import { Platform } from 'react-native';
// import * as Device from 'expo-device'; // opcional se usar Expo

const LOCALHOST = 'http://localhost';
const AVD_IP = 'http://10.0.2.2';
const LOCAL_IP = 'http://192.168.15.166'; // Substitua pelo seu IP
const PORT = 3000;

function isRunningOnPhysicalDevice(): boolean {
  return true; // ou: return Device.isDevice;
}

export function getServerIP(): string {
  if (Platform.OS === 'android' && !isRunningOnPhysicalDevice()) {
    return `${AVD_IP}:${PORT}`;
  }

  if (Platform.OS === 'ios' && !isRunningOnPhysicalDevice()) {
    return `${LOCALHOST}:${PORT}`;
  }

  return `${LOCAL_IP}:${PORT}`;
}