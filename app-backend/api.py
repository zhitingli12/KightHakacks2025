from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Tuple
import sys
import os
import re
import subprocess

# -------------------------------------------------------------------
# Local module paths
# -------------------------------------------------------------------
BASE_DIR = os.path.dirname(__file__)
sys.path.append(os.path.join(BASE_DIR, "functions"))
sys.path.append(os.path.join(BASE_DIR, "multi-tool-agent"))

# -------------------------------------------------------------------
# Local imports
# -------------------------------------------------------------------
from osm_api import (
    get_city_boundary,
    get_city_boundary_geojson,
    list_available_cities,
    reverse_geocode_coordinate,
)

# Note: imported to keep parity with your project structure
# (not used directly since we're calling the CLI runner for statelessness)
from agent import root_agent, summarization_agent  # noqa: F401

# -------------------------------------------------------------------
# FastAPI app setup
# -------------------------------------------------------------------
app = FastAPI(
    title="Geography API",
    description="API for city boundary, city coordinates, and location services",
    version="1.0.0",
)

# CORS for local frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Pydantic Models
# -------------------------------------------------------------------
class LocationResponse(BaseModel):
    city: str
    state: str
    county: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    location_info: dict

class CityBoundaryResponse(BaseModel):
    city: str
    boundary: List[Tuple[float, float]]
    center: Tuple[float, float]
    bbox: Tuple[float, float, float, float]
    location_info: dict

class CitiesListResponse(BaseModel):
    cities: List[dict]
    count: int
    search_center: Tuple[float, float]
    search_radius_km: int
    location_info: dict

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------
def format_insurance_response(text: str) -> str:
    """
    Preserve paragraphs and add gentle structure for readability.
    - Keep existing newlines
    - Bold short header-like lines
    - Normalize list bullets
    - Add spacing between bullets and paragraphs
    """
    s = (text or "").replace("\r\n", "\n").strip()

    # Emphasize short header-like lines that end with ":" on their own
    s = re.sub(r'(?m)^\s*([^\n]{3,80}):\s*$', r'**\1:**', s)

    # Normalize lists: turn "-" / "*" / "1." into bullets
    s = re.sub(r'(?m)^\s*[-*]\s+', '• ', s)
    s = re.sub(r'(?m)^\s*\d+\.\s+', '• ', s)

    # Ensure a blank line before bullets to avoid wall-of-text
    s = re.sub(r'(?m)([^\n])\n(• )', r'\1\n\n\2', s)

    # If absolutely no paragraph breaks exist, add soft breaks after sentence ends
    if "\n\n" not in s:
        s = re.sub(r'([.!?])\s+(?=[A-Z0-9])', r'\1\n\n', s)

    # Collapse 3+ blank lines to at most two
    s = re.sub(r'\n{3,}', '\n\n', s)

    # Optional title if the response doesn't already start styled
    if not s.lower().startswith(("##", "**", "🏠", "insurance", "geography", "hello", "hi")):
        s = f"🏠 **Insurance Expert Response**\n\n{s}"

    # Helpful closing
    if not any(k in s.lower() for k in ("help", "question", "more details")):
        s += "\n\n💡 *Need more details? Ask about coverage, pricing, or local risk factors.*"

    return s.strip()


def run_adk_once(prompt: str, agent_id: str = "multi-tool-agent", timeout_sec: int = 45) -> str:
    """
    Invoke the ADK CLI once (stateless). Returns combined output (stdout / fallback to stderr if meaningful).
    - Keeps things stateless (no session mgmt here).
    - Encourage the agent to emit Markdown for better spacing.
    """
    # Encourage structured, readable output
    full_input = (
        "Please respond in clear Markdown with short headings and bullet points where helpful. "
        "Keep paragraphs separated with blank lines for readability.\n\n"
        f"{prompt}"
    )
    result = subprocess.run(
        ["adk", "run", agent_id],
        input=full_input,
        cwd=BASE_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=timeout_sec,
        shell=False,
    )

    # Prefer stdout; use stderr if it contains non-error content
    stdout = (result.stdout or "").strip()
    stderr = (result.stderr or "").strip()

    if stdout:
        return stdout
    if stderr and "error" not in stderr.lower():
        return stderr
    return ""


def summarize_markdown(text: str, timeout_sec: int = 25) -> str:
    """
    Ask the agent (via CLI) to produce a concise, well-formatted Markdown summary.
    Falls back to original text on failure.
    """
    if not text.strip():
        return ""

    prompt = (
        "Summarize the following content for a homeowner audience. "
        "Use Markdown with short headings and bullet points. "
        "Keep it concise but readable, and preserve any important lists or structure.\n\n"
        f"{text}"
    )
    try:
        output = run_adk_once(prompt, agent_id="multi-tool-agent", timeout_sec=timeout_sec)
        return output.strip() or text
    except Exception:
        return text

# -------------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------------
@app.get("/")
async def root():
    return {
        "message": "Geography API - Connected",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "reverse_geocode": "/reverse-geocode",
            "city_boundary": "/city-boundary",
            "cities_list": "/cities",
            "user_workflow": "/user-location-workflow",
            "chat": "/chat",
        },
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Simple stateless chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(chat_message: ChatMessage):
    """
    Stateless chat with the Home Insurance Expert (via ADK CLI).
    Each message is processed independently; no memory is kept.
    """
    try:
        user_input = (chat_message.message or "").strip()
        if not user_input:
            return ChatResponse(response="Please provide a message.")

        # 1) Run the main agent statelessly via CLI
        agent_output = run_adk_once(user_input, agent_id="multi-tool-agent", timeout_sec=60)

        # 2) Summarize/clean it (still stateless) to ensure spacing/Markdown
        if agent_output:
            summarized = summarize_markdown(agent_output, timeout_sec=30)
            formatted = format_insurance_response(summarized)
            return ChatResponse(response=formatted)

        # Fallback if nothing came back
        return ChatResponse(
            response=(
                f"I received your message: '{user_input}'. I'm your home insurance expert ready to help! "
                "Tell me a bit more about your coverage needs or location."
            )
        )

    except subprocess.TimeoutExpired:
        return ChatResponse(
            response="The agent took too long to respond. Please try again with a shorter question."
        )
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        return ChatResponse(
            response="I'm having trouble right now. Please try again."
        )

# -------------------------------------------------------------------
# Geographic API Endpoints (unchanged)
# -------------------------------------------------------------------
@app.get("/reverse-geocode", response_model=LocationResponse)
async def reverse_geocode_endpoint(
    lat: float = Query(..., description="Latitude coordinate"),
    lon: float = Query(..., description="Longitude coordinate")
):
    try:
        result = reverse_geocode_coordinate(lat, lon)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in reverse geocoding: {str(e)}")

@app.get("/city-boundary", response_model=CityBoundaryResponse)
async def city_boundary_endpoint(
    city: str = Query(..., description="City name to get boundary for")
):
    try:
        result = get_city_boundary(city)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting city boundary: {str(e)}")

@app.get("/city-boundary-geojson")
async def city_boundary_geojson_endpoint(
    city: str = Query(..., description="City name to get GeoJSON boundary for")
):
    try:
        result = get_city_boundary_geojson(city)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting city boundary GeoJSON: {str(e)}")

@app.get("/cities", response_model=CitiesListResponse)
async def cities_list_endpoint(
    lat: float = Query(..., description="Latitude coordinate for search center"),
    lon: float = Query(..., description="Longitude coordinate for search center"),
    radius_km: int = Query(50, description="Search radius in kilometers")
):
    try:
        result = list_available_cities(lat, lon, radius_km)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing cities: {str(e)}")

@app.get("/user-location-workflow")
async def user_location_workflow(
    lat: float = Query(..., description="User's latitude"),
    lon: float = Query(..., description="User's longitude"),
    radius_km: int = Query(50, description="Search radius in kilometers")
):
    try:
        user_location = reverse_geocode_coordinate(lat, lon)
        nearby_cities = list_available_cities(lat, lon, radius_km)
        
        return {
            "user_location": user_location,
            "nearby_cities": nearby_cities,
            "workflow_complete": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in user location workflow: {str(e)}")

# -------------------------------------------------------------------
# Entrypoint
# -------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
