import streamlit as st
from utils.api_handler import send_command, get_status

st.title("FALCON V2 - Painel de Controle")

if st.button("Ligar LED"):
    send_command("led/on")
if st.button("Desligar LED"):
    send_command("led/off")

status = get_status()
st.write("Status do dispositivo:", status)