# === BLACKBOARD (Master - Python) ===
import serial
import time

vespa = serial.Serial('COM4', 115200, timeout=1)  # Substitua a porta
time.sleep(2)  # Aguarda VESPA reinicializar


def enviar_comando(comando):
    vespa.write((comando + '\n').encode())
    resposta = vespa.readline().decode().strip()
    print(f"[VESPA] {resposta}")


# Exemplo de interação
if __name__ == "__main__":
    enviar_comando("LIGAR_LED")
    time.sleep(1)
    enviar_comando("STATUS")
    time.sleep(1)
    enviar_comando("DESLIGAR_LED")
    time.sleep(1)
    enviar_comando("STATUS")