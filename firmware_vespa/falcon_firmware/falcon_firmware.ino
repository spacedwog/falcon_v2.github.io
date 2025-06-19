#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "FAMILIA SANTOS-5G";
const char* password = "6z2h1j3k9f";

WebServer server(80);

void handleComando() {
  if (server.method() == HTTP_POST) {
    String body = server.arg("plain");
    Serial2.println(body); // Envia via UART para o UNO
    server.send(200, "application/json", "{\"status\": \"comando recebido\"}");
  } else {
    server.send(405, "text/plain", "Método não permitido");
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17); // RX = GPIO16, TX = GPIO17
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);

  server.on("/api/comando", HTTP_POST, handleComando);
  server.begin();
}

void loop() {
  server.handleClient();
}
