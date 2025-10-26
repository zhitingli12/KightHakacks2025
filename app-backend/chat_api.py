from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import asyncio
import os
import sys

# Add the multi-tool-agent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'multi-tool-agent'))

try:
    from multi_tool_agent.agent import root_agent
except ImportError:
    # Alternative import method
    import importlib.util
    spec = importlib.util.spec_from_file_location("agent", os.path.join(os.path.dirname(__file__), 'multi-tool-agent', 'agent.py'))
    agent_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(agent_module)
    root_agent = agent_module.root_agent

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: str = None

@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(chat_message: ChatMessage):
    try:
        # Create a simple conversation with the agent
        response_text = ""
        
        # Run the agent with the user's message
        async for event in root_agent.run_async(chat_message.message):
            if hasattr(event, 'text') and event.text:
                response_text += event.text
            elif hasattr(event, 'content') and event.content:
                response_text += str(event.content)
        
        if not response_text:
            response_text = "I'm here to help you with home insurance questions. Could you please provide more details?"
        
        return ChatResponse(
            response=response_text.strip(),
            success=True
        )
    
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return ChatResponse(
            response="I'm sorry, I'm having trouble processing your request right now. Please try again.",
            success=False,
            error=str(e)
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agent": "home_insurance_expert"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)