from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Tuple
import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), 'functions'))

from osm_api import (
    get_city_boundary,
    get_city_boundary_geojson,
    list_available_cities,
    reverse_geocode_coordinate
)
app = FastAPI(
    title="Geography API",
    description="API for city boundary, city coordinates, and find user location based on coordinates",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#creating a Pydantic model to define the request body structure
class LocationResponse(BaseModel):
    country: Optional[str] = None
    state: Optional[str] = None
    county: Optional[str] = None
    city: Optional[str] = None
    all_cities_nearby: List[str] = []
    coordinates: dict

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
    user_location: dict  # Expecting {'lat': float, 'lon': float}
    search_area: dict
    city_boundary_found: bool
    location_info: dict
  
@app.get("/")
async def root():
    return {
        "message": "City Boundaries API - Connected",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "reverse_geocode": "/reverse-geocode",
            "city_boundary": "/city-boundary",
            "cities_list": "/cities",
            "user_workflow": "/user-location-workflow"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "API is running"}

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