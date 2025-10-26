from fastapi import FastAPI, Query, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
import sys
import os
import json
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sys.path.append(os.path.join(os.path.dirname(__file__), 'functions'))

from osm_api import (
    get_city_boundary,
    get_city_boundary_geojson,
    list_available_cities,
    reverse_geocode_coordinate
)

import inspect
logger.info(
    "reverse_geocode_coordinate comes from %s with signature %s",
    reverse_geocode_coordinate.__code__.co_filename,
    inspect.signature(reverse_geocode_coordinate),
)

app = FastAPI(
    title="Geography API",
    description="API for city boundary, city coordinates, and find user location based on coordinates",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class MapClickRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude coordinate")
    lon: float = Field(..., ge=-180, le=180, description="Longitude coordinate")

    class Config:
        json_schema_extra = {
            "example": {
                "lat": 25.7617,
                "lon": -80.1918
            }
        }

class LocationResponse(BaseModel):
    country: Optional[str] = None
    state: Optional[str] = None
    county: Optional[str] = None
    city: Optional[str] = None
    all_cities_nearby: List[str] = []
    coordinates: dict

class MapClickResponse(BaseModel):
    clicked_location: dict
    location_info: LocationResponse
    nearby_cities: List[str]

class CityBoundaryResponse(BaseModel):
    city_name: str
    found: bool
    osm_id: Optional[int] = None
    place_type: Optional[str] = None
    coordinates: Optional[dict] = None
    geojson: Optional[dict] = None

class CitiesListResponse(BaseModel):
    bbox: Tuple[float, float, float, float]
    total_cities: int
    cities: List[str]

class UserLocationWorkflowResponse(BaseModel):
    user_location: dict
    search_area: dict
    city_boundary_found: bool
    location_info: dict

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "City Boundaries API - Connected",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "reverse_geocode": "/reverse-geocode",
            "city_boundary": "/city-boundary",
            "cities_list": "/cities",
            "user_workflow": "/user-location-workflow",
            "map_click": "/map-click (POST)"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

# MAP CLICK ENDPOINT - Main endpoint for frontend clicks
@app.post("/map-click", response_model=MapClickResponse)
async def handle_map_click(request: MapClickRequest):
    """
    Handle map click events from frontend.
    Returns location info and nearby cities for the clicked coordinates.
    """
    try:
        lat = request.lat
        lon = request.lon
        
        logger.info(f"=== MAP CLICK RECEIVED ===")
        logger.info(f"Latitude: {lat}")
        logger.info(f"Longitude: {lon}")
        
        # Get location information - FIXED: use search_radius_km instead of radius_km
        logger.info("Calling reverse_geocode_coordinate...")
        location_info = reverse_geocode_coordinate(lat, lon, search_radius_km=25)
        logger.info(f"Location info received: {location_info}")
        
        # Get nearby cities from the function's response
        nearby_cities = location_info.get('all_cities_nearby', [])
        
        # Also try to get more cities using list_available_cities
        try:
            radius_degrees = 25 / 111.0
            bbox = (
                lat - radius_degrees,
                lon - radius_degrees,
                lat + radius_degrees,
                lon + radius_degrees
            )
            
            logger.info(f"Fetching additional cities in bbox: {bbox}")
            additional_cities = list_available_cities(bbox=bbox)
            logger.info(f"Found {len(additional_cities)} additional cities")
            
            # Combine and deduplicate
            all_nearby = list(set(nearby_cities + additional_cities))
            nearby_cities = sorted(all_nearby)[:10]  # Limit to 10
            
        except Exception as e:
            logger.error(f"Error fetching additional cities: {e}")
            # Use what we got from reverse_geocode_coordinate
            nearby_cities = nearby_cities[:10]
        
        response = MapClickResponse(
            clicked_location={
                "lat": lat,
                "lon": lon
            },
            location_info=LocationResponse(**location_info),
            nearby_cities=nearby_cities
        )
        
        logger.info("=== MAP CLICK RESPONSE PREPARED ===")
        return response
        
    except Exception as e:
        logger.error(f"Error in map-click endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing map click: {str(e)}")

@app.get("/reverse-geocode", response_model=LocationResponse)
async def reverse_geocode(
    lat: float = Query(..., description="Latitude of the location", ge=-90, le=90),
    lon: float = Query(..., description="Longitude of the location", ge=-180, le=180),
    radius_km: float = Query(25, description="Radius in kilometers to search within", ge=1, le=100),
):
    """
    Convert coordinates to location information (country, state, county, city).
    """
    try:
        logger.info(f"Reverse geocoding: lat={lat}, lon={lon}, radius_km={radius_km}")
        
        # FIXED: use search_radius_km parameter name
        location_info = reverse_geocode_coordinate(lat, lon, search_radius_km=radius_km)
        
        return LocationResponse(**location_info)
    except Exception as e:
        logger.error(f"Error in reverse-geocode: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/city-boundary", response_model=CityBoundaryResponse)
async def get_city_boundary_api(
    city_name: str = Query(..., description="Name of city to find"),
    min_lat: float = Query(..., description="Minimum latitude of bounding box"),
    min_lon: float = Query(..., description="Minimum longitude of bounding box"),
    max_lat: float = Query(..., description="Maximum latitude of bounding box"),
    max_lon: float = Query(..., description="Maximum longitude of bounding box"),
    return_geojson: bool = Query(True, description="Return GeoJSON format")
):
    """Get boundary information for a specific city within a bounding box."""
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
        logger.error(f"Error in get_city_boundary_api: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting city boundary: {str(e)}")

@app.get("/cities", response_model=CitiesListResponse)
async def get_cities_list(
    min_lat: float = Query(..., description="Minimum latitude of bounding box"),
    min_lon: float = Query(..., description="Minimum longitude of bounding box"), 
    max_lat: float = Query(..., description="Maximum latitude of bounding box"),
    max_lon: float = Query(..., description="Maximum longitude of bounding box")
):
    """Get list of all available cities within a bounding box."""
    try:
        bbox = (min_lat, min_lon, max_lat, max_lon)
        logger.info(f"Fetching cities for bbox: {bbox}")
        cities = list_available_cities(bbox=bbox)
        
        return CitiesListResponse(
            bbox=bbox,
            total_cities=len(cities),
            cities=cities
        )
        
    except Exception as e:
        logger.error(f"Error in get_cities_list: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error getting cities list: {str(e)}")

@app.get("/user-location-workflow", response_model=UserLocationWorkflowResponse)
async def user_location_workflow(
    lat: float = Query(..., description="User's latitude coordinate", ge=-90, le=90),
    lon: float = Query(..., description="User's longitude coordinate", ge=-180, le=180),
    search_radius_km: float = Query(25, description="Search radius around user in km", ge=5, le=100)
):
    """Complete workflow: Get user's city + create city-wide search area."""
    try:
        # Get location information - FIXED: use correct parameter name
        location_info = reverse_geocode_coordinate(lat, lon, search_radius_km=search_radius_km)
        
        if not location_info.get('city'):
            raise HTTPException(status_code=404, detail="Could not determine user's city")
        
        # Create search bounding box
        radius_degrees = search_radius_km / 111.0
        bbox = (
            lat - radius_degrees,
            lon - radius_degrees,
            lat + radius_degrees,
            lon + radius_degrees
        )
        
        # Get nearby cities
        nearby_cities = list_available_cities(bbox=bbox)
        
        # Try to get user's city boundary
        user_city = location_info['city']
        city_boundary = get_city_boundary(user_city, bbox=bbox)
        
        return UserLocationWorkflowResponse(
            user_location={
                "lat": lat,
                "lon": lon,
                "city": user_city,
                "state": location_info.get('state'),
                "country": location_info.get('country')
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
        logger.error(f"Error in user_location_workflow: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error in user workflow: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 Starting FastAPI server...")
    print("="*50)
    print("📍 API available at: http://localhost:8000")
    print("📚 Documentation: http://localhost:8000/docs")
    print("💚 Health check: http://localhost:8000/health")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")