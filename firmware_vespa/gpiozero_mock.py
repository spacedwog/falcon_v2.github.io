class OutputDevice:
    def __init__(self, pin):
        print(f"Simulando GPIO no pino {pin}")

    def on(self):
        print("GPIO ON")

    def off(self):
        print("GPIO OFF")