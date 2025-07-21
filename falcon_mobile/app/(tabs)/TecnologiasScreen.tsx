import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

type Comando = {
  titulo: string;
  comando: string;
  angulo?: number;
  valor?: number;
};

const ESP32_IP = "http://192.168.4.1:3000"; // Atualize com o IP do seu ESP32

const comandosPorCategoria: Record<string, Comando[]> = {
  frontend: [
    { titulo: "Iniciar UI", comando: "ligar" },
    { titulo: "Parar UI", comando: "desligar" },
  ],
  backend: [
    { titulo: "Mover Frente", comando: "frente" },
    { titulo: "Mover Trás", comando: "tras" },
    { titulo: "Parar Motor", comando: "parar" },
  ],
  clouddev: [
    { titulo: "Girar 90º", comando: "girar", angulo: 90 },
    { titulo: "Girar 180º", comando: "girar", angulo: 180 },
  ],
  devops: [
    { titulo: "Distância", comando: "distancia" },
    { titulo: "Desligar Sensor", comando: "desligar" },
  ],
};

// Função opcional para exportar resposta JSON como XML (string)
const jsonToXml = (json: any): string => {
  let xml = "<resposta>";
  for (const key in json) {
    xml += `<${key}>${json[key]}</${key}>`;
  }
  xml += "</resposta>";
  return xml;
};

const TecnologiasScreen = () => {
  const [resposta, setResposta] = useState<string>("");

  const enviarComando = async (comando: string, extra: Partial<Comando> = {}) => {
    try {
      if (comando === "distancia") {
        const res = await fetch(`${ESP32_IP}/api/distancia`);
        const json = await res.json();
        setResposta(JSON.stringify(json, null, 2));

        // Exemplo de conversão para XML (opcional)
        // const xml = jsonToXml(json);
        // console.log(xml);

      } else {
        const body = {
          comando,
          origem: "mobile",
          timestamp: new Date().toISOString(),
          valor: extra.valor ?? 150,
          angulo: extra.angulo ?? 0,
        };

        const res = await fetch(`${ESP32_IP}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await res.json();
        setResposta(JSON.stringify(json, null, 2));
      }
    } catch (err) {
      Alert.alert("Erro", "Falha ao enviar comando");
    }
  };

  const renderCategoria = (titulo: string, comandos: Comando[]) => (
    <View key={titulo} style={styles.card}>
      <Text style={styles.titulo}>{titulo.toUpperCase()}</Text>
      {comandos.map((btn, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.botao}
          onPress={() => enviarComando(btn.comando, btn)}
        >
          <Text style={styles.botaoTexto}>{btn.titulo}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {Object.entries(comandosPorCategoria).map(([categoria, comandos]) =>
        renderCategoria(categoria, comandos)
      )}
      <View style={styles.respostaContainer}>
        <Text style={styles.respostaTitulo}>📡 Resposta:</Text>
        <Text style={styles.respostaTexto}>
          {resposta || "Nenhum comando enviado ainda."}
        </Text>
      </View>
    </ScrollView>
  );
};

export default TecnologiasScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#111",
  },
  card: {
    backgroundColor: "#222",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 2 },
  },
  titulo: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  botao: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  botaoTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  respostaContainer: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  respostaTitulo: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  respostaTexto: {
    color: "#0f0",
    fontFamily: "Courier",
  },
});