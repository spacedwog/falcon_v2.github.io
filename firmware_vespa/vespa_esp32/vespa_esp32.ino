#include <WiFi.h>
#include <ArduinoJson.h>

const char* ssid = "FALCON_WIFI";
const char* password = "12345678";

WiFiServer server(3000);

const int led1 = 14;
const int led2 = 4;

void setup() {
  Serial.begin(115200);

  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  digitalWrite(led1, LOW);
  digitalWrite(led2, LOW);

  WiFi.softAP(ssid, password);  // Cria rede Wi-Fi local
  delay(1000);
  IPAddress IP = WiFi.softAPIP();
  Serial.println("Wi-Fi local criado (AP)!");
  Serial.print("IP do AP: ");
  Serial.println(IP);
  server.begin();
}

void loop() {
  WiFiClient client = server.available();
  if (!client) return;

  Serial.println("Cliente conectado.");

  unsigned long timeout = millis();
  while (client.connected() && !client.available()) {
    if (millis() - timeout > 1000) {
      Serial.println("Timeout aguardando dados.");
      client.stop();
      return;
    }
    delay(1);
  }

  String req = client.readStringUntil('\r');
  Serial.print("Cabeçalho da requisição: ");
  Serial.println(req);
  client.read(); // consome o \n

  String method = req.substring(0, req.indexOf(' '));
  String path = req.substring(req.indexOf(' ') + 1, req.indexOf("HTTP") - 1);
  path.trim();
  method.trim();

  if (method == "POST" && path == "/") {
    Serial.println("Requisição POST recebida.");

    // Ignora headers
    while (client.available()) {
      String linha = client.readStringUntil('\n');
      if (linha == "\r" || linha == "") break;
    }

    // Lê o corpo JSON
    String body = "";
    while (client.available()) {
      body += char(client.read());
    }

    Serial.println("JSON recebido:");
    Serial.println(body);

    StaticJsonDocument<200> doc;
    DeserializationError erro = deserializeJson(doc, body);

    String resposta;

    if (erro) {
      resposta = "{\"erro\":\"JSON inválido\"}";
    } else {
      const char* comando = doc["comando"];
      const char* origem = doc["origem"];
      String timestamp = doc["timestamp"];

      if (String(comando) == "ligar") {
        digitalWrite(led1, HIGH);
        digitalWrite(led2, HIGH);
        resposta = "{\"status\":\"ligado\",\"origem\":\"" + String(origem) + "\",\"timestamp\":\"" + timestamp + "\"}";
      } else if (String(comando) == "desligar") {
        digitalWrite(led1, LOW);
        digitalWrite(led2, LOW);
        resposta = "{\"status\":\"desligado\",\"origem\":\"" + String(origem) + "\",\"timestamp\":\"" + timestamp + "\"}";
      } else {
        resposta = "{\"erro\":\"comando desconhecido\",\"comando\":\"" + String(comando) + "\"}";
      }
    }

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();
    client.println(resposta);
    client.stop();
    Serial.println("Resposta enviada e cliente desconectado.");
  }

  else if (method == "GET" && path == "/api/dados_vespa") {
    int estado1 = digitalRead(led1);
    int estado2 = digitalRead(led2);

    String resposta = "{\"led1\":" + String(estado1) + ",\"led2\":" + String(estado2) + ",\"dado\":\"Estado atualizado\"}";

    client.println("HTTP/1.1 200 OK");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();
    client.println(resposta);
    client.stop();
    Serial.println("GET /api/dados_vespa atendido.");
  }

  else {
    String resposta = "{\"erro\":\"rota invalida\",\"rota\":\"" + path + "\"}";
    client.println("HTTP/1.1 404 Not Found");
    client.println("Content-Type: application/json");
    client.println("Connection: close");
    client.println();
    client.println(resposta);
    client.stop();
    Serial.println("Rota inválida acessada: " + path);
  }
}
