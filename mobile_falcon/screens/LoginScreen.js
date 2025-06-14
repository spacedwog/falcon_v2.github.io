import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');

  const handleLogin = async () => {
    const res = await fetch('http://localhost:8501/github_auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, token })
    });
    if (res.ok) {
      navigation.navigate('Home');
    } else {
      alert('Falha na autenticação');
    }
  };

  return (
    <View>
      <Text>Login GitHub</Text>
      <TextInput placeholder="Usuário" onChangeText={setUsername} />
      <TextInput placeholder="Token" onChangeText={setToken} secureTextEntry={true} />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}