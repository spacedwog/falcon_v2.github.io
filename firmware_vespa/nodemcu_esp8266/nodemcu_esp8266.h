#ifndef WIFI_AP_CONFIG_H
#define WIFI_AP_CONFIG_H

#include <ESP8266WiFi.h>

extern const char* ap_ssid;
extern const char* ap_password;

void iniciarAccessPoint();

#endif