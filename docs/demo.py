from pprint import pprint
from urllib.parse import urljoin

import requests
#username = "kuko53348"  # update to match your username!
#api_token = "7491e1987cb7c54f4cd443db68d2b0746d87e651"
#folder_app = "mysite"  # Update to match the name of your app folder

username = "gascon"  # update to match your username!
api_token = "14f6f56e23c3f92cc1690c238e28d229902d5ded" # Update to match your real API token
folder_app = "myapp"  # Update to match the name of your app folder

headers = {"Authorization": f"Token {api_token}"}
pythonanywhere_host = "www.pythonanywhere.com"  # or "eu.pythonanywhere.com" if your account is hosted on our EU servers
pythonanywhere_domain = "pythonanywhere.com"  # or "eu.pythonanywhere.com"

# make sure you don't use this domain already!
domain_name = f"{username}.{pythonanywhere_domain}"

api_base = f"https://{pythonanywhere_host}/api/v1/user/{username}/"
command = (
    f"/home/{username}/{folder_app}/.venv/bin/uvicorn "
    "--uds ${DOMAIN_SOCKET} "
    "myapp.main:app "
)

response = requests.post(
    urljoin(api_base, "websites/"),
    headers=headers,
    json={
        "domain_name": domain_name,
        "enabled": True,
        "webapp": {"command": command}
    },
)
pprint(response.json())