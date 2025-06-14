// === VESPA (Slave - ESP32) ===
#include <Arduino.h>

#define LED_PIN 2  // Pino do LED interno

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("VESPA pronta para comandos...");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "LIGAR_LED") {
      digitalWrite(LED_PIN, HIGH);
      Serial.println("LED LIGADO");
    } else if (cmd == "DESLIGAR_LED") {
      digitalWrite(LED_PIN, LOW);
      Serial.println("LED DESLIGADO");
    } else if (cmd == "STATUS") {
      int estado = digitalRead(LED_PIN);
      Serial.println(estado == HIGH ? "LED: ON" : "LED: OFF");
    } else {
      Serial.println("COMANDO DESCONHECIDO");
    }
  }
}