#include <WiFi.h> // certifique-se de que é a biblioteca certa para ESP32

const char* ssid = "FAMILIA SANTOS-5G";
const char* password = "6z2h1j3k9f";
WiFiServer server(3000);  // Porta definida aqui

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password); // se der erro, use: (char*)ssid

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao Wi-Fi...");
  }

  Serial.print("Conectado! IP: ");
  Serial.println(WiFi.localIP());

  Serial.print("Acesse: http://");
  Serial.print(WiFi.localIP());
  Serial.println(":3000");

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    client.println("Olá do ESP32 (VESPA)!");
    client.stop();
  }
}
