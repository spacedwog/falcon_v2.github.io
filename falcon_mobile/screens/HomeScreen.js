import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function HomeScreen() {
  const [status, setStatus] = useState("Carregando...");

  useEffect(() => {
    fetch("http://192.168.0.100/")
      .then((res) => res.text())
      .then((data) => setStatus(data))
      .catch(() => setStatus("Erro de conexão"));
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text>Status do Falcon V2:</Text>
      <Text>{status}</Text>
    </View>
  );
}