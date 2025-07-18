#include <Wire.h>

void setup() {
  Wire.begin(0x08); // Endereço I2C do UNO
  Wire.onReceive(receberDados);
  Wire.onRequest(enviarDados);
  Serial.begin(9600);
}

char comando = ' ';

void loop() {
  // Exemplo: acionar LED conforme comando
  if (comando == 'L') {
    digitalWrite(13, HIGH); // Liga LED
    Serial.println("LED LIGADO");
  } else if (comando == 'D') {
    digitalWrite(13, LOW); // Desliga LED
    Serial.println("LED DESLIGADO");
  }
}

void receberDados(int n) {
  if (Wire.available()) {
    comando = Wire.read();
    Serial.print("Comando recebido: ");
    Serial.println(comando);
  }
}

void enviarDados() {
  Wire.write("OK123"); // Resposta de 6 bytes
}
