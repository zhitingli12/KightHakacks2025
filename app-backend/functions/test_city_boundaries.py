#!/usr/bin/env python3
"""
Test script for city boundary functions
"""

from osm_api import get_city_boundary, get_city_boundary_geojson, list_available_cities
import time

def test_city_boundary():
    """Test the city boundary functions"""
    
    print("🏙️  Testing City Boundary Functions")
    print("=" * 50)
    
    # Test 1: Get available cities in Florida
    print("📋 Getting list of available cities in Florida...")
    cities = list_available_cities(state="FL")
    
    if cities:
        print(f"✅ Found {len(cities)} cities")
        print("First 10 cities:")
        for i, city in enumerate(cities[:10]):
            print(f"   {i+1}. {city}")
    else:
        print("❌ No cities found")
        return
    
    # Test 2: Get specific city boundary (Miami)
    print("\n" + "=" * 50)
    test_cities = ["Miami", "Orlando", "Tampa", "Jacksonville"]
    
    for city_name in test_cities:
        print(f"\n🔍 Testing city: {city_name}")
        
        start_time = time.time()
        city_boundary = get_city_boundary(city_name, state="FL")
        elapsed = time.time() - start_time
        
        if not city_boundary.empty:
            print(f"✅ Found {city_name} boundary in {elapsed:.2f}s")
            print(f"   OSM ID: {city_boundary.iloc[0]['osm_id']}")
            print(f"   Type: {city_boundary.iloc[0]['place_type']}")
            
            # Get area (convert to appropriate projection first)
            city_utm = city_boundary.to_crs('EPSG:3857')  # Web Mercator for area calculation
            area_km2 = city_utm.geometry.area.iloc[0] / 1_000_000  # Convert m² to km²
            print(f"   Area: {area_km2:.1f} km²")
            
            # Test GeoJSON conversion
            geojson = get_city_boundary_geojson(city_name, state="FL")
            if "error" not in geojson:
                print(f"   ✅ GeoJSON conversion successful")
                print(f"   Features: {len(geojson['features'])}")
            else:
                print(f"   ❌ GeoJSON error: {geojson['error']}")
                
        else:
            print(f"❌ {city_name} not found in {elapsed:.2f}s")
    
    # Test 3: Test case-insensitive and partial matching
    print("\n" + "=" * 50)
    print("🔤 Testing case-insensitive and partial matching...")
    
    test_cases = ["miami", "ORLANDO", "tam"]  # lowercase, uppercase, partial
    
    for test_case in test_cases:
        print(f"\nTesting: '{test_case}'")
        result = get_city_boundary(test_case, state="FL")
        
        if not result.empty:
            matches = result['name'].tolist()
            print(f"✅ Found: {matches}")
        else:
            print(f"❌ No matches found")

def test_nonexistent_city():
    """Test with a city that doesn't exist"""
    print("\n" + "=" * 50)
    print("❓ Testing nonexistent city...")
    
    fake_city = "Atlantis"
    result = get_city_boundary(fake_city, state="FL")
    
    if result.empty:
        print(f"✅ Correctly returned empty result for '{fake_city}'")
    else:
        print(f"❌ Unexpected result for fake city: {result}")

def benchmark_performance():
    """Benchmark the caching performance"""
    print("\n" + "=" * 50)
    print("⚡ Benchmarking performance...")
    
    # First call (loads data)
    print("First call (loading data)...")
    start = time.time()
    cities1 = list_available_cities(state="FL")
    first_time = time.time() - start
    print(f"First call: {first_time:.2f}s ({len(cities1)} cities)")
    
    # Second call (should use cache)
    print("Second call (using cache)...")
    start = time.time()
    cities2 = list_available_cities(state="FL")
    second_time = time.time() - start
    print(f"Second call: {second_time:.4f}s ({len(cities2)} cities)")
    
    if first_time > 0:
        speedup = first_time / second_time
        print(f"🚀 Speedup: {speedup:.1f}x faster with cache")

if __name__ == "__main__":
    try:
        test_city_boundary()
        test_nonexistent_city()
        benchmark_performance()
        print("\n✅ All tests completed!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()