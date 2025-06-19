void setup() {
  Serial.begin(9600); // Comunicação com o ESP32
  pinMode(13, OUTPUT); // Exemplo: LED
}

void loop() {
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando.indexOf("ligar") >= 0) {
      digitalWrite(13, HIGH);
    } else if (comando.indexOf("desligar") >= 0) {
      digitalWrite(13, LOW);
    }

    // Opcional: responder ao ESP32
    Serial.println("Comando executado: " + comando);
  }
}
