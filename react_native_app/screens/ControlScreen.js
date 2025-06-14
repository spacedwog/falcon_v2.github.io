import React from 'react';
import { View, Button } from 'react-native';

export default function ControlScreen() {
  const sendCommand = (command) => {
    fetch(`http://192.168.15.8/led/${command}`);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Ligar LED" onPress={() => sendCommand("on")} />
      <Button title="Desligar LED" onPress={() => sendCommand("off")} />
    </View>
  );
}