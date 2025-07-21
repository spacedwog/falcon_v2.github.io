#include <WiFi.h>
#include <ArduinoJson.h>
#include "RoboCore_Vespa.h"

// ========================
// CONFIGURAÇÃO DO WIFI AP
// ========================
const char* ssid_ap = "Falcon WiFi";
const char* password_ap = "12345678";
WiFiServer server(3000);

// ========================
// PINOS
// ========================
const int trigPin = 5;
const int echoPin = 18;

// ========================
// OBJETOS
// ========================
VespaMotors motors;
bool sensorAtivo = false;

// ========================
// HISTÓRICO DE DADOS
// ========================
const int maxLeituras = 10;
float historicoDistancia[maxLeituras];
unsigned long historicoTimestamp[maxLeituras];
int indiceAtual = 0;
bool bufferCheio = false;

// ========================
// SETUP
// ========================
void setup() {
  Serial.begin(115200);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  Serial.println("Iniciando ponto de acesso...");
  WiFi.softAP(ssid_ap, password_ap);
  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP iniciado. IP: ");
  Serial.println(IP);

  server.begin();
}

// ========================
// Função auxiliar: coleta leitura
// ========================
void registrarLeitura() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duracao = pulseIn(echoPin, HIGH, 25000);

  if (duracao > 0) {
    float distancia = duracao * 0.034 / 2.0;
    historicoDistancia[indiceAtual] = distancia;
    historicoTimestamp[indiceAtual] = millis();
    indiceAtual = (indiceAtual + 1) % maxLeituras;
    if (indiceAtual == 0) bufferCheio = true;

    Serial.print("📊 [Registro] Distância: ");
    Serial.print(distancia);
    Serial.println(" cm");
  }
}

// ========================
// LOOP PRINCIPAL
// ========================
void loop() {
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Cliente conectado.");
    unsigned long timeout = millis();
    while (client.connected() && !client.available()) {
      if (millis() - timeout > 1000) {
        client.stop();
        return;
      }
    }

    String req = client.readStringUntil('\r');
    client.read();
    String method = req.substring(0, req.indexOf(' '));
    String path = req.substring(req.indexOf(' ') + 1, req.indexOf("HTTP") - 1);
    path.trim();
    method.trim();

    // ================
    // POST /
    // ================
    if (method == "POST" && path == "/") {
      while (client.available()) {
        String linha = client.readStringUntil('\n');
        if (linha == "\r" || linha == "") break;
      }

      String body = "";
      while (client.available()) {
        body += char(client.read());
      }

      Serial.println("JSON recebido:");
      Serial.println(body);

      StaticJsonDocument<256> doc;
      DeserializationError erro = deserializeJson(doc, body);
      String resposta;

      if (erro) {
        resposta = "{\"erro\":\"JSON inválido\"}";
      } else {
        String comando = doc["comando"] | "";
        String origem = doc["origem"] | "";
        String timestamp = doc["timestamp"] | "";
        int valor = doc["valor"] | 100;
        int angulo = doc["angulo"] | 90;

        if (comando == "ligar") {
          sensorAtivo = true;
          resposta = "{\"status\":\"Sensor ligado\"}";
        } else if (comando == "desligar") {
          sensorAtivo = false;
          resposta = "{\"status\":\"Sensor desligado\"}";
        } else if (comando == "frente") {
          motors.backward(valor);
          resposta = "{\"acao\":\"frente\",\"velocidade\":" + String(valor) + "}";
        } else if (comando == "tras") {
          motors.forward(valor);
          resposta = "{\"acao\":\"tras\",\"velocidade\":" + String(valor) + "}";
        } else if (comando == "esquerda") {
          motors.setSpeedRight(valor);
          resposta = "{\"acao\":\"esquerda\",\"velocidade\":" + String(valor) + "}";
        } else if (comando == "direita") {
          motors.setSpeedLeft(valor);
          resposta = "{\"acao\":\"direita\",\"velocidade\":" + String(valor) + "}";
        } else if (comando == "parar") {
          motors.stop();
          resposta = "{\"acao\":\"parar\"}";
        } else if (comando == "girar") {
          motors.turn(angulo, valor);
          resposta = "{\"acao\":\"girar\",\"angulo\":" + String(angulo) + ",\"velocidade\":" + String(valor) + "}";
        } else {
          resposta = "{\"erro\":\"comando desconhecido\",\"comando\":\"" + comando + "\"}";
        }
      }

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
      Serial.println("Resposta enviada e cliente desconectado.");
    }

    // ================
    // GET /api/distancia
    // ================
    else if (method == "GET" && path == "/api/distancia") {
      String resposta;

      if (sensorAtivo) {
        digitalWrite(trigPin, LOW);
        delayMicroseconds(2);
        digitalWrite(trigPin, HIGH);
        delayMicroseconds(10);
        digitalWrite(trigPin, LOW);

        long duracao = pulseIn(echoPin, HIGH, 25000);

        if (duracao == 0) {
          resposta = "{\"erro\":\"Sem leitura. Fora de alcance ou desconectado.\"}";
        } else {
          float distancia = duracao * 0.034 / 2.0;
          resposta = "{\"distancia_cm\":" + String(distancia, 2) + "}";
          Serial.print("📏 Distância medida: ");
          Serial.print(distancia);
          Serial.println(" cm");
        }
      } else {
        resposta = "{\"status\":\"Sensor desligado\"}";
      }

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    }

    // ================
    // GET /api/data-science
    // ================
    else if (method == "GET" && path == "/api/data-science") {
      if (!sensorAtivo) {
        String resposta = "{\"erro\":\"Sensor desligado\"}";
        client.println("HTTP/1.1 400 Bad Request");
        client.println("Content-Type: application/json");
        client.println("Connection: close");
        client.println();
        client.println(resposta);
        client.stop();
        return;
      }

      StaticJsonDocument<1024> doc;
      JsonArray valores = doc.createNestedArray("valores");
      JsonArray timestamps = doc.createNestedArray("timestamps");

      int total = bufferCheio ? maxLeituras : indiceAtual;
      for (int i = 0; i < total; i++) {
        int index = (indiceAtual + i) % maxLeituras;
        valores.add(historicoDistancia[index]);

        char ts[16];
        sprintf(ts, "%.1fs", historicoTimestamp[index] / 1000.0);
        timestamps.add(ts);
      }

      String resposta;
      serializeJson(doc, resposta);

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    }

    // ================
    // Rota inválida
    // ================
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

  // Coleta de leitura a cada 2 segundos se o sensor estiver ligado
  static unsigned long ultimaColeta = 0;
  if (sensorAtivo && millis() - ultimaColeta >= 2000) {
    registrarLeitura();
    ultimaColeta = millis();
  }

  // Leitura serial (opcional)
  if (Serial.available()) {
    String dadoRecebido = Serial.readStringUntil('\n');
    Serial.println("📡 Dado recebido via Serial:");
    Serial.println(dadoRecebido);
  }
}
