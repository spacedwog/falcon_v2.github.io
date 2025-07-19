#include <WiFi.h>
#include <BluetoothSerial.h>
#include <ArduinoJson.h>
#include "RoboCore_Vespa.h"

// ========================
// CONFIGURAÇÃO DO WIFI
// ========================
const char* ssid = "FAMILIA SANTOS";
const char* password = "6z2h1j3k9f";
WiFiServer server(3000);

// ========================
// BLUETOOTH
// ========================
BluetoothSerial SerialBT;

// ========================
// PINOS
// ========================
const int trigPin = 5;
const int echoPin = 18;

// ========================
// OBJETOS
// ========================
VespaMotors motors;
bool sensorAtivo = true;  // Estado do sensor

// ========================
// FUNÇÃO DE DISTÂNCIA
// ========================
String obterDistanciaJSON() {
  if (sensorAtivo) {
    digitalWrite(trigPin, LOW);
    delayMicroseconds(2);
    digitalWrite(trigPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(trigPin, LOW);
    long duracao = pulseIn(echoPin, HIGH);
    float distancia = duracao * 0.034 / 2.0;
    return "{\"distancia_cm\":" + String(distancia, 2) + "}";
  } else {
    return "{\"erro\":\"Sensor desligado\"}";
  }
}

// ========================
// SETUP
// ========================
void setup() {
  Serial.begin(115200);
  SerialBT.begin("FALCON_BT");

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Conectando-se ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Conectado ao Wi-Fi!");
  Serial.print("IP obtido: ");
  Serial.println(WiFi.localIP());

  server.begin();
  Serial.println("Servidor HTTP iniciado.");
  Serial.println("Bluetooth iniciado como FALCON_BT.");
}

// ========================
// LOOP PRINCIPAL
// ========================
void loop() {
  // --- Comunicação HTTP ---
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Cliente HTTP conectado.");
    unsigned long timeout = millis();
    while (client.connected() && !client.available()) {
      if (millis() - timeout > 1000) {
        client.stop();
        return;
      }
    }

    String req = client.readStringUntil('\r');
    client.read();  // consome \n
    String method = req.substring(0, req.indexOf(' '));
    String path = req.substring(req.indexOf(' ') + 1, req.indexOf("HTTP") - 1);
    path.trim();
    method.trim();

    if (method == "POST" && path == "/") {
      while (client.available()) {
        String linha = client.readStringUntil('\n');
        if (linha == "\r" || linha == "") break;
      }

      String body = "";
      while (client.available()) {
        body += char(client.read());
      }

      Serial.println("JSON recebido via HTTP:");
      Serial.println(body);

      StaticJsonDocument<256> doc;
      DeserializationError erro = deserializeJson(doc, body);
      String resposta;

      if (erro) {
        resposta = "{\"erro\":\"JSON inválido\"}";
      } else {
        String comando = doc["comando"] | "";
        int valor = doc["valor"] | 100;
        int angulo = doc["angulo"] | 90;

        resposta = executarComando(comando, valor, angulo);
      }

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
      Serial.println("Resposta enviada e cliente HTTP desconectado.");
    }

    else if (method == "GET" && path == "/api/distancia") {
      String resposta = obterDistanciaJSON();

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    }

    else {
      String resposta = "{\"erro\":\"rota invalida\",\"rota\":\"" + path + "\"}";
      client.println("HTTP/1.1 404 Not Found");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    }
  }

  // --- Comunicação Bluetooth Serial ---
  if (SerialBT.available()) {
    String comando = SerialBT.readStringUntil('\n');
    comando.trim();
    Serial.println("Recebido via Bluetooth: " + comando);

    if (comando == "distancia") {
      String resposta = obterDistanciaJSON();
      SerialBT.println(resposta);
    } else {
      String resposta = executarComando(comando, 100, 90);
      SerialBT.println(resposta);
    }
  }

  // --- Comunicação Serial USB ---
  if (Serial.available()) {
    String dadoRecebido = Serial.readStringUntil('\n');
    Serial.println("📡 Dado via Serial:");
    Serial.println(dadoRecebido);
  }
}

// ========================
// EXECUÇÃO DE COMANDOS
// ========================
String executarComando(String comando, int valor, int angulo) {
  if (comando == "ligar") {
    sensorAtivo = true;
    return "{\"status\":\"Sensor ligado\"}";

  } else if (comando == "desligar") {
    sensorAtivo = false;
    return "{\"status\":\"Sensor desligado\"}";

  } else if (comando == "frente") {
    motors.backward(valor);
    return "{\"acao\":\"frente\",\"velocidade\":" + String(valor) + "}";

  } else if (comando == "tras") {
    motors.forward(valor);
    return "{\"acao\":\"tras\",\"velocidade\":" + String(valor) + "}";

  } else if (comando == "esquerda") {
    motors.setSpeedRight(valor);
    return "{\"acao\":\"esquerda\",\"velocidade\":" + String(valor) + "}";

  } else if (comando == "direita") {
    motors.setSpeedLeft(valor);
    return "{\"acao\":\"direita\",\"velocidade\":" + String(valor) + "}";

  } else if (comando == "parar") {
    motors.stop();
    return "{\"acao\":\"parar\"}";

  } else if (comando == "girar") {
    motors.turn(angulo, valor);
    return "{\"acao\":\"girar\",\"angulo\":" + String(angulo) + ",\"velocidade\":" + String(valor) + "}";

  } else {
    return "{\"erro\":\"comando desconhecido\",\"comando\":\"" + comando + "\"}";
  }
}
