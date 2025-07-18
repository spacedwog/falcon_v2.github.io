import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Camera, CameraType } from 'expo-camera'; // ✅ IMPORTAÇÃO CORRETA

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.back); // ✅ USO CORRETO
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  if (hasPermission === null) {
    return <Text>Solicitando permissão da câmera...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Permissão negada.</Text>;
  }

  const toggleCameraType = () => {
    setType((prevType) => (
      prevType === CameraType.back ? CameraType.front : CameraType.back
    ));
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type} ref={cameraRef} />
      <Button title="Alternar Câmera" onPress={toggleCameraType} />
    </View>
  );
}