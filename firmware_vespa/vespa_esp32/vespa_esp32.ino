#include <WiFi.h>

// Credenciais da rede (2.4GHz)
const char* ssid = "FAMILIA SANTOS-5G";  // ⚠️ rede 2.4GHz
const char* password = "6z2h1j3k9f";

WiFiServer server(3000);

// Pinos dos LEDs
const int led1 = 14;  // D2 no NodeMCU
const int led2 = 27;  // D1 no NodeMCU

void setup() {
  Serial.begin(115200);

  // Configura pinos como saída
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  digitalWrite(led1, LOW);
  digitalWrite(led2, LOW);

  // Conecta ao Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao Wi-Fi...");
  }

  Serial.println("Wi-Fi conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("Acesse via navegador: http://");
  Serial.print(WiFi.localIP());
  Serial.println(":3000");

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Cliente conectado.");

    while (client.connected() && !client.available()) delay(1);

    String req = client.readStringUntil('\r');
    Serial.print("Requisição: ");
    Serial.println(req);
    client.read(); // limpa o '\n'

    // Processa os comandos
    if (req.indexOf("GET /ligar") != -1) {
      digitalWrite(led1, HIGH);
      digitalWrite(led2, HIGH);
    } else if (req.indexOf("GET /desligar") != -1) {
      digitalWrite(led1, LOW);
      digitalWrite(led2, LOW);
    } else if (req.indexOf("GET /api/dados") != -1) {
      digitalWrite(led1, HIGH);
      digitalWrite(led2, HIGH);
    }

    // Envia resposta HTTP
    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: text/html");
    client.println("Connection: close");
    client.println();
    client.println("<!DOCTYPE html><html><head><meta charset='utf-8'><title>Controle VESPA</title></head><body>");
    client.println("<h1>Controle de LEDs - VESPA</h1>");
    client.println("<p><a href=\"/ligar\"><button>Ligar LEDs</button></a></p>");
    client.println("<p><a href=\"/desligar\"><button>Desligar LEDs</button></a></p>");
    client.println("</body></html>");

    delay(10);
    client.stop();
    Serial.println("Cliente desconectado.");
  }
}
