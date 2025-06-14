import requests
<<<<<<< HEAD
import os
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("GITHUB_TOKEN")

def login_user(username):
    response = requests.get("https://api.github.com/user", auth=(username, TOKEN))
=======

def login_user(username, token):
    response = requests.get("https://api.github.com/user", auth=(username, token))
>>>>>>> af586de9ea55b2a5ddbbf0e0a05a8632e88d8386
    return response.status_code == 200