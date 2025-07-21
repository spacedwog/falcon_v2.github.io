#include <WiFi.h>
#include <ArduinoJson.h>
#include "RoboCore_Vespa.h"

// ========================
// CONFIGURAÇÃO DO WIFI AP
// ========================
const char* ssid_ap = "Falcon WiFi";
const char* password_ap = "12345678";  // mínimo 8 caracteres
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
// SETUP
// ========================
void setup() {
  Serial.begin(115200);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Inicia o Wi-Fi em modo AP
  Serial.println("Iniciando ponto de acesso...");
  WiFi.softAP(ssid_ap, password_ap);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP iniciado. IP: ");
  Serial.println(IP);

  server.begin();
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
    client.read();  // consome \n
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

        long duracao = pulseIn(echoPin, HIGH, 25000);  // timeout de 25 ms (~4.3 m)

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
      // Simulação de dados temporais
      const int n = 6;
      int valores[n] = {15, 20, 22, 25, 23, 21};
      const char* timestamps[n] = {"12:00", "12:01", "12:02", "12:03", "12:04", "12:05"};
    
      StaticJsonDocument<512> doc;
      JsonArray v = doc.createNestedArray("valores");
      JsonArray t = doc.createNestedArray("timestamps");
    
      for (int i = 0; i < n; i++) {
        v.add(valores[i]);
        t.add(timestamps[i]);
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

  // 📥 Leitura da serial (opcional)
  if (Serial.available()) {
    String dadoRecebido = Serial.readStringUntil('\n');
    Serial.println("📡 Dado recebido via Serial:");
    Serial.println(dadoRecebido);
  }
}
