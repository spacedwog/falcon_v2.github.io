// ESP8266 - Slave UART
#define LED_PIN D4 // GPIO2 – LED onboard

void setup() {
  Serial.begin(9600); // UART principal (USB e comunicação com ESP32)
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Slave iniciado...");
}

void loop() {
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando == "LED_ON") {
      digitalWrite(LED_PIN, LOW); // Acende o LED (LOW é ON no NodeMCU onboard)
      Serial.println("ACK: LED ligado");
    }
    else if (comando == "LED_OFF") {
      digitalWrite(LED_PIN, HIGH); // Apaga o LED
      Serial.println("ACK: LED desligado");
    }
    else {
      Serial.println("NACK: Comando desconhecido");
    }
  }
}