#include <WiFi.h>
#include <ArduinoJson.h>
#include "RoboCore_Vespa.h"
#include <Wire.h>    // I2C
#include <SPI.h>     // SPI

// ========================
// CONFIGURAÇÃO DO WIFI AP
// ========================
const char* ssid_ap = "Falcon_WiFi";
const char* password_ap = "12345678";
WiFiServer server(3000);

// ========================
// PINOS PRINCIPAIS ESP32 (Vespa Robocore)
// ========================
// Ultrassônico (HC-SR04)
const int trigPin = 5;
const int echoPin = 18;

// Motores (exemplo: PWM nas portas 25 e 26 - DACs, ou outros PWM)
const int motorPWMPin1 = 25;   // Pode usar DAC/PWM
const int motorPWMPin2 = 26;   // Pode usar DAC/PWM

// Sensores Analógicos (ADC)
const int sensorAnalogico1 = 34;  // ADC1 channel
const int sensorAnalogico2 = 35;  // ADC1 channel

// I2C padrão ESP32
const int i2cSDA = 21;
const int i2cSCL = 22;

// SPI padrão VSPI (pode ser usado para SD, displays, sensores)
const int spiMISO = 19;
const int spiMOSI = 23;
const int spiSCLK = 18;
const int spiCS = 5;

// UART padrão (Serial0 já usado para USB)
// Exemplo: UART1 TX=17, RX=16
const int uartTx = 17;
const int uartRx = 16;

// Botão e LED onboard (comum no GPIO2)
const int botaoOnboard = 0;    // Botão reset ou user button (varia por placa)
const int ledOnboard = 2;      // LED interno

// Touch sensor (exemplo GPIO4)
const int touchPin = 4;

// ========================
// OBJETOS
// ========================
VespaMotors motors;
bool sensorAtivo = false;

// ========================
// SETUP
// ========================
void setup() {
  Serial.begin(115200);

  // Ultrassônico
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Motores (PWM / DAC)
  ledcSetup(0, 5000, 8);       // Canal 0, 5kHz, 8 bits resolução PWM
  ledcAttachPin(motorPWMPin1, 0);

  ledcSetup(1, 5000, 8);       // Canal 1
  ledcAttachPin(motorPWMPin2, 1);

  // Sensor Analógico
  pinMode(sensorAnalogico1, INPUT);
  pinMode(sensorAnalogico2, INPUT);

  // I2C
  Wire.begin(i2cSDA, i2cSCL);

  // SPI
  SPI.begin(spiSCLK, spiMISO, spiMOSI, spiCS);

  // UART1 (exemplo)
  Serial1.begin(9600, SERIAL_8N1, uartRx, uartTx);

  // Botão e LED onboard
  pinMode(botaoOnboard, INPUT_PULLUP);
  pinMode(ledOnboard, OUTPUT);
  digitalWrite(ledOnboard, LOW);

  // Touch sensor
  touchAttachInterrupt(touchPin, NULL, 40);  // Sensibilidade, sem callback por enquanto

  // Inicia o Wi-Fi em modo AP
  Serial.println("Iniciando ponto de acesso...");
  WiFi.softAP(ssid_ap, password_ap);

  IPAddress IP = WiFi.softAPIP();
  Serial.print("AP iniciado. IP: ");
  Serial.println(IP);

  server.begin();
}

// ========================
// FUNÇÃO PARA LEITURA ANALÓGICA
// ========================
int lerSensorAnalogico(int pino) {
  int valor = analogRead(pino);
  Serial.print("ADC Leitura no pino ");
  Serial.print(pino);
  Serial.print(": ");
  Serial.println(valor);
  return valor;
}

// ========================
// FUNÇÃO PARA CONTROLAR MOTORES COM PWM
// ========================
void setMotorPWM(int canal, int velocidade) {
  velocidade = constrain(velocidade, 0, 255);
  ledcWrite(canal, velocidade);
}

// ========================
// LOOP PRINCIPAL
// ========================
void loop() {
  WiFiClient client = server.available();
  if (client) {
    Serial.println("Cliente conectado.");
    unsigned long timeout = millis();
    while (client.connected() && !client.available()) {
      if (millis() - timeout > 1000) {
        client.stop();
        return;
      }
    }

    String req = client.readStringUntil('\r');
    client.read();  // consome \n
    String method = req.substring(0, req.indexOf(' '));
    String path = req.substring(req.indexOf(' ') + 1, req.indexOf("HTTP") - 1);
    path.trim();
    method.trim();

    if (method == "POST" && path == "/") {
      while (client.available()) {
        String linha = client.readStringUntil('\n');
        if (linha == "\r" || linha == "") break;
      }

      String body = "";
      while (client.available()) {
        body += char(client.read());
      }

      Serial.println("JSON recebido:");
      Serial.println(body);

      StaticJsonDocument<256> doc;
      DeserializationError erro = deserializeJson(doc, body);
      String resposta;

      if (erro) {
        resposta = "{\"erro\":\"JSON inválido\"}";
      } else {
        String comando = doc["comando"] | "";
        int valor = doc["valor"] | 100;
        int angulo = doc["angulo"] | 90;

        if (comando == "ligar") {
          sensorAtivo = true;
          resposta = "{\"status\":\"Sensor ligado\"}";

        } else if (comando == "desligar") {
          sensorAtivo = false;
          resposta = "{\"status\":\"Sensor desligado\"}";

        } else if (comando == "frente") {
          motors.backward(valor);
          setMotorPWM(0, valor);
          setMotorPWM(1, valor);
          resposta = "{\"acao\":\"frente\",\"velocidade\":" + String(valor) + "}";

        } else if (comando == "tras") {
          motors.forward(valor);
          setMotorPWM(0, valor);
          setMotorPWM(1, valor);
          resposta = "{\"acao\":\"tras\",\"velocidade\":" + String(valor) + "}";

        } else if (comando == "parar") {
          motors.stop();
          setMotorPWM(0, 0);
          setMotorPWM(1, 0);
          resposta = "{\"acao\":\"parar\"}";

        } else if (comando == "adc1") {
          int leitura = lerSensorAnalogico(sensorAnalogico1);
          resposta = "{\"adc1\":" + String(leitura) + "}";

        } else if (comando == "adc2") {
          int leitura = lerSensorAnalogico(sensorAnalogico2);
          resposta = "{\"adc2\":" + String(leitura) + "}";

        } else if (comando == "led_on") {
          digitalWrite(ledOnboard, HIGH);
          resposta = "{\"led\":\"on\"}";

        } else if (comando == "led_off") {
          digitalWrite(ledOnboard, LOW);
          resposta = "{\"led\":\"off\"}";

        } else {
          resposta = "{\"erro\":\"comando desconhecido\",\"comando\":\"" + comando + "\"}";
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
    else if (method == "GET" && path == "/api/distancia") {
      String resposta;

      if (sensorAtivo) {
        digitalWrite(trigPin, LOW);
        delayMicroseconds(2);
        digitalWrite(trigPin, HIGH);
        delayMicroseconds(10);
        digitalWrite(trigPin, LOW);

        long duracao = pulseIn(echoPin, HIGH, 25000);  // timeout de 25 ms

        if (duracao == 0) {
          resposta = "{\"erro\":\"Sem leitura. Fora de alcance ou desconectado.\"}";
        } else {
          float distancia = duracao * 0.034 / 2.0;
          resposta = "{\"distancia_cm\":" + String(distancia, 2) + "}";
          Serial.print("📏 Distância medida: ");
          Serial.print(distancia);
          Serial.println(" cm");
        }
      } else {
        resposta = "{\"erro\":\"Sensor desligado\"}";
      }

      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    } 
    else {
      String resposta = "{\"erro\":\"rota invalida\",\"rota\":\"" + path + "\"}";
      client.println("HTTP/1.1 404 Not Found");
      client.println("Content-Type: application/json");
      client.println("Connection: close");
      client.println();
      client.println(resposta);
      client.stop();
    }
  }

  // Leitura da serial (opcional)
  if (Serial.available()) {
    String dadoRecebido = Serial.readStringUntil('\n');
    Serial.println("📡 Dado recebido via Serial:");
    Serial.println(dadoRecebido);
  }

  // Exemplo simples: ler botão e piscar LED
  if (digitalRead(botaoOnboard) == LOW) {
    digitalWrite(ledOnboard, HIGH);
  } else {
    digitalWrite(ledOnboard, LOW);
  }
}
