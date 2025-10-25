#!/usr/bin/env python3
"""
Simple working examples with bounding box approach
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'functions'))

from osm_api import get_city_boundary, list_available_cities, reverse_geocode_coordinate

def test_simple_examples():
    """Simple working examples using bounding boxes"""
    
    print("🌎 Simple City Boundary Examples")
    print("=" * 40)
    
    # Example 1: South Florida bounding box
    print("📍 Example 1: South Florida Area")
    print("-" * 30)
    
    # Miami area bounding box (roughly Miami-Dade county)
    miami_bbox = (25.0, -81.0, 26.0, -80.0)  # (min_lat, min_lon, max_lat, max_lon)
    
    print(f"Bounding box: {miami_bbox}")
    
    try:
        # List cities in the area
        print("Getting list of cities...")
        cities = list_available_cities(bbox=miami_bbox)
        
        if cities:
            print(f"✅ Found {len(cities)} cities")
            print(f"Sample cities: {cities[:5]}")
            
            # Try to get Miami boundary
            print("\nTrying to get Miami boundary...")
            miami = get_city_boundary("Miami", bbox=miami_bbox)
            
            if not miami.empty:
                print(f"✅ Found Miami: {miami.iloc[0]['name']}")
                print(f"   OSM ID: {miami.iloc[0]['osm_id']}")
                print(f"   Type: {miami.iloc[0]['place_type']}")
            else:
                print("❌ Miami not found")
        else:
            print("❌ No cities found in this area")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Example 2: Smaller bounding box (faster)
    print(f"\n📍 Example 2: Small Area (Downtown Miami)")
    print("-" * 40)
    
    # Very small area around downtown Miami
    downtown_bbox = (25.7, -80.3, 25.8, -80.1)
    
    print(f"Bounding box: {downtown_bbox}")
    
    try:
        cities = list_available_cities(bbox=downtown_bbox)
        print(f"Cities found: {len(cities)} - {cities}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Example 3: Reverse geocoding
    print(f"\n📍 Example 3: Reverse Geocoding")
    print("-" * 35)
    
    # Miami coordinates
    lat, lon = 25.7617, -80.1918
    print(f"Looking up coordinates: {lat}, {lon}")
    
    try:
        location = reverse_geocode_coordinate(lat, lon, search_radius_km=25)
        
        print("Results:")
        print(f"  Country: {location.get('country', 'Unknown')}")
        print(f"  State:   {location.get('state', 'Unknown')}")
        print(f"  County:  {location.get('county', 'Unknown')}")
        print(f"  City:    {location.get('city', 'Unknown')}")
        
        nearby = location.get('all_cities_nearby', [])
        if nearby:
            print(f"  Nearby cities ({len(nearby)}): {', '.join(nearby[:3])}...")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def create_bounding_box_helper():
    """Helper function to create bounding boxes for different areas"""
    
    print(f"\n🗺️  Bounding Box Helper")
    print("=" * 25)
    
    # Common bounding boxes for testing
    bboxes = {
        "South Florida": (25.0, -81.0, 27.0, -79.5),
        "Central Florida": (27.5, -82.0, 29.5, -80.5),
        "NYC Area": (40.4, -74.3, 40.9, -73.7),
        "LA Area": (33.7, -118.7, 34.3, -118.1),
        "SF Bay Area": (37.3, -122.6, 37.9, -121.8)
    }
    
    print("Common bounding boxes for testing:")
    for name, bbox in bboxes.items():
        print(f"  {name}: {bbox}")
    
    print(f"\n💡 Tips:")
    print("- Smaller bounding boxes = faster queries")
    print("- Use ~1-2 degree boxes for cities/metro areas") 
    print("- Format: (min_lat, min_lon, max_lat, max_lon)")
    print("- Check coordinates: https://boundingbox.klokantech.com/")

if __name__ == "__main__":
    try:
        test_simple_examples()
        create_bounding_box_helper()
        print(f"\n✅ Examples completed!")
        
    except Exception as e:
        print(f"\n❌ Failed with error: {e}")
        import traceback
        traceback.print_exc()