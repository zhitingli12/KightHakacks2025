# api_osm.py
from fastapi import FastAPI, Response
import geopandas as gpd
import json
from osm_boundaries_live import get_florida_city_boundaries_cached

app = FastAPI(title="FL City Boundaries (OSM live)")

@app.get("/boundaries/florida.geojson")
def boundaries_geojson():
    gdf = get_florida_city_boundaries_cached()
    # convert to GeoJSON FeatureCollection (as text, no file saved)
    geojson_text = gdf.to_json()
    return Response(content=geojson_text, media_type="application/geo+json")

# Quick filter by city name
@app.get("/boundaries/city/{name}.geojson")
def boundary_by_name(name: str):
    gdf = get_florida_city_boundaries_cached()
    subset = gdf[gdf["name"].str.lower() == name.lower()]
    if subset.empty:
        return {"error": f"city '{name}' not found"}
    return Response(content=subset.to_json(), media_type="application/geo+json")


#must be run locally to test