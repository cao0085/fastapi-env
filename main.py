from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv
import json

load_dotenv()

client = genai.Client()
app = FastAPI()

sessions = {}


class ChatRequest(BaseModel):
    session_id: str
    message: str


class WalkingLineRequest(BaseModel):
    key: str
    progression: str
    bars: int


@app.get("/")
def root():
    return {"message": "Hello World"}


@app.post("/chat")
def chat(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="message 不能為空")
    try:
        if req.session_id not in sessions:
            sessions[req.session_id] = client.chats.create(model="gemini-3-flash-preview")

        chat_session = sessions[req.session_id]
        response = chat_session.send_message(req.message)

        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/walking-line")
def walking_line(req: WalkingLineRequest):
    try:
        response = client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=f"生成一個 jazz bass walking line，調性 {req.key}，{req.progression}，{req.bars} 小節",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema={
                    "type": "object",
                    "properties": {
                        "key": {"type": "string"},
                        "progression": {"type": "string"},
                        "bars": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "chord": {"type": "string"},
                                    "notes": {"type": "array", "items": {"type": "string"}}
                                }
                            }
                        }
                    }
                }
            )
        )
        return json.loads(response.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
