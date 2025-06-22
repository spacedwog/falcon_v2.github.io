#include <ESP8266WiFi.h>

// Nome e senha da rede Wi-Fi criada pelo ESP8266
const char* ssid = "Falcon_WiFi";
const char* password = "falconwifi";

void setup() {
  // Inicializa o monitor serial
  Serial.begin(115200);
  delay(1000);

  // Configura o ESP8266 como ponto de acesso (Access Point)
  Serial.println("Iniciando o Access Point...");
  WiFi.softAP(ssid, password);

  // Mostra o IP local do ESP8266 como AP
  IPAddress IP = WiFi.softAPIP();
  Serial.print("Access Point IP address: ");
  Serial.println(IP);
}

void loop() {
  // Você pode colocar lógica adicional aqui
}
