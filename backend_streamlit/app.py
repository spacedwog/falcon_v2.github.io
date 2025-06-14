import streamlit as st
from github_auth import login_user

st.set_page_config(page_title="FALCON V2", layout="wide")

st.title("Sistema FALCON V2")

if 'auth' not in st.session_state:
    st.session_state.auth = False

if not st.session_state.auth:
    st.subheader("Login com GitHub")
    username = st.text_input("Usuário GitHub")
    token = st.text_input("Token Pessoal GitHub", type="password")
    if st.button("Entrar"):
        if login_user(username, token):
            st.session_state.auth = True
        else:
            st.error("Autenticação falhou")
else:
    st.success("Autenticado com sucesso!")
    st.write("Painel principal...")