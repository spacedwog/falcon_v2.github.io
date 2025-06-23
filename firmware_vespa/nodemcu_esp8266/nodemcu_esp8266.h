#ifndef NODEMCU_ESP8266_H
#define NODEMCU_ESP8266_H

#include <ESP8266WiFi.h>

extern const char* ap_ssid;
extern const char* ap_password;

void iniciarAccessPoint();

#endif
