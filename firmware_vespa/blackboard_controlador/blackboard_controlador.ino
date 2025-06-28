#include <Wire.h>

// Endereço do dispositivo escravo (ex: VESPA, sensor I2C)
#define SLAVE_ADDRESS 0x08

String comandoRecebido = "";

void setup() {
  Serial.begin(115200);
  Wire.begin();  // Inicia como mestre
  Serial.println("Controlador Blackboard iniciado.");
}

void loop() {
  // Verifica se há dados recebidos via Serial
  if (Serial.available()) {
    comandoRecebido = Serial.readStringUntil('\n');
    comandoRecebido.trim();

    Serial.print("Comando recebido: ");
    Serial.println(comandoRecebido);

    enviarParaEscravo(comandoRecebido);
    delay(100);
    receberRespostaEscravo();
  }

  delay(200);
}

// Envia comando para escravo via I2C
void enviarParaEscravo(String comando) {
  Wire.beginTransmission(SLAVE_ADDRESS);
  Wire.write((const uint8_t*)comando.c_str(), comando.length());  // Cast explícito
  Wire.endTransmission();
  Serial.println("Comando enviado ao escravo.");
}

// Lê resposta do escravo via I2C
void receberRespostaEscravo() {
  Wire.requestFrom(SLAVE_ADDRESS, 32); // espera até 32 bytes

  String resposta = "";
  while (Wire.available()) {
    char c = Wire.read();
    resposta += c;
  }

  if (resposta.length() > 0) {
    Serial.print("Resposta do escravo: ");
    Serial.println(resposta);
  } else {
    Serial.println("Sem resposta do escravo.");
  }
}
