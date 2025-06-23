// index.tsx
import React, { useEffect, useState } from 'react';
import { Text, View, Button } from 'react-native';

export default function Index() {
  const [output, setOutput] = useState('');

  const executarPowerShell = async () => {
    try {
      const response = await fetch('http://localhost:3000/ps');
      const data = await response.json();
      setOutput(data.output);
    } catch (err) {
      setOutput('Erro ao conectar: ' + err);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 20 }}>Conexão com PowerShell</Text>
      <Button title="Executar Script" onPress={executarPowerShell} />
      <Text style={{ marginTop: 20 }}>{output}</Text>
    </View>
  );
}