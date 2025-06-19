class OutputDevice:
    def __init__(self, pin):
        print(f"Simulando GPIO no pino {pin}")

    def on(self):
        print("Forward")

    def off(self):
        print("Backward")