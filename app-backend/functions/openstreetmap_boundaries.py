# osm_boundaries_live.py
import time
import osmnx as ox
import geopandas as gpd
from shapely.geometry import Point

# --- polite Overpass settings (helps avoid throttling) ---
ox.settings.timeout = 180
ox.settings.use_cache = False
ox.settings.log_console = False
# Identify yourself; good citizen etiquette for shared Overpass servers
ox.settings.headers = {"User-Agent": "fl-hackathon-boundaries/1.0 (edu-demo)"}

def get_florida_city_boundaries():
    """
    Pulls Florida municipal boundaries live from Overpass (OSM), in-memory.
    Returns a GeoDataFrame with columns: name, wikidata (if present), geometry.
    """
    # 1) Get Florida polygon
    fl = ox.geocode_to_gdf("Florida, USA")
    florida_poly = fl.geometry.iloc[0]

    # 2) Query municipal boundaries inside Florida
    tags = {"boundary": "administrative", "admin_level": "8"}  # cities/towns
    gdf = ox.features_from_polygon(florida_poly, tags)

    # 3) Normalize columns, dissolve by 'name' to avoid duplicates
    gdf = gdf.reset_index(drop=True)
    keep = ["name", "wikidata", "geometry"]
    gdf = gdf[[c for c in keep if c in gdf.columns]].dropna(subset=["geometry", "name"])
    gdf = gdf.to_crs(4326).dissolve(by="name", as_index=False)

    return gdf  # in memory only

if __name__ == "__main__":
    t0 = time.time()
    cities = get_florida_city_boundaries()
    print(f"Loaded {len(cities)} city polygons in {time.time()-t0:.1f}s")

    # Quick sanity checks
    sample = cities["name"].sort_values().head(10).tolist()
    print("Sample city names:", sample)

    # Orlando downtown point test (lon, lat)
    pt = Point(-81.379236, 28.538336)
    hit = cities[cities.contains(pt)]
    print("Orlando hit:", None if hit.empty else hit.iloc[0]["name"])
