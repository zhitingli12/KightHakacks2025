ca# Climate Data Integration Guide for Home Insurance Chat Bot

This guide explains how to integrate your climate data sources with the chat bot's location-based insurance recommendations.

## Integration Points

### 1. Main Integration Function
Edit the `get_location_insurance_data()` function in `api.py` (around line 22) to connect your data sources:

```python
def get_location_insurance_data(location_name):
    try:
        # STEP 1: Get geographical data using your existing functions
        from functions.dataScrapping import get_climate_data  # Your function
        from functions.osm_api import get_city_boundary        # Already available
        
        # Get location boundaries and coordinates
        boundary_data = get_city_boundary(location_name)
        
        # STEP 2: Get climate data for the location
        climate_data = get_climate_data(location_name)  # Your climate function
        
        # STEP 3: Analyze insurance risks based on climate data
        risks = analyze_climate_risks(climate_data)  # You'll create this
        
        # STEP 4: Calculate premium estimates
        premium_range = calculate_premium_estimate(location_name, risks)
        
        # STEP 5: Generate coverage recommendations
        recommendations = generate_coverage_recommendations(risks, location_name)
        
        return {
            "location": location_name,
            "found": True,
            "risks": risks,
            "climate_summary": climate_data.get("summary", ""),
            "premium_range": premium_range,
            "recommendations": recommendations,
            "climate_data": climate_data
        }
    except Exception as e:
        return {"location": location_name, "found": False, "error": str(e)}
```

### 2. Climate Data Functions You'll Need to Create

#### A. Risk Analysis Function
```python
def analyze_climate_risks(climate_data):
    """Convert climate data into insurance risk factors"""
    risks = []
    
    # Hurricane risk (high wind speeds + coastal)
    if climate_data.get("max_wind_speed", 0) > 74:  # Hurricane force
        risks.append("hurricanes")
    
    # Flood risk (high precipitation)
    if climate_data.get("annual_precipitation", 0) > 40:  # inches
        risks.append("flooding")
    
    # Tornado risk (temperature differentials + geographic factors)
    if climate_data.get("tornado_activity", False):
        risks.append("tornadoes")
    
    # Add more risk calculations based on your climate data structure
    
    return risks
```

#### B. Premium Calculator
```python
def calculate_premium_estimate(location_name, risks):
    """Calculate insurance premium estimates based on risks"""
    base_premium = 1000  # Base annual premium
    
    # Risk multipliers
    risk_factors = {
        "hurricanes": 2.5,
        "tornadoes": 1.8,
        "flooding": 2.0,
        "earthquakes": 2.2,
        "wildfires": 1.9
    }
    
    multiplier = 1.0
    for risk in risks:
        if risk in risk_factors:
            multiplier *= risk_factors[risk]
    
    estimated_premium = base_premium * multiplier
    return f"${int(estimated_premium * 0.8)}-${int(estimated_premium * 1.2)}"
```

### 3. Your Climate Data Structure
Make sure your climate data functions return structured data like:

```python
{
    "location": "Miami, FL",
    "annual_precipitation": 61.9,  # inches
    "max_wind_speed": 157,         # mph (historical max)
    "temperature_range": {"min": 60, "max": 90},  # °F
    "humidity": 76,                # average %
    "tornado_activity": False,
    "hurricane_frequency": 0.3,    # storms per year
    "flood_zones": ["AE", "X"],   # FEMA flood zones
    "earthquake_risk": "minimal",
    "wildfire_risk": "low",
    "summary": "Tropical climate with high hurricane and flood risk"
}
```

### 4. How It Works in the Chat

1. **User input**: "I need insurance for Austin, Texas"
2. **Location detection**: Regex extracts "Austin" from the message  
3. **Data lookup**: `get_location_insurance_data("Austin")` is called
4. **Climate analysis**: Your functions analyze Austin's climate risks
5. **Response generation**: Chat bot creates personalized recommendations
6. **User gets**: Specific coverage advice for Austin's tornado/hail/flood risks

### 5. Testing Your Integration

Once you've connected your climate data, test with:
- Major cities: "insurance for Chicago" 
- Small towns: "coverage for Springfield, Missouri"
- Counties: "I live in Harris County, Texas"
- States: "moving to Colorado, what coverage do I need?"

The bot will now use your real climate data to provide accurate, location-specific insurance advice for anywhere in the US!

## Files to Edit
- `api.py` - Update `get_location_insurance_data()` function (line ~22)
- `functions/dataScrapping.py` - Add your climate risk analysis functions
- Test with various US locations to verify the integration works