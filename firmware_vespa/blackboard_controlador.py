import RPi.GPIO as GPIO
import time

pino_saida = 2
GPIO.setmode(GPIO.BCM)
GPIO.setup(pino_saida, GPIO.OUT)

print("Enviando sinal para VESPA ligar...")

GPIO.output(pino_saida, GPIO.HIGH)
time.sleep(0.5)
GPIO.output(pino_saida, GPIO.LOW)

print("Sinal enviado.")