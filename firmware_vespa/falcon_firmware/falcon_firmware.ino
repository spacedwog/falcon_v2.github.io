const int leds[] = {4, 27, 13, 14};

void setup() {
  for (int i = 0; i < 4; i++) {
    pinMode(leds[i], OUTPUT);
  }
}

void loop() {
  for (int i = 0; i < 4; i++) {
    digitalWrite(leds[i], HIGH);
  }
  delay(500);
  for (int i = 0; i < 4; i++) {
    digitalWrite(leds[i], LOW);
  }
  delay(500);
}
