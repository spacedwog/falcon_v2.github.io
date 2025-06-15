const int pinoEntrada = 7;

void setup() {
  pinMode(pinoEntrada, INPUT);
  Serial.begin(9600);
  Serial.println("Aguardando sinal do Blackboard...");
}

void loop() {
  if (digitalRead(pinoEntrada) == HIGH) {
    Serial.println("Sinal recebido! Ligando VESPA...");
    // Aqui executa o que precisa ao ser ativado
    delay(500);  // evitar leitura múltipla rápida
  }
}
