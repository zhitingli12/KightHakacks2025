import os
import sys


from google.adk.agents import Agent
from google.adk.tools import google_search, FunctionTool
# from api import *
from pydantic import BaseModel, Field

# Add parent directory to path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.load_instruction import load_instruction_from_file

class HomeInsuranceExpertOutput(BaseModel):
    InsuranceRecommendation: str = Field(..., description="Recommended type of home insurance based on city weather and risk factors.")
    RiskFactors: str = Field(..., description="Key risk factors influencing the insurance recommendation.")
    Price: str = Field(..., description="Estimated price range for the recommended insurance.")


# def findCityBoundary(city: str) -> CityBoundaryResponse:
#     boundary = get_city_boundary(city)
#     return boundary

# def findCity(lat: float, lon: float) -> LocationResponse:
#     city = reverse_geocode_coordinate(lat, lon)
#     return city

# def findNearbyCities(lat: float, lon: float, radius_km: int = 50) -> CitiesListResponse:
#     cities = list_available_cities(lat, lon, radius_km)
#     return cities

# findCityBoundary_tool = FunctionTool(
#     func=findCityBoundary,
# )
# findCity_tool = FunctionTool(
#     func=findCity,
# )
# findNearbyCities_tool = FunctionTool(
#     func=findNearbyCities,
# )

# Load instruction from file
instruction_text = load_instruction_from_file("home_insurance_expert.txt")

root_agent = Agent(
    name="home_insurance_expert",
    model="gemini-2.0-flash",
    description="You are a home insurance expert.",
    instruction = instruction_text,
    tools=[google_search],
)

summarization_agent = Agent(
    name="summarization_agent",
    model="gemini-2.0-flash",
    description="You are an agent that summarizes text content.",
    instruction="Summarize the given text content concisely.",
)