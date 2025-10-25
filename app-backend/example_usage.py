#!/usr/bin/env python3
"""
Example usage of city boundary functions for different locations
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'functions'))

from osm_api import get_city_boundary, get_city_boundary_geojson, list_available_cities, reverse_geocode_coordinate

def example_different_locations():
    """Examples showing how to get city boundaries from different locations"""
    
    print("🌎 City Boundary Functions - Multiple Locations")
    print("=" * 60)
    
    # Example 1: Florida cities
    print("🏖️  Florida Examples:")
    print("-" * 20)
    
    # Get Miami boundary in Florida
    miami = get_city_boundary("Miami", state="FL")
    if not miami.empty:
        print(f"✅ Found Miami, FL: {miami.iloc[0]['name']}")
    
    # List some Florida cities
    fl_cities = list_available_cities(state="FL")[:5]  # First 5
    print(f"Sample FL cities: {fl_cities}")
    
    # Example 2: California cities
    print("\n🌴 California Examples:")
    print("-" * 20)
    
    # Get Los Angeles boundary in California
    la = get_city_boundary("Los Angeles", state="CA")
    if not la.empty:
        print(f"✅ Found LA, CA: {la.iloc[0]['name']}")
    else:
        print("❌ Los Angeles not found (might take longer to load CA data)")
    
    # Example 3: Using bounding box (faster for specific areas)
    print("\n📍 Bounding Box Example (South Florida):")
    print("-" * 35)
    
    # South Florida bounding box: roughly Miami-Dade to Palm Beach
    south_florida_bbox = (25.0, -81.0, 27.0, -79.5)  # (min_lat, min_lon, max_lat, max_lon)
    
    miami_bbox = get_city_boundary("Miami", bbox=south_florida_bbox)
    if not miami_bbox.empty:
        print(f"✅ Found Miami using bbox: {miami_bbox.iloc[0]['name']}")
    
    # List cities in the bounding box
    bbox_cities = list_available_cities(bbox=south_florida_bbox)
    print(f"Cities in South Florida bbox: {len(bbox_cities)} found")
    print(f"Sample: {bbox_cities[:5]}")
    
    # Example 4: Different countries (if data available)
    print("\n🇨🇦 International Example:")
    print("-" * 25)
    
    # Try to find Toronto in Canada (may not work depending on OSM data)
    toronto = get_city_boundary("Toronto", country="Canada")
    if not toronto.empty:
        print(f"✅ Found Toronto, Canada: {toronto.iloc[0]['name']}")
    else:
        print("❌ Toronto not found (international data may be limited)")
    
    # Example 5: GeoJSON output for web applications
    print("\n🗺️  GeoJSON Example:")
    print("-" * 20)
    
    # Get Miami as GeoJSON (ready for web maps)
    miami_geojson = get_city_boundary_geojson("Miami", state="FL")
    
    if "error" not in miami_geojson:
        print("✅ Miami GeoJSON generated successfully")
        print(f"   Type: {miami_geojson['type']}")
        print(f"   Features: {len(miami_geojson['features'])}")
        
        # Show first few coordinates
        if miami_geojson['features']:
            coords = miami_geojson['features'][0]['geometry']['coordinates']
            print(f"   Geometry type: {miami_geojson['features'][0]['geometry']['type']}")
            if isinstance(coords[0], list):
                print(f"   Sample coordinates: {coords[0][:2]}...")  # First 2 coordinate pairs
    else:
        print(f"❌ Error: {miami_geojson['error']}")

def performance_tips():
    """Show performance optimization tips"""
    
    print("\n⚡ Performance Tips:")
    print("=" * 20)
    
    print("1. Use state parameter for faster queries:")
    print("   get_city_boundary('Miami', state='FL')  # Fast")
    print("   get_city_boundary('Miami')              # Slower (searches entire US)")
    
    print("\n2. Use bounding box for regional searches:")
    print("   bbox = (25.0, -81.0, 27.0, -79.5)  # South Florida")
    print("   get_city_boundary('Miami', bbox=bbox)  # Fastest")
    
    print("\n3. Cache is automatic - repeated calls are fast:")
    print("   First call:  ~30-60 seconds (API fetch)")
    print("   Later calls: ~0.001 seconds (cached)")
    
    print("\n4. Large areas take longer:")
    print("   State level:   ~30-60 seconds")
    print("   Country level: ~2-5 minutes (not recommended)")
    print("   Bbox level:    ~10-30 seconds")

def reverse_geocoding_examples():
    """Examples showing reverse geocoding - coordinates to location names"""
    
    print("\n📍 Reverse Geocoding Examples:")
    print("=" * 35)
    
    # Example coordinates for testing
    test_locations = [
        {"name": "Miami Beach", "lat": 25.7907, "lon": -80.1300},
        {"name": "Downtown Orlando", "lat": 28.5383, "lon": -81.3792},
        {"name": "Times Square, NYC", "lat": 40.7580, "lon": -73.9855},
        {"name": "Hollywood Sign, LA", "lat": 34.1341, "lon": -118.3215},
        {"name": "Golden Gate Bridge", "lat": 37.8199, "lon": -122.4783},
    ]
    
    for location in test_locations:
        print(f"\n🎯 Testing: {location['name']} ({location['lat']}, {location['lon']})")
        print("-" * 50)
        
        try:
            # Perform reverse geocoding
            result = reverse_geocode_coordinate(location['lat'], location['lon'])
            
            # Display results
            print(f"🌍 Country: {result.get('country', 'Unknown')}")
            print(f"🏛️  State:   {result.get('state', 'Unknown')}")
            print(f"🏞️  County:  {result.get('county', 'Unknown')}")
            print(f"🏙️  City:    {result.get('city', 'Unknown')}")
            
            # Show nearby cities
            nearby = result.get('all_cities_nearby', [])
            if nearby:
                print(f"🌆 Nearby cities ({len(nearby)}): {', '.join(nearby[:5])}{'...' if len(nearby) > 5 else ''}")
            
            if "error" in result:
                print(f"❌ Error: {result['error']}")
                
        except Exception as e:
            print(f"❌ Failed: {e}")

def coordinate_search_examples():
    """Show how to use coordinates for targeted city searches"""
    
    print("\n🎯 Coordinate-Based City Search:")
    print("=" * 35)
    
    # Example: Find cities near a specific coordinate using bounding box
    miami_lat, miami_lon = 25.7617, -80.1918
    search_radius = 25  # km
    
    print(f"🔍 Searching for cities within {search_radius}km of Miami coordinates:")
    print(f"   📍 Center: {miami_lat}, {miami_lon}")
    
    # Create bounding box around Miami
    radius_deg = search_radius / 111.0  # Convert km to degrees
    bbox = (
        miami_lat - radius_deg,
        miami_lon - radius_deg, 
        miami_lat + radius_deg,
        miami_lon + radius_deg
    )
    
    # Get cities in the area
    nearby_cities = list_available_cities(bbox=bbox)
    
    if nearby_cities:
        print(f"✅ Found {len(nearby_cities)} cities in the area:")
        for i, city in enumerate(nearby_cities[:10]):  # Show first 10
            print(f"   {i+1}. {city}")
        if len(nearby_cities) > 10:
            print(f"   ... and {len(nearby_cities) - 10} more")
    else:
        print("❌ No cities found in the specified area")

if __name__ == "__main__":
    try:
        example_different_locations()
        reverse_geocoding_examples()
        coordinate_search_examples()
        performance_tips()
        print("\n✅ All examples completed!")
        
    except Exception as e:
        print(f"\n❌ Example failed with error: {e}")
        import traceback
        traceback.print_exc()