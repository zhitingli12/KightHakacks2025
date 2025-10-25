#!/usr/bin/env python3
"""
Test script for FastAPI City Boundaries API
Tests all endpoints with real data
"""

import requests
import json
import time
import sys
import os

# Add the parent directory to path to access functions
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'functions'))

# Base URL for your API
BASE_URL = "http://localhost:8000"

def check_api_health():
    """Check if the API is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False

def test_health_endpoint():
    """Test the health check endpoint"""
    print("\n🔍 1. Testing Health Check Endpoint")
    print("-" * 40)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response: {data}")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")

def test_root_endpoint():
    """Test the root endpoint"""
    print("\n🔍 2. Testing Root Endpoint")
    print("-" * 40)
    
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Title: {data.get('message', 'N/A')}")
            print(f"✅ Version: {data.get('version', 'N/A')}")
            print(f"✅ Available endpoints: {len(data.get('endpoints', {}))}")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")

def test_reverse_geocoding():
    """Test reverse geocoding endpoint with multiple locations"""
    print("\n🔍 3. Testing Reverse Geocoding Endpoint")
    print("-" * 40)
    
    test_locations = [
        {"name": "Miami, FL", "lat": 25.7617, "lon": -80.1918},
        {"name": "Orlando, FL", "lat": 28.5383, "lon": -81.3792},
        {"name": "New York City", "lat": 40.7580, "lon": -73.9855},
    ]
    
    for location in test_locations:
        print(f"\n📍 Testing: {location['name']}")
        
        params = {
            "lat": location['lat'],
            "lon": location['lon'], 
            "radius_km": 25
        }
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/reverse-geocode", params=params)
            elapsed = time.time() - start_time
            
            print(f"   Status: {response.status_code} ({elapsed:.2f}s)")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ City: {data.get('city', 'Unknown')}")
                print(f"   ✅ State: {data.get('state', 'Unknown')}")
                print(f"   ✅ Country: {data.get('country', 'Unknown')}")
                
                nearby_count = len(data.get('all_cities_nearby', []))
                print(f"   ✅ Nearby cities: {nearby_count}")
                
                if nearby_count > 0:
                    sample_cities = data['all_cities_nearby'][:3]
                    print(f"   📋 Sample nearby: {', '.join(sample_cities)}")
                    
            else:
                print(f"   ❌ Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   ❌ Details: {error_data.get('detail', 'Unknown error')}")
                except:
                    print(f"   ❌ Response: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Connection error: {e}")

def test_city_boundary():
    """Test city boundary endpoint"""
    print("\n🔍 4. Testing City Boundary Endpoint")
    print("-" * 40)
    
    test_cases = [
        {
            "name": "Miami in South Florida",
            "city_name": "Miami",
            "bbox": {"min_lat": 25.0, "min_lon": -81.0, "max_lat": 27.0, "max_lon": -79.5}
        },
        {
            "name": "Orlando in Central Florida", 
            "city_name": "Orlando",
            "bbox": {"min_lat": 28.0, "min_lon": -82.0, "max_lat": 29.0, "max_lon": -81.0}
        }
    ]
    
    for test_case in test_cases:
        print(f"\n🏙️ Testing: {test_case['name']}")
        
        # Test without GeoJSON
        params = {
            "city_name": test_case['city_name'],
            "return_geojson": False,
            **test_case['bbox']
        }
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/city-boundary", params=params)
            elapsed = time.time() - start_time
            
            print(f"   Status: {response.status_code} ({elapsed:.2f}s)")
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Found: {data.get('found', False)}")
                print(f"   ✅ City: {data.get('city_name', 'N/A')}")
                
                if data.get('found'):
                    print(f"   ✅ OSM ID: {data.get('osm_id', 'N/A')}")
                    print(f"   ✅ Type: {data.get('place_type', 'N/A')}")
                    
                    coords = data.get('coordinates', {})
                    if coords:
                        print(f"   📍 Coordinates: {coords.get('lat')}, {coords.get('lon')}")
                        
            else:
                print(f"   ❌ Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   ❌ Details: {error_data.get('detail', 'Unknown error')}")
                except:
                    print(f"   ❌ Response: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Connection error: {e}")
        
        # Test with GeoJSON
        print(f"   🗺️ Testing GeoJSON format...")
        params['return_geojson'] = True
        
        try:
            response = requests.get(f"{BASE_URL}/city-boundary", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('found') and data.get('geojson'):
                    geojson = data['geojson']
                    feature_count = len(geojson.get('features', []))
                    print(f"   ✅ GeoJSON features: {feature_count}")
                else:
                    print(f"   ⚠️ No GeoJSON data available")
            else:
                print(f"   ❌ GeoJSON request failed: {response.status_code}")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ GeoJSON connection error: {e}")

def test_cities_list():
    """Test cities list endpoint"""
    print("\n🔍 5. Testing Cities List Endpoint")
    print("-" * 40)
    
    test_areas = [
        {
            "name": "South Florida (Large area)",
            "bbox": {"min_lat": 25.0, "min_lon": -81.0, "max_lat": 27.0, "max_lon": -79.5}
        },
        {
            "name": "Miami Downtown (Small area)",
            "bbox": {"min_lat": 25.7, "min_lon": -80.3, "max_lat": 25.8, "max_lon": -80.1}
        }
    ]
    
    for area in test_areas:
        print(f"\n📋 Testing: {area['name']}")
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/cities", params=area['bbox'])
            elapsed = time.time() - start_time
            
            print(f"   Status: {response.status_code} ({elapsed:.2f}s)")
            
            if response.status_code == 200:
                data = response.json()
                total_cities = data.get('total_cities', 0)
                cities = data.get('cities', [])
                
                print(f"   ✅ Total cities: {total_cities}")
                print(f"   ✅ Bounding box: {data.get('bbox', 'N/A')}")
                
                if cities:
                    sample_size = min(5, len(cities))
                    print(f"   📋 Sample cities: {', '.join(cities[:sample_size])}")
                    
                    if len(cities) > sample_size:
                        print(f"   📋 ... and {len(cities) - sample_size} more")
                else:
                    print(f"   ⚠️ No cities found in this area")
                    
            else:
                print(f"   ❌ Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   ❌ Details: {error_data.get('detail', 'Unknown error')}")
                except:
                    print(f"   ❌ Response: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Connection error: {e}")

def test_user_location_workflow():
    """Test the complete user location workflow"""
    print("\n🔍 6. Testing User Location Workflow Endpoint")
    print("-" * 40)
    
    test_users = [
        {"name": "Miami User", "lat": 25.7617, "lon": -80.1918},
        {"name": "Orlando User", "lat": 28.5383, "lon": -81.3792},
    ]
    
    for user in test_users:
        print(f"\n👤 Testing: {user['name']}")
        
        params = {
            "lat": user['lat'],
            "lon": user['lon'],
            "search_radius_km": 25
        }
        
        try:
            start_time = time.time()
            response = requests.get(f"{BASE_URL}/user-location-workflow", params=params)
            elapsed = time.time() - start_time
            
            print(f"   Status: {response.status_code} ({elapsed:.2f}s)")
            
            if response.status_code == 200:
                data = response.json()
                
                # User location info
                user_loc = data.get('user_location', {})
                print(f"   ✅ User city: {user_loc.get('city', 'Unknown')}")
                print(f"   ✅ User state: {user_loc.get('state', 'Unknown')}")
                
                # Search area info
                search_area = data.get('search_area', {})
                total_cities = search_area.get('total_cities', 0)
                radius = search_area.get('radius_km', 0)
                print(f"   ✅ Search radius: {radius}km")
                print(f"   ✅ Cities in area: {total_cities}")
                
                # City boundary info
                boundary_found = data.get('city_boundary_found', False)
                print(f"   ✅ City boundary found: {boundary_found}")
                
                # Sample nearby cities
                all_cities = search_area.get('all_cities', [])
                if all_cities:
                    sample = all_cities[:5]
                    print(f"   📋 Sample nearby cities: {', '.join(sample)}")
                    
            else:
                print(f"   ❌ Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   ❌ Details: {error_data.get('detail', 'Unknown error')}")
                except:
                    print(f"   ❌ Response: {response.text}")
                    
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Connection error: {e}")

def test_convenience_endpoints():
    """Test convenience endpoints"""
    print("\n🔍 7. Testing Convenience Endpoints")
    print("-" * 40)
    
    # Test Miami area preset
    print(f"\n🏖️ Testing Miami Area Preset:")
    try:
        response = requests.get(f"{BASE_URL}/miami-area")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Area: {data.get('area', 'N/A')}")
            print(f"   ✅ Total cities: {data.get('total_cities', 0)}")
            
            cities = data.get('cities', [])
            if cities:
                print(f"   📋 Sample cities: {', '.join(cities[:5])}")
                
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")
    
    # Test examples endpoint
    print(f"\n📖 Testing Examples Endpoint:")
    try:
        response = requests.get(f"{BASE_URL}/examples")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            examples = data.get('examples', {})
            print(f"   ✅ Available examples: {len(examples)}")
            
            for name, example in examples.items():
                print(f"   📋 {name}: {example.get('description', 'No description')}")
                
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")

def test_error_handling():
    """Test error handling with invalid inputs"""
    print("\n🔍 8. Testing Error Handling")
    print("-" * 40)
    
    # Test invalid coordinates
    print(f"\n❌ Testing Invalid Coordinates:")
    invalid_params = {"lat": 999, "lon": 999, "radius_km": 25}
    
    try:
        response = requests.get(f"{BASE_URL}/reverse-geocode", params=invalid_params)
        print(f"   Status: {response.status_code}")
        
        if response.status_code != 200:
            print(f"   ✅ Correctly rejected invalid coordinates")
        else:
            print(f"   ⚠️ Unexpectedly accepted invalid coordinates")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")
    
    # Test invalid city search
    print(f"\n❌ Testing Nonexistent City:")
    params = {
        "city_name": "AtlantisCity12345",
        "min_lat": 25.0, "min_lon": -81.0,
        "max_lat": 27.0, "max_lon": -79.5,
        "return_geojson": False
    }
    
    try:
        response = requests.get(f"{BASE_URL}/city-boundary", params=params)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if not data.get('found'):
                print(f"   ✅ Correctly reported city not found")
            else:
                print(f"   ⚠️ Unexpectedly found nonexistent city")
        else:
            print(f"   ⚠️ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")

def run_all_tests():
    """Run all API tests"""
    print("🧪 FastAPI City Boundaries API Test Suite")
    print("=" * 60)
    
    # Check if API is running
    if not check_api_health():
        print("❌ API is not running! Please start the API first:")
        print("   cd /Users/carlosmendez/Projects/hackathon/KightHakacks2025/app-backend")
        print("   uvicorn api:app --reload --host 0.0.0.0 --port 8000")
        return False
    
    print("✅ API is running! Starting tests...")
    
    # Run all tests
    test_health_endpoint()
    test_root_endpoint()
    test_reverse_geocoding()
    test_city_boundary()
    test_cities_list()
    test_user_location_workflow()
    test_convenience_endpoints()
    test_error_handling()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("📖 View interactive API docs at: http://localhost:8000/docs")
    print("🔧 View API schema at: http://localhost:8000/openapi.json")
    
    return True

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)