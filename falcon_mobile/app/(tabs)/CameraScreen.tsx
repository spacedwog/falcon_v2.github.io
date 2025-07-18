import React, { useEffect, useRef, useState } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<CameraType>(CameraType.back);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCamera = () => {
    setType((prevType) =>
      prevType === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (hasPermission === null) {
    return <Text>Solicitando permissão...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Permissão negada</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} />
      <Button title="Trocar câmera" onPress={toggleCamera} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
});