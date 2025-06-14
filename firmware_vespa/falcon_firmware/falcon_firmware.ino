#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "FAMILIA SANTOS-5G";
const char* password = "6z2h1j3k9f";

WebServer server(80);
int ledPin = 2;

void handleRoot() {
  server.send(200, "text/plain", "FALCON V2 Online");
}

void handleLedOn() {
  digitalWrite(ledPin, HIGH);
  server.send(200, "text/plain", "LED ON");
}

void handleLedOff() {
  digitalWrite(ledPin, LOW);
  server.send(200, "text/plain", "LED OFF");
}

void setup() {
  Serial.begin(115200);
  pinMode(ledPin, OUTPUT);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  server.on("/", handleRoot);
  server.on("/led/on", handleLedOn);
  server.on("/led/off", handleLedOff);
  server.begin();
}

void loop() {
  server.handleClient();
}
