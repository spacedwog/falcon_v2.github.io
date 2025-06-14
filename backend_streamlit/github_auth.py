import os
import requests
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("GITHUB_TOKEN")

def login_user(username):
    response = requests.get("https://api.github.com/user", auth=(username, TOKEN))
    return response.status_code == 200