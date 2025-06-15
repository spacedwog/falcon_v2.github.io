from gpiozero import OutputDevice
from time import sleep

pino_saida = 2
gpio = OutputDevice(pino_saida)

print("Enviando sinal para VESPA ligar...")

gpio.on()
sleep(0.5)
gpio.off()

print("Sinal enviado.")