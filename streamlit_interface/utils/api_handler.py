import requests

BASE_URL = "http://192.168.15.8"  # IP do NodeMCU

def send_command(endpoint):
    try:
        r = requests.get(f"{BASE_URL}/{endpoint}")
        return r.text
    except:
        return "Falha na conexão"

def get_status():
    try:
        r = requests.get(f"{BASE_URL}/")
        return r.text
    except:
        return "Indisponível"