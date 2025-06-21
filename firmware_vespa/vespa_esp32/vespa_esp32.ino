// ESP32 - Master UART
#define RXD2 16
#define TXD2 17

void setup() {
  Serial.begin(115200);         // Debug via USB
  Serial2.begin(9600, SERIAL_8N1, RXD2, TXD2); // UART2 para comunicação com o slave
  Serial.println("Master iniciado...");
}

void loop() {
  // Enviar comando ao slave
  Serial2.println("LED_ON");
  Serial.println("Comando enviado: LED_ON");

  delay(2000);

  Serial2.println("LED_OFF");
  Serial.println("Comando enviado: LED_OFF");

  delay(2000);

  // Ler resposta do slave, se houver
  if (Serial2.available()) {
    String resposta = Serial2.readStringUntil('\n');
    Serial.print("Resposta do slave: ");
    Serial.println(resposta);
  }
}