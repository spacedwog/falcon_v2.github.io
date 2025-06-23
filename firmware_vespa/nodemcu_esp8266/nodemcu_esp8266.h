#ifndef WIFI_AP_CONFIG_H
#define WIFI_AP_CONFIG_H

#include <ESP8266WiFi.h>

// Nome e senha da rede Wi-Fi criada pelo ESP8266
const char* ap_ssid = "Falcon_WiFi";
const char* ap_password = "falconwifi";

// Função para iniciar o Access Point
void iniciarAccessPoint() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Iniciando o Access Point...");
  WiFi.softAP(ap_ssid, ap_password);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("Access Point IP address: ");
  Serial.println(IP);
}

#endif