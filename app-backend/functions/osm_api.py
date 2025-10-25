import geopandas as gpd
import requests
from functools import lru_cache
import json

@lru_cache(maxsize=128)
def get_city_boundaries_by_bbox(bbox):
    """
    Fetch city boundaries from OpenStreetMap using Overpass API within a bounding box
    Results are cached to avoid repeated API calls
    
    Args:
        bbox (tuple): Bounding box (min_lat, min_lon, max_lat, max_lon)
    """
    
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    min_lat, min_lon, max_lat, max_lon = bbox
    
    # Simple query for city/town nodes (points) - more reliable than boundaries
    overpass_query = f"""[out:json][timeout:60];
(
  node["place"~"^(city|town)$"](bbox:{min_lat},{min_lon},{max_lat},{max_lon});
);
out;"""
    
    try:
        response = requests.get(overpass_url, params={'data': overpass_query})
        response.raise_for_status()
        
        data = response.json()
        
        # Convert OSM data to simple point-based GeoDataFrame
        features = []
        for element in data.get('elements', []):
            if element.get('type') == 'node' and 'tags' in element:
                tags = element.get('tags', {})
                name = tags.get('name')
                
                if name and 'lat' in element and 'lon' in element:
                    # Create a simple point geometry
                    feature = {
                        'type': 'Feature',
                        'properties': {
                            'name': name,
                            'osm_id': element.get('id'),
                            'place_type': tags.get('place', 'city'),
                            'population': tags.get('population'),
                            'element_type': 'node'
                        },
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [element['lon'], element['lat']]
                        }
                    }
                    features.append(feature)
        
        # Create GeoDataFrame from features
        if features:
            gdf = gpd.GeoDataFrame.from_features(features)
            return gdf
        else:
            # Return empty GeoDataFrame with expected columns if no data
            return gpd.GeoDataFrame(columns=['name', 'osm_id', 'place_type', 'population', 'element_type', 'geometry'])
            
    except Exception as e:
        print(f"Error fetching OSM data: {e}")
        # Return empty GeoDataFrame on error
        return gpd.GeoDataFrame(columns=['name', 'osm_id', 'place_type', 'population', 'element_type', 'geometry'])


def get_city_boundary(city_name, bbox=None):
    """
    Get the boundary of a specific city within a bounding box.
    
    Args:
        city_name (str): Name of the city to find (case-insensitive)
        bbox (tuple): Bounding box (min_lat, min_lon, max_lat, max_lon) - REQUIRED
        
    Returns:
        gpd.GeoDataFrame: GeoDataFrame with the city boundary, or empty if not found
    """
    
    if bbox is None:
        print("Error: bounding box is required. Please provide bbox=(min_lat, min_lon, max_lat, max_lon)")
        return gpd.GeoDataFrame(columns=['name', 'osm_id', 'place_type', 'population', 'element_type', 'geometry'])
    
    # Get city boundaries within the bounding box (uses cache)
    all_cities = get_city_boundaries_by_bbox(bbox)
    
    if all_cities.empty:
        print("No city data available in the specified area")
        return gpd.GeoDataFrame(columns=['name', 'osm_id', 'place_type', 'population', 'element_type', 'geometry'])
    
    # Search for the city (case-insensitive)
    city_match = all_cities[all_cities['name'].str.lower() == city_name.lower()]
    
    if city_match.empty:
        # Try partial match if exact match fails
        partial_match = all_cities[all_cities['name'].str.lower().str.contains(city_name.lower(), na=False)]
        if not partial_match.empty:
            print(f"Exact match not found. Found partial matches: {partial_match['name'].tolist()}")
            return partial_match
        else:
            print(f"City '{city_name}' not found in the specified area")
            available_cities = all_cities['name'].sort_values().tolist()[:10]
            print(f"Available cities (first 10): {available_cities}")
            return gpd.GeoDataFrame(columns=['name', 'osm_id', 'place_type', 'population', 'element_type', 'geometry'])
    
    return city_match


def get_city_boundary_geojson(city_name, bbox=None):
    """
    Get city boundary as GeoJSON for API responses.
    
    Args:
        city_name (str): Name of the city to find
        bbox (tuple): Bounding box (min_lat, min_lon, max_lat, max_lon) - REQUIRED
        
    Returns:
        dict: GeoJSON representation of the city boundary
    """
    city_gdf = get_city_boundary(city_name, bbox=bbox)
    
    if city_gdf.empty:
        return {
            "type": "FeatureCollection",
            "features": [],
            "error": f"City '{city_name}' not found"
        }
    
    # Convert to GeoJSON
    return json.loads(city_gdf.to_json())


def list_available_cities(bbox=None):
    """
    Get a list of all available cities in the specified bounding box.
    
    Args:
        bbox (tuple): Bounding box (min_lat, min_lon, max_lat, max_lon) - REQUIRED
    
    Returns:
        list: Sorted list of city names
    """
    if bbox is None:
        print("Error: bounding box is required. Please provide bbox=(min_lat, min_lon, max_lat, max_lon)")
        return []
        
    all_cities = get_city_boundaries_by_bbox(bbox)
    
    if all_cities.empty:
        return []
    
    return sorted(all_cities['name'].tolist())


def reverse_geocode_coordinate(lat, lon, search_radius_km=50):
    """
    Takes coordinates and returns what country, state, county, and city the coordinate is in.
    
    Args:
        lat (float): Latitude coordinate
        lon (float): Longitude coordinate
        search_radius_km (float): Search radius in kilometers (default: 50km)
        
    Returns:
        dict: Dictionary containing location information with keys:
              - country: Country name
              - state: State/province name
              - county: County name
              - city: City name
              - all_cities_nearby: List of nearby cities within search radius
    """
    from shapely.geometry import Point
    
    # Create point from coordinates
    point = Point(lon, lat)
    
    # Calculate bounding box around the point (approximately search_radius_km)
    # Rough conversion: 1 degree ≈ 111 km
    radius_degrees = search_radius_km / 111.0
    bbox = (
        lat - radius_degrees,  # min_lat
        lon - radius_degrees,  # min_lon
        lat + radius_degrees,  # max_lat
        lon + radius_degrees   # max_lon
    )
    
    # Initialize result
    result = {
        "country": None,
        "state": None,
        "county": None,
        "city": None,
        "all_cities_nearby": [],
        "coordinates": {"lat": lat, "lon": lon}
    }
    
    try:
        # First, try to get administrative boundaries using Overpass API
        result.update(_get_admin_boundaries_at_point(lat, lon))
        
        # Get nearby cities using our existing function
        cities_gdf = get_city_boundaries_by_bbox(bbox)
        
        if not cities_gdf.empty:
            # Set CRS for the GeoDataFrame (it should be WGS84/EPSG:4326)
            if cities_gdf.crs is None:
                cities_gdf = cities_gdf.set_crs('EPSG:4326')
            
            # For point geometries, we can't do contains, so find closest
            # Calculate distances to all cities
            cities_gdf['distance'] = cities_gdf.geometry.distance(point)
            
            # Find all nearby cities (within bounding box)
            nearby_cities = cities_gdf["name"].tolist()
            result["all_cities_nearby"] = sorted(nearby_cities)
            
            # Find closest city
            if not cities_gdf.empty:
                closest_city = cities_gdf.loc[cities_gdf['distance'].idxmin()]
                
                # Only use closest if it's within reasonable distance (0.1 degrees ≈ 11km)
                if closest_city['distance'] < 0.1:
                    result["city"] = closest_city['name']
                else:
                    result["city"] = f"{closest_city['name']} (nearest, {closest_city['distance']*111:.1f}km)"
        
    except Exception as e:
        print(f"Error in reverse geocoding: {e}")
        result["error"] = str(e)
    
    return result


def _get_admin_boundaries_at_point(lat, lon):
    """
    Helper function to get administrative boundaries (country, state, county) at a specific point.
    
    Args:
        lat (float): Latitude
        lon (float): Longitude
        
    Returns:
        dict: Dictionary with country, state, county information
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    
    # Query for administrative boundaries at the point
    overpass_query = f"""
    [out:json][timeout:30];
    (
      relation["admin_level"="2"]["boundary"="administrative"](around:1000,{lat},{lon});
      relation["admin_level"="4"]["boundary"="administrative"](around:1000,{lat},{lon});
      relation["admin_level"="6"]["boundary"="administrative"](around:1000,{lat},{lon});
    );
    out tags;
    """
    
    result = {"country": None, "state": None, "county": None}
    
    try:
        response = requests.get(overpass_url, params={'data': overpass_query})
        response.raise_for_status()
        
        data = response.json()
        
        for element in data.get('elements', []):
            if element.get('type') == 'relation':
                tags = element.get('tags', {})
                admin_level = tags.get('admin_level')
                name = tags.get('name')
                
                if name:
                    if admin_level == '2':  # Country level
                        result["country"] = name
                    elif admin_level == '4':  # State/Province level
                        result["state"] = name
                    elif admin_level == '6':  # County level
                        result["county"] = name
                        
    except Exception as e:
        print(f"Error getting admin boundaries: {e}")
    
    return result