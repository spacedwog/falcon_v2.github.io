#include <WiFi.h>

// Credenciais da rede Wi-Fi
const char* ssid = "FAMILIA SANTOS";  // ⚠️ rede 2.4GHz
const char* password = "6z2h1j3k9f";

WiFiServer server(3000);

// Pinos dos LEDs
const int led1 = 14;  // D2 no NodeMCU
const int led2 = 4;   // D1 no NodeMCU

void setup() {
  Serial.begin(115200);

  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  digitalWrite(led1, LOW);
  digitalWrite(led2, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Conectando ao Wi-Fi...");
  }

  Serial.println("Wi-Fi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("API disponível em: http://");
  Serial.print(WiFi.localIP());
  Serial.println(":3000");

  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Cliente conectado.");

    unsigned long startTime = millis();
    while (client.connected() && !client.available()) {
      if (millis() - startTime > 1000) {
        Serial.println("Timeout do cliente.");
        client.stop();
        return;
      }
      delay(1);
    }

    String req = client.readStringUntil('\r');
    Serial.print("Requisição: ");
    Serial.println(req);
    client.read(); // consome '\n'

    String path = req.substring(4, req.indexOf("HTTP") - 1);
    path.trim();

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();

    if (path == "/ligar") {
      digitalWrite(led1, HIGH);
      digitalWrite(led2, HIGH);
      client.print("{\"status\":\"ok\",\"led1\":1,\"led2\":1}");
    }
    else if (path == "/desligar") {
      digitalWrite(led1, LOW);
      digitalWrite(led2, LOW);
      client.print("{\"status\":\"ok\",\"led1\":0,\"led2\":0}");
    }
    else if (path == "/api/dados") {
      int estado1 = digitalRead(led1);
      int estado2 = digitalRead(led2);
      client.print("{\"led1\":");
      client.print(estado1);
      client.print(",\"led2\":");
      client.print(estado2);
      client.print("}");
    }
    else {
      client.print("{\"erro\":\"rota invalida\",\"rota\":\"");
      client.print(path);
      client.println("\"}");
    }

    delay(10);
    client.stop();
    Serial.println("Cliente desconectado.");
  }
}
