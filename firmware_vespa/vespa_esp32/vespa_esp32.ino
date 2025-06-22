#include <WiFi.h>

const char* ssid = "FAMILIA SANTOS-5G";
const char* password = "6z2h1j3k9f";
WiFiServer server(3000); // porta customizada

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando...");
  }

  Serial.print("Conectado! IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("Acesse: http://" + WiFi.localIP().toString() + ":3000");

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    client.println("Olá do ESP32!");
    client.stop();
  }
}
