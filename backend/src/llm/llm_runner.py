import os
import json
import asyncio
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from astrapy import DataAPIClient
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

NIM_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions"

class QueryRequest(BaseModel):
    collectionName: str
    query: str

async def connectDB():
    try:
        token = os.getenv("ASTRA_DB_TOKEN")
        if not token:
            raise Exception("Token not found")
        
        client = DataAPIClient(token=token)
        
        endpoint = os.getenv("ASTRA_DB_URL")
        if not endpoint:
            raise Exception("Endpoint not found")
        
        # Use asyncio.to_thread to run synchronous code in a separate thread
        database = await asyncio.to_thread(client.get_database, endpoint)
        
        print(f"* Database: {database.info().name}\n")
        return database
    except Exception as e:
        print(f"Error: {e}")
        return None

async def searchDB(collectionName, query):
    try:
        database = await connectDB()
        if not database:
            raise Exception("Database not found")
        
        # Use asyncio.to_thread to run synchronous code in a separate thread
        collection = await asyncio.to_thread(database.get_collection, collectionName)
        
        print(f"* Collection: {collection.info().name}\n")
        print(f"* Query: {query}\n")
        
        # Use asyncio.to_thread to run synchronous code in a separate thread
        cursor = await asyncio.to_thread(
            collection.find, 
            {}, 
            sort={"$vectorize": query}, 
            limit=10, 
            include_similarity=True)
        
        data = await asyncio.to_thread(list, cursor)
        
        if not data or not len(data):
            raise Exception("No data found")
        
        print(f"* Data: {data}\n")
        return data
    except Exception as e:
        print(f"Error: {e}")
        return None

async def callNvidiaAPI(context, query):
    try:
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

        response = requests.post(NIM_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        result = response.json()

        choices = result.get("choices", [])
        answer = choices[0].get("message", {}).get("content", "No answer found.") if choices else "No answer found."

        return {"answer": answer}

    except requests.exceptions.RequestException as e:
        return {"error": f"API Request Error: {str(e)}"}

    except json.JSONDecodeError:
        return {"error": "Invalid JSON received from API"}

    except Exception as e:
        return {"error": f"Unexpected error: {str(e)}"}

@app.post("/query")
async def query_endpoint(request: QueryRequest):
    data = await searchDB(request.collectionName, request.query)
    if not data:
        raise HTTPException(status_code=404, detail="No data found")
    result = await callNvidiaAPI(data, request.query)
    return result

# Run the app with: uvicorn main:app --reload