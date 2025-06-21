#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// Modo Access Point
const char* ssid = "VespaAP";
const char* password = "vespa123";

WebServer server(80);

// Pino do LED
const int LED_PIN = 2;
String statusAtual = "Desligado";

void handleComando() {
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"erro\":\"Requisição vazia\"}");
    return;
  }

  String body = server.arg("plain");
  DynamicJsonDocument doc(256);
  DeserializationError erro = deserializeJson(doc, body);

  if (erro) {
    server.send(400, "application/json", "{\"erro\":\"JSON inválido\"}");
    return;
  }

  String comando = doc["comando"];
  String origem = doc["origem"];
  String timestamp = doc["timestamp"];

  if (comando == "ligar") {
    digitalWrite(LED_PIN, HIGH);
    statusAtual = "Ligado";
  } else if (comando == "desligar") {
    digitalWrite(LED_PIN, LOW);
    statusAtual = "Desligado";
  } else {
    server.send(400, "application/json", "{\"erro\":\"Comando desconhecido\"}");
    return;
  }

  Serial.printf("Comando recebido: %s | Origem: %s | Horário: %s\n",
                comando.c_str(), origem.c_str(), timestamp.c_str());

  DynamicJsonDocument resposta(128);
  resposta["status"] = statusAtual;
  resposta["comando"] = comando;
  resposta["ok"] = true;

  String respostaJson;
  serializeJson(resposta, respostaJson);
  server.send(200, "application/json", respostaJson);
}

void handleDados() {
  DynamicJsonDocument doc(128);
  doc["dado"] = "LED está " + statusAtual;

  String resposta;
  serializeJson(doc, resposta);
  server.send(200, "application/json", resposta);
}

void setup() {
  Serial.begin(115200);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);  // LED começa desligado

  WiFi.softAP(ssid, password);
  Serial.println("ESP32 em modo Access Point");
  Serial.print("IP do servidor: ");
  Serial.println(WiFi.softAPIP());

  server.on("/api/comando", HTTP_POST, handleComando);
  server.on("/api/dados", HTTP_GET, handleDados);
  server.begin();
  Serial.println("Servidor HTTP iniciado");
}

void loop() {
  server.handleClient();
}