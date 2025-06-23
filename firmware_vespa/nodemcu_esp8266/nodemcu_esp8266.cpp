#include "nodemcu_esp8266.h"

const char* ap_ssid = "Falcon_WiFi";
const char* ap_password = "falconwifi";

void iniciarAccessPoint() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Iniciando o Access Point...");
  WiFi.softAP(ap_ssid, ap_password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("Access Point IP address: ");
  Serial.println(IP);
}
