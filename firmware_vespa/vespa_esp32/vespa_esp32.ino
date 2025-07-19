#include <WiFi.h>
#include <ArduinoJson.h>
#include "RoboCore_Vespa.h"
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ========================
// CONFIG WIFI
// ========================
const char* ssid = "FAMILIA SANTOS";
const char* password = "6z2h1j3k9f";
WiFiServer server(3000);

// ========================
// CONFIG BLE
// ========================
#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"
BLECharacteristic* pCharacteristic;
bool deviceConnected = false;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) { deviceConnected = true; }
  void onDisconnect(BLEServer* pServer) { deviceConnected = false; }
};

// ========================
// HARDWARE
// ========================
const int trigPin = 5;
const int echoPin = 18;
VespaMotors motors;
bool sensorAtivo = true;

// ========================
// SETUP
// ========================
void setup() {
  Serial.begin(115200);

  // --- Pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // --- WiFi
  WiFi.begin(ssid, password);
  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  server.begin();

  // --- BLE
  BLEDevice::init("ESP32");
  BLEServer* pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService* pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ |
    BLECharacteristic::PROPERTY_WRITE
  );
  pCharacteristic->setValue("ESP32 conectado via BLE");
  pService->start();
  pServer->getAdvertising()->start();
  Serial.println("Bluetooth iniciado...");
}

// ========================
// FUNÇÃO DISTÂNCIA
// ========================
float medirDistanciaCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  long duracao = pulseIn(echoPin, HIGH);
  return duracao * 0.034 / 2.0;
}

// ========================
// LOOP PRINCIPAL
// ========================
void loop() {
  // --- Cliente HTTP
  WiFiClient client = server.available();
  if (client) {
    Serial.println("📶 Cliente conectado.");
    unsigned long timeout = millis();
    while (client.connected() && !client.available()) {
      if (millis() - timeout > 1000) {
        client.stop();
        return;
      }
    }

    String req = client.readStringUntil('\r');
    client.read(); // consome '\n'
    String method = req.substring(0, req.indexOf(' '));
    String path = req.substring(req.indexOf(' ') + 1, req.indexOf("HTTP") - 1);
    method.trim(); path.trim();

    // --- POST com JSON de comando
    if (method == "POST" && path == "/") {
      while (client.available()) {
        String linha = client.readStringUntil('\n');
        if (linha == "\r" || linha == "") break;
      }
      String body = "";
      while (client.available()) body += char(client.read());
      Serial.println("📨 JSON recebido:");
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

        if (comando == "ligar") {
          sensorAtivo = true;
          resposta = "{\"status\":\"Sensor ligado\"}";

        } else if (comando == "desligar") {
          sensorAtivo = false;
          resposta = "{\"status\":\"Sensor desligado\"}";

        } else if (comando == "frente") {
          motors.backward(valor);
          resposta = "{\"acao\":\"frente\"}";

        } else if (comando == "tras") {
          motors.forward(valor);
          resposta = "{\"acao\":\"tras\"}";

        } else if (comando == "esquerda") {
          motors.setSpeedRight(valor);
          resposta = "{\"acao\":\"esquerda\"}";

        } else if (comando == "direita") {
          motors.setSpeedLeft(valor);
          resposta = "{\"acao\":\"direita\"}";

        } else if (comando == "parar") {
          motors.stop();
          resposta = "{\"acao\":\"parar\"}";

        } else if (comando == "girar") {
          motors.turn(angulo, valor);
          resposta = "{\"acao\":\"girar\"}";

        } else {
          resposta = "{\"erro\":\"comando desconhecido\"}";
        }
      }

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
      Serial.println("✅ Resposta enviada.");

    // --- GET com medição
    } else if (method == "GET" && path == "/api/distancia") {
      String resposta;
      if (sensorAtivo) {
        float distancia = medirDistanciaCM();
        resposta = "{\"distancia_cm\":" + String(distancia, 2) + "}";
      } else {
        resposta = "{\"erro\":\"Sensor desligado\"}";
      }

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();

    // --- Rota inválida
    } else {
      String resposta = "{\"erro\":\"rota invalida\"}";
      client.println("HTTP/1.1 404 Not Found");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    }
  }

  // --- Serial
  if (Serial.available()) {
    String dado = Serial.readStringUntil('\n');
    Serial.println("📡 Dado Serial: " + dado);
  }

  // --- BLE: envia distância se conectado
  if (deviceConnected && sensorAtivo) {
    float distancia = medirDistanciaCM();
    String valor = String(distancia, 2) + " cm";
    pCharacteristic->setValue(valor.c_str());
    delay(1000); // evitar sobrecarga
  }
}
