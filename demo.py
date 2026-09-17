import requests

url = "https://api.z.ai/api/paas/v4/chat/completions"

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-api-key"
}

payload = {
    "model": "glm-5.2",
    "messages": [
        {
            "role": "system",
            "content": "You are a senior full-stack software engineer, proficient in frontend development, backend architecture design, and modern web technology stacks."
        },
        {
            "role": "user",
            "content": "Design and build a personal blog website for me, including a homepage, article list page, and article detail page, using React + Node.js technology stack."
        }
    ],
    "thinking": {
        "type": "enabled"
    },
    "reasoning_effort": "max",
    "stream": False,  # Sin streaming
    "max_tokens": 4096,
    "temperature": 1.0
}

response = requests.post(url, headers=headers, json=payload)

if response.status_code == 200:
    data = response.json()
    # Extraer la respuesta
    content = data['choices'][0]['message']['content']
    print(content)
else:
    print(f"Error: {response.status_code}")
    print(response.text)
