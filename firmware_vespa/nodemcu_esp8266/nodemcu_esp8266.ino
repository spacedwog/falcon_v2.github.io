#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "FALCON_WIFI";        // Mesmo Wi-Fi criado pela Vespa
const char* password = "12345678";
const char* host = "192.168.4.1";        // IP da Vespa como AP

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Conectando ao Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConectado!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://" + String(host) + ":3000/api/distancia");
    int httpCode = http.GET();

    if (httpCode > 0) {
      String payload = http.getString();
      Serial.println("Resposta da Vespa:");
      Serial.println(payload);
    } else {
      Serial.println("Erro ao conectar");
    }

    http.end();
  }

  delay(5000);  // Faz leitura a cada 5 segundos
}