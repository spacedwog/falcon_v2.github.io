import { Platform } from 'react-native';

export function getServerIP(): string {
  // Emulador Android (AVD)
  if (Platform.OS === 'android' && !isRunningOnPhysicalDevice()) {
    return 'http://10.0.2.2:3000';
  }

  // Emulador iOS (funciona com localhost)
  if (Platform.OS === 'ios' && !isRunningOnPhysicalDevice()) {
    return 'http://localhost:3000';
  }

  // Dispositivo físico — use IP local da máquina manualmente aqui:
  return 'http://192.168.15.8:3000'; // 🔁 Substitua pelo IP do seu PC
}

// Essa função é "fake", pois não dá para detectar nativamente sem biblioteca
function isRunningOnPhysicalDevice(): boolean {
  return true; // ajuste para false se estiver em emulador
}