import requests

def login_user(username, token):
    response = requests.get("https://api.github.com/user", auth=(username, token))
    return response.status_code == 200