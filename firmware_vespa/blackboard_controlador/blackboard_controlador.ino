// Controle de LEDs via comandos seriais

// Pinos para LEDs
const int led1 = 4;  // D2 no NodeMCU
const int led2 = 5;  // D1 no NodeMCU

void setup() {
  Serial.begin(115200);

  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);

  Serial.print("Sistema pronto. Use comandos: ligar ou desligar");
}

void loop() {
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando == "ligar") {
      digitalWrite(led1, HIGH);
      digitalWrite(led2, HIGH);
      Serial.println("LEDs ligados.");
    } 
    else if (comando == "desligar") {
      digitalWrite(led1, LOW);
      digitalWrite(led2, LOW);
      Serial.println("LEDs desligados.");
    } 
    else {
      Serial.println("Comando desconhecido." + comando);
    }
  }

  delay(100); // evita sobrecarga de leitura
}
