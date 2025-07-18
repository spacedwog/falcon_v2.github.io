#include <WiFi.h>
#include <ArduinoJson.h>
#include "RoboCore_Vespa.h"

const char* ssid = "FALCON_WIFI";
const char* password = "12345678";

WiFiServer server(3000);

// Pinos do LED e sensor
const int led1 = 14;
const int led2 = 4;
const int trigPin = 5;
const int echoPin = 18;

VespaMotors motors;  // Objeto para controlar os motores

void setup() {
  Serial.begin(9600);  // Comunicação com ESP8266

  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  digitalWrite(led1, LOW);
  digitalWrite(led2, LOW);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  WiFi.softAP(ssid, password);
  delay(1000);
  Serial.println("Wi-Fi local criado (AP)!");
  Serial.print("IP do AP: ");
  Serial.println(WiFi.softAPIP());

  server.begin();
}

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
          digitalWrite(led1, HIGH);
          digitalWrite(led2, HIGH);
          resposta = "{\"status\":\"ligado\"}";
        } else if (comando == "desligar") {
          digitalWrite(led1, LOW);
          digitalWrite(led2, LOW);
          resposta = "{\"status\":\"desligado\"}";
        } else if (comando == "frente") {
          motors.forward(valor);
          resposta = "{\"acao\":\"frente\",\"velocidade\":" + String(valor) + "}";
        } else if (comando == "tras") {
          motors.backward(valor);
          resposta = "{\"acao\":\"tras\",\"velocidade\":" + String(valor) + "}";
        } else if (comando == "esquerda") {
          motors.setSpeedLeft(valor);
          resposta = "{\"acao\":\"esquerda\",\"velocidade\":" + String(valor) + "}";
        } else if (comando == "direita") {
          motors.setSpeedRight(valor);
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

    else if (method == "GET" && path == "/api/dados_vespa") {
      int estado1 = digitalRead(led1);
      int estado2 = digitalRead(led2);
      String resposta = "{\"led1\":" + String(estado1) + ",\"led2\":" + String(estado2) + "}";
      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    }

    else if (method == "GET" && path == "/api/distancia") {
      digitalWrite(trigPin, LOW);
      delayMicroseconds(2);
      digitalWrite(trigPin, HIGH);
      delayMicroseconds(10);
      digitalWrite(trigPin, LOW);
      long duracao = pulseIn(echoPin, HIGH);
      float distancia = duracao * 0.034 / 2.0;
      String resposta = "{\"distancia_cm\":" + String(distancia, 2) + "}";
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

  // 📥 Serial (ESP8266)
  if (Serial.available()) {
    String dadoRecebido = Serial.readStringUntil('\n');
    Serial.println("📡 Dado recebido via Serial:");
    Serial.println(dadoRecebido);
  }
}
