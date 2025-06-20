#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>

ESP8266WebServer server(80);

void configurarWiFiAP() {
  WiFi.softAP("falcon_wifi", "12345678");
  server.on("/ligar", []() {
    digitalWrite(D1, HIGH);
    server.send(200, "text/plain", "Ligado");
  });
  server.on("/desligar", []() {
    digitalWrite(D1, LOW);
    server.send(200, "text/plain", "Desligado");
  });
  server.begin();
}

void setup() {
  Serial.begin(115200);
  pinMode(D1, OUTPUT);

  configurarWiFiAP(); // Apenas chama a função separada
}

void loop() {
  server.handleClient();
}
