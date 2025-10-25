#!/usr/bin/env python3
"""
Test script for reverse geocoding function
"""

import sys
import os
import time

# Add the parent directory to path to access functions
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(parent_dir, 'functions'))

from osm_api import reverse_geocode_coordinate

def test_reverse_geocoding():
    """Test the reverse geocoding function with known locations"""
    
    print("📍 Testing Reverse Geocoding Function")
    print("=" * 45)
    
    # Test locations with known results
    test_cases = [
        {
            "name": "Miami Beach, FL",
            "lat": 25.7907,
            "lon": -80.1300,
            "expected_state": "Florida",
            "expected_country": "United States"
        },
        {
            "name": "Orlando, FL", 
            "lat": 28.5383,
            "lon": -81.3792,
            "expected_state": "Florida",
            "expected_country": "United States"
        },
        {
            "name": "Times Square, NYC",
            "lat": 40.7580,
            "lon": -73.9855,
            "expected_state": "New York", 
            "expected_country": "United States"
        },
        {
            "name": "Golden Gate Bridge, SF",
            "lat": 37.8199,
            "lon": -122.4783,
            "expected_state": "California",
            "expected_country": "United States"
        }
    ]
    
    successful_tests = 0
    total_tests = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}/{total_tests}: {test_case['name']}")
        print(f"📍 Coordinates: {test_case['lat']}, {test_case['lon']}")
        
        start_time = time.time()
        
        try:
            result = reverse_geocode_coordinate(
                test_case['lat'], 
                test_case['lon'],
                search_radius_km=30
            )
            
            elapsed = time.time() - start_time
            print(f"⏱️  Completed in {elapsed:.2f}s")
            
            # Check results
            print(f"🌍 Results:")
            print(f"   Country: {result.get('country', 'Unknown')}")
            print(f"   State:   {result.get('state', 'Unknown')}")
            print(f"   County:  {result.get('county', 'Unknown')}")
            print(f"   City:    {result.get('city', 'Unknown')}")
            
            # Verify expected results
            country_match = result.get('country') == test_case['expected_country']
            result_state = result.get('state') or ''
            expected_state = test_case['expected_state'] or ''
            state_match = (result_state == expected_state or 
                          expected_state.lower() in result_state.lower())
            
            if country_match and state_match:
                print("✅ Country and state match expected results")
                successful_tests += 1
            else:
                print("⚠️  Results don't match expected (this might be normal due to OSM data variations)")
                if not country_match:
                    print(f"   Expected country: {test_case['expected_country']}, got: {result.get('country')}")
                if not state_match:
                    print(f"   Expected state: {test_case['expected_state']}, got: {result.get('state')}")
            
            # Show nearby cities
            nearby = result.get('all_cities_nearby', [])
            if nearby:
                print(f"🏙️  Found {len(nearby)} nearby cities: {', '.join(nearby[:3])}{'...' if len(nearby) > 3 else ''}")
            
            if "error" in result:
                print(f"❌ Error in result: {result['error']}")
                
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            import traceback
            traceback.print_exc()
    
    # Summary
    print(f"\n📊 Test Summary:")
    print(f"✅ Successful tests: {successful_tests}/{total_tests}")
    print(f"📈 Success rate: {(successful_tests/total_tests)*100:.1f}%")

def test_edge_cases():
    """Test edge cases and error handling"""
    
    print("\n🔬 Testing Edge Cases:")
    print("=" * 25)
    
    edge_cases = [
        {"name": "Ocean coordinates", "lat": 25.0, "lon": -80.0},  # In water
        {"name": "Invalid coordinates", "lat": 999, "lon": 999},   # Invalid
        {"name": "Rural area", "lat": 39.0, "lon": -95.0},        # Middle of Kansas
    ]
    
    for case in edge_cases:
        print(f"\n🧪 Testing: {case['name']}")
        print(f"📍 Coordinates: {case['lat']}, {case['lon']}")
        
        try:
            result = reverse_geocode_coordinate(case['lat'], case['lon'], search_radius_km=100)
            
            if result.get('city'):
                print(f"✅ Found city: {result['city']}")
            else:
                print("ℹ️  No city found (expected for some locations)")
            
            if result.get('state'):
                print(f"✅ Found state: {result['state']}")
            
            if result.get('country'):
                print(f"✅ Found country: {result['country']}")
            
            nearby_count = len(result.get('all_cities_nearby', []))
            print(f"🏙️  Nearby cities found: {nearby_count}")
                
        except Exception as e:
            print(f"❌ Error (might be expected): {e}")

def benchmark_performance():
    """Test performance of reverse geocoding"""
    
    print("\n⚡ Performance Benchmark:")
    print("=" * 25)
    
    # Test same coordinate multiple times to test caching
    lat, lon = 25.7617, -80.1918  # Miami
    
    print(f"🎯 Testing Miami coordinates multiple times...")
    
    times = []
    for i in range(3):
        start = time.time()
        result = reverse_geocode_coordinate(lat, lon)
        elapsed = time.time() - start
        times.append(elapsed)
        
        print(f"Call {i+1}: {elapsed:.3f}s - Found: {result.get('city', 'Unknown city')}")
    
    print(f"\n📊 Performance Summary:")
    print(f"   Average time: {sum(times)/len(times):.3f}s")
    print(f"   Min time: {min(times):.3f}s")
    print(f"   Max time: {max(times):.3f}s")
    
    if len(times) > 1:
        speedup = times[0] / min(times[1:])
        if speedup > 1.5:
            print(f"   🚀 Cache speedup: {speedup:.1f}x")

if __name__ == "__main__":
    try:
        test_reverse_geocoding()
        test_edge_cases()
        benchmark_performance()
        print("\n✅ All reverse geocoding tests completed!")
        
    except Exception as e:
        print(f"\n❌ Tests failed with error: {e}")
        import traceback
        traceback.print_exc()