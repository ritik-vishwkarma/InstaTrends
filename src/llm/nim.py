import sys
import json
import requests
import os

# Read input from Node.js
input_data = json.loads(sys.stdin.read().strip())  # Ensure proper reading

context = input_data.get("context", "")
query = input_data.get("query", "")

NIM_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
    "accept": "application/json",
    "content-type": "application/json",
    "authorization": f"Bearer {os.getenv('NVIDIA_API_KEY')}"
}

payload = {
    "model": "nvidia/nemotron-mini-4b-instruct",
    "max_tokens": 1024,
    "stream": False,
    "temperature": 0.5,
    "top_p": 1,
    "stop": None,
    "frequency_penalty": 0,
    "presence_penalty": 0,
    "seed": 0,
    "messages": [
        {"role": "system", "content": f"Context: {json.dumps(context)}"},
        {"role": "user", "content": query}
    ]
}

try:
    response = requests.post(NIM_API_URL, json=payload, headers=headers)
    response.raise_for_status()
    result = response.json()

    # Ensure valid JSON output
    # output = json.dumps({"answer": result}, ensure_ascii=False)
    # print(output)  # Ensure we print the final JSON output
    
    answer = result.get("choices", [{}])[0].get("message", {}).get("content", "No answer found.")
    print(json.dumps({"answer": answer}))
    

except requests.exceptions.RequestException as e:
    print(json.dumps({"error": str(e)}))

except Exception as e:
    print(json.dumps({"error": str(e)}))

sys.stdout.flush()  # Ensure output is sent properly
