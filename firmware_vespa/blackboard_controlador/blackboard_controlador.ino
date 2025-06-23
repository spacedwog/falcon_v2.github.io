// Controle de LEDs via comandos seriais

// Pinos para LEDs
const int led1 = 4;  // D2 no NodeMCU
const int led2 = 5;  // D1 no NodeMCU

//Motores da Vespa
const int motorA = 14;
const int motorB = 27;

void setup() {
  Serial.begin(115200);

  pinMode(motorA, OUTPUT);
  pinMode(motorB, OUTPUT);
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);

  Serial.println("Sistema pronto. Use comandos: 1 (ligar), 0 (desligar)");
}

void loop() {
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando == "1") {
      digitalWrite(led1, HIGH);
      digitalWrite(led2, HIGH);
      Serial.println("LEDs ligados.");
    } 
    else if (comando == "0") {
      digitalWrite(led1, LOW);
      digitalWrite(led2, LOW);
      Serial.println("LEDs desligados.");
    }
    else if (comando == "2") {
      digitalWrite(motorA, HIGH);
      digitalWrite(motorB, HIGH);
    }
    else if (comando == "3") {
      digitalWrite(motorA, LOW);
      digitalWrite(motorB, LOW);
    }
    else {
      Serial.println("Comando desconhecido: " + comando);
    }
  }

  delay(100);
}
