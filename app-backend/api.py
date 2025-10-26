from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
import sys
import os
import json

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

from agent import root_agent, summarization_agent
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

#creating a Pydantic model to define the request body structure
class LocationResponse(BaseModel):
    city: str
    state: str
    county: Optional[str] = None
    country: str
    latitude: float
    longitude: float
    location_info: dict

class MapClickResponse(BaseModel):
    clicked_location: dict
    location_info: LocationResponse
    nearby_cities: List[str]

class CityBoundaryResponse(BaseModel):
    city: str
    boundary: List[Tuple[float, float]]
    center: Tuple[float, float]
    bbox: Tuple[float, float, float, float]
    location_info: dict

class CitiesListResponse(BaseModel):
    bbox: Tuple[float, float, float, float]
    total_cities: int
    cities: List[str]

class UserLocationWorkflowResponse(BaseModel):
    user_location: dict  # Expecting {'lat': float, 'lon': float}
    search_area: dict
    city_boundary_found: bool
    location_info: dict

# Simple chat models - no session needed
class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# -------------------------------------------------------------------
# Helper Functions
# -------------------------------------------------------------------
def format_insurance_response(response_text: str) -> str:
    """
    Format insurance agent response with better structure and readability.
    """
    # Clean up the text first
    clean_text = response_text.strip()
    
    # Split into sentences for better processing
    sentences = clean_text.replace('. ', '.|').split('|')
    sentences = [s.strip() for s in sentences if s.strip()]
    
    formatted_parts = []
    current_section = []
    
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
            
        # Check if this looks like a header/section
        if (any(keyword in sentence.lower() for keyword in 
               ['recommendation', 'coverage', 'risk', 'price', 'cost', 'factors', 'benefits']) 
            and len(sentence) < 80):
            # If we have accumulated content, add it as a section
            if current_section:
                formatted_parts.append(' '.join(current_section))
                current_section = []
            # Add the header
            formatted_parts.append(f"\n**{sentence.rstrip('.')}:**")
        else:
            current_section.append(sentence)
    
    # Add any remaining content
    if current_section:
        formatted_parts.append(' '.join(current_section))
    
    # Join everything together
    result = '\n'.join(formatted_parts)
    
    # Add bullet points for lists
    lines = result.split('\n')
    formatted_lines = []
    
    for line in lines:
        line = line.strip()
        if not line:
            formatted_lines.append('')
            continue
            
        # Convert items that look like lists to bullet points with better formatting
        if (line and not line.startswith('**') and not line.startswith('•') and 
            (',' in line or 'and ' in line) and len(line) > 50):
            # Try to split on common delimiters
            if ': ' in line:
                parts = line.split(': ', 1)
                if len(parts) == 2:
                    formatted_lines.append(f"🔹 **{parts[0]}:** {parts[1]}")
                else:
                    formatted_lines.append(f"🔹 {line}")
            else:
                formatted_lines.append(f"🔹 {line}")
        elif line.startswith('**') and line.endswith(':**'):
            # Format section headers with better styling
            formatted_lines.append(f"📋 {line}")
        else:
            formatted_lines.append(line)
    
    # Clean up extra spaces and add better spacing
    final_result = '\n'.join(formatted_lines)
    
    # Add more spacing between sections for better readability
    final_result = final_result.replace('**', '\n**')  # Add line break before headers
    final_result = final_result.replace(':\n•', ':\n\n•')  # Space between headers and bullets
    final_result = final_result.replace('\n•', '\n\n•')  # Space between bullet points
    
    # Clean up excessive newlines (max 3 for good spacing)
    while '\n\n\n\n' in final_result:
        final_result = final_result.replace('\n\n\n\n', '\n\n\n')
    
    # Add greeting and closing for better UX
    if final_result and not final_result.startswith('Hello') and not final_result.startswith('Hi'):
        final_result = f"🏠 **Insurance Expert Response:**\n\n{final_result}"
    
    # Add a helpful closing
    if not any(word in final_result.lower() for word in ['question', 'help', 'more']):
        final_result += f"\n\n💡 *Need more specific information? Feel free to ask about coverage details, pricing, or risk factors for your area.*"
    
    return final_result.strip()

@app.get("/")
async def root():
    return {
        "message": "Geography API - Connected",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "reverse_geocode": "/reverse-geocode",
            "city_boundary": "/city-boundary",
            "cities_list": "/cities",
            "user_workflow": "/user-location-workflow",
            "chat": "/chat"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# Simple stateless chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_with_agent(chat_message: ChatMessage):
    """
    Simple stateless chat with Home Insurance Expert.
    Each message is processed independently.
    """
    try:
        user_input = chat_message.message.strip()
        print(f"Received message: {user_input}")  # Debug log
        
        if not user_input:
            return ChatResponse(response="Please provide a message.")
        
        # Simple approach: Save user input to file and run agent
        try:
            import subprocess
            
            # Create input file path
            input_file_path = os.path.join(os.path.dirname(__file__), "user_input.txt")
            
            # Save user input to text file
            with open(input_file_path, 'w', encoding='utf-8') as f:
                f.write(user_input)
            
            print(f"Saved input to: {input_file_path}")
            
            # Run ADK CLI command with better output capture
            result = subprocess.run(
                ['adk', 'run', 'multi-tool-agent'],
                input=user_input,
                cwd=os.path.dirname(__file__),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                timeout=30,
                shell=False
            )
            
            # Process the output
            print(f"Return code: {result.returncode}")
            print(f"stdout: '{result.stdout}'")
            print(f"stderr: '{result.stderr}'")
            
            # Check for any output (stdout or stderr might contain the response)
            agent_output = ""
            if result.stdout and result.stdout.strip():
                agent_output = result.stdout.strip()
            elif result.stderr and result.stderr.strip() and "error" not in result.stderr.lower():
                # Sometimes agent output goes to stderr
                agent_output = result.stderr.strip()
            
            if agent_output:
                print(f"Captured agent output: {agent_output}")
                
                # Use summarization agent to condense the response
                try:
                    # Run summarizer agent on the output
                    summary_result = subprocess.run(
                        ['adk', 'run', 'multi-tool-agent'],
                        input=f"Please summarize this text concisely: {agent_output}",
                        cwd=os.path.dirname(__file__),
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        text=True,
                        timeout=15
                    )
                    
                    if summary_result.returncode == 0 and summary_result.stdout.strip():
                        summarized_output = summary_result.stdout.strip()
                        print(f"Summarized output: {summarized_output}")
                    else:
                        # If summarization fails, use original output
                        summarized_output = agent_output
                        print("Summarization failed, using original output")
                    
                except Exception as summary_error:
                    print(f"Summarization error: {summary_error}")
                    summarized_output = agent_output
                
                # Format response with better structure and spacing
                formatted_response = format_insurance_response(summarized_output)
                
                print(f"Final formatted response: {formatted_response}")
                return ChatResponse(response=formatted_response)
            else:
                print("No output captured from agent")
                # Return fallback response that includes the user input
                return ChatResponse(
                    response=f"I received your message: '{user_input}'. I'm your home insurance expert ready to help! Based on your location, I can provide recommendations for Orlando, Florida."
                )
        
        except Exception as subprocess_error:
            print(f"Subprocess agent call failed: {subprocess_error}")
            return ChatResponse(
                response=f"I see you mentioned '{user_input}'. I'm your home insurance expert ready to help! Please tell me more about your insurance needs."
            )
            
    except Exception as e:
        print(f"Chat endpoint error: {str(e)}")
        return ChatResponse(
            response="I'm having trouble right now. Please try again."
        )

@app.get("/reverse-geocode", response_model=LocationResponse)
async def reverse_geocode(
    lat: float = Query(..., description = "Latitude of the location", ge = -90, le = 90),
    lon: float = Query(..., description = "Longitude of the location", ge = -180, le = 180),
    radius_km: float = Query(25, description = "Radius in kilometers to search within", ge =1, le = 100),
):
    """
    Convert coordinates to location information (country, state, county, city).
    
    - **lat**: Latitude (-90 to 90)
    - **lon**: Longitude (-180 to 180) 
    - **radius_km**: Search radius in kilometers (1-100)
    """
    try:
        location_info = reverse_geocode_coordinate(lat, lon, radius_km)
        return LocationResponse(**location_info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/city-boundary", response_model=CityBoundaryResponse)
async def get_city_boundary_api(
    city_name: str = Query(..., description = "Name of city to find"),
    min_lat: float = Query(..., description="Minimum latitude of bounding box"),
    min_lon: float = Query(..., description="Minimum longitude of bounding box"),
    max_lat: float = Query(..., description="Maximum latitude of bounding box"),
    max_lon: float = Query(..., description="Maximum longitude of bounding box"),
    return_geojson: bool = Query(True, description="Return GeoJSON format")
):
    """
    Get boundary information for a specific city within a bounding box.
    
    - **city_name**: Name of the city (case-insensitive)
    - **min_lat, min_lon, max_lat, max_lon**: Bounding box coordinates
    - **return_geojson**: Whether to return GeoJSON format
    """
    try:
        bbox = (min_lat, min_lon, max_lat, max_lon)
        
        if return_geojson:
            geojson_data = get_city_boundary_geojson(city_name, bbox=bbox)
            
            if "error" in geojson_data:
                return CityBoundaryResponse(
                    city_name=city_name,
                    found=False
                )
            
            return CityBoundaryResponse(
                city_name=city_name,
                found=True,
                geojson=geojson_data
            )
        else:
            city_gdf = get_city_boundary(city_name, bbox=bbox)
            
            if city_gdf.empty:
                return CityBoundaryResponse(
                    city_name=city_name,
                    found=False
                )
            
            city_data = city_gdf.iloc[0]
            return CityBoundaryResponse(
                city_name=city_name,
                found=True,
                osm_id=int(city_data['osm_id']),
                place_type=city_data['place_type'],
                coordinates={
                    "lat": city_data.geometry.y,
                    "lon": city_data.geometry.x
                }
            )
            
    except Exception as e:
        print(f"Error in get_city_boundary_api: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting city boundary: {str(e)}")

# 3. Cities List Endpoint
@app.get("/cities", response_model=CitiesListResponse)
async def get_cities_list(
    min_lat: float = Query(..., description="Minimum latitude of bounding box"),
    min_lon: float = Query(..., description="Minimum longitude of bounding box"), 
    max_lat: float = Query(..., description="Maximum latitude of bounding box"),
    max_lon: float = Query(..., description="Maximum longitude of bounding box")
):
    """
    Get list of all available cities within a bounding box.
    
    - **min_lat, min_lon, max_lat, max_lon**: Bounding box coordinates
    """
    try:
        bbox = (min_lat, min_lon, max_lat, max_lon)
        cities = list_available_cities(bbox=bbox)
        
        return CitiesListResponse(
            bbox=bbox,
            total_cities=len(cities),
            cities=cities
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting cities list: {str(e)}")

# 4. Complete User Location Workflow
@app.get("/user-location-workflow", response_model=UserLocationWorkflowResponse)
async def user_location_workflow(
    lat: float = Query(..., description="User's latitude coordinate", ge=-90, le=90),
    lon: float = Query(..., description="User's longitude coordinate", ge=-180, le=180),
    search_radius_km: float = Query(25, description="Search radius around user in km", ge=5, le=100)
):
    """
    Complete workflow: Get user's city + create city-wide search area.
    
    - **lat**: User's latitude
    - **lon**: User's longitude  
    - **search_radius_km**: Search radius for nearby cities
    """
    try:
        # Step 1: Reverse geocode user location
        location_info = reverse_geocode_coordinate(lat, lon, search_radius_km)
        
        if not location_info['city']:
            raise HTTPException(status_code=404, detail="Could not determine user's city")
        
        # Step 2: Create search bounding box
        radius_degrees = search_radius_km / 111.0
        bbox = (
            lat - radius_degrees,
            lon - radius_degrees,
            lat + radius_degrees,
            lon + radius_degrees
        )
        
        # Step 3: Get nearby cities
        nearby_cities = list_available_cities(bbox=bbox)
        
        # Step 4: Try to get user's city boundary
        user_city = location_info['city']
        city_boundary = get_city_boundary(user_city, bbox=bbox)
        
        return UserLocationWorkflowResponse(
            user_location={
                "lat": lat,
                "lon": lon,
                "city": user_city,
                "state": location_info['state'],
                "country": location_info['country']
            },
            search_area={
                "bbox": bbox,
                "radius_km": search_radius_km,
                "all_cities": nearby_cities,
                "total_cities": len(nearby_cities)
            },
            city_boundary_found=not city_boundary.empty,
            location_info=location_info
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in user workflow: {str(e)}")

# 5. Convenience endpoints with preset locations
@app.get("/miami-area")
async def get_miami_area():
    """Get cities in Miami metropolitan area (preset bounding box)"""
    miami_bbox = (25.0, -81.0, 27.0, -79.5)  # South Florida
    cities = list_available_cities(bbox=miami_bbox)
    
    return {
        "area": "Miami Metropolitan Area",
        "bbox": miami_bbox,
        "total_cities": len(cities),
        "cities": cities
    }

@app.get("/examples")
async def get_examples():
    """Get example API calls for testing"""
    return {
        "examples": {
            "reverse_geocode_miami": {
                "url": "/reverse-geocode?lat=25.7617&lon=-80.1918&radius_km=25",
                "description": "Find what city Miami coordinates are in"
            },
            "miami_boundary": {
                "url": "/city-boundary?city_name=Miami&min_lat=25.0&min_lon=-81.0&max_lat=27.0&max_lon=-79.5",
                "description": "Get Miami city boundary"
            },
            "south_florida_cities": {
                "url": "/cities?min_lat=25.0&min_lon=-81.0&max_lat=27.0&max_lon=-79.5", 
                "description": "List all cities in South Florida"
            },
            "user_workflow_miami": {
                "url": "/user-location-workflow?lat=25.7617&lon=-80.1918&search_radius_km=25",
                "description": "Complete workflow for Miami user"
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)