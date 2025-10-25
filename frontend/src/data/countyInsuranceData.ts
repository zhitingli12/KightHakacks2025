export interface InsuranceData {
  ho1: string;
  ho2: string;
  ho3: string;
  ho4: string;
  ho5: string;
  ho6: string;
  ho7: string;
  ho8: string;
}

export interface EnvironmentalData {
  climateChange: string;
  storms: string;
  coastDistance: string;
  avgRainfall: string;
  solarPotential: string;
}

// Helper function to generate insurance rates based on risk factors
function generateInsuranceRates(baseRate: number): InsuranceData {
  return {
    ho1: `$${Math.round(baseRate * 0.4).toLocaleString()}/year`,
    ho2: `$${Math.round(baseRate * 0.55).toLocaleString()}/year`,
    ho3: `$${Math.round(baseRate * 1.0).toLocaleString()}/year`,
    ho4: `$${Math.round(baseRate * 0.25).toLocaleString()}/year`,
    ho5: `$${Math.round(baseRate * 1.35).toLocaleString()}/year`,
    ho6: `$${Math.round(baseRate * 0.65).toLocaleString()}/year`,
    ho7: `$${Math.round(baseRate * 0.85).toLocaleString()}/year`,
    ho8: `$${Math.round(baseRate * 1.15).toLocaleString()}/year`,
  };
}

export const INSURANCE_RATES: Record<string, InsuranceData> = {
  'Alachua': generateInsuranceRates(1800),
  'Baker': generateInsuranceRates(1650),
  'Bay': generateInsuranceRates(3500), // High coastal risk
  'Bradford': generateInsuranceRates(1700),
  'Brevard': generateInsuranceRates(2800), // Coastal
  'Broward': generateInsuranceRates(4200), // High coastal risk
  'Calhoun': generateInsuranceRates(1600),
  'Charlotte': generateInsuranceRates(3200), // Coastal
  'Citrus': generateInsuranceRates(2200), // Near coast
  'Clay': generateInsuranceRates(1900),
  'Collier': generateInsuranceRates(3800), // High coastal risk
  'Columbia': generateInsuranceRates(1650),
  'DeSoto': generateInsuranceRates(1850),
  'Dixie': generateInsuranceRates(2100), // Coastal
  'Duval': generateInsuranceRates(2500), // Coastal city
  'Escambia': generateInsuranceRates(3300), // High coastal risk
  'Flagler': generateInsuranceRates(2700), // Coastal
  'Franklin': generateInsuranceRates(3100), // Coastal
  'Gadsden': generateInsuranceRates(1700),
  'Gilchrist': generateInsuranceRates(1650),
  'Glades': generateInsuranceRates(2000),
  'Gulf': generateInsuranceRates(3200), // Coastal
  'Hamilton': generateInsuranceRates(1600),
  'Hardee': generateInsuranceRates(1800),
  'Hendry': generateInsuranceRates(1900),
  'Hernando': generateInsuranceRates(2300), // Near coast
  'Highlands': generateInsuranceRates(1950),
  'Hillsborough': generateInsuranceRates(2600), // Coastal metro
  'Holmes': generateInsuranceRates(1650),
  'Indian River': generateInsuranceRates(2900), // Coastal
  'Jackson': generateInsuranceRates(1700),
  'Jefferson': generateInsuranceRates(1650),
  'Lafayette': generateInsuranceRates(1600),
  'Lake': generateInsuranceRates(2000),
  'Lee': generateInsuranceRates(3600), // High coastal risk
  'Leon': generateInsuranceRates(1850),
  'Levy': generateInsuranceRates(2100), // Coastal
  'Liberty': generateInsuranceRates(1600),
  'Madison': generateInsuranceRates(1650),
  'Manatee': generateInsuranceRates(3100), // Coastal
  'Marion': generateInsuranceRates(1900),
  'Martin': generateInsuranceRates(3000), // Coastal
  'Miami-Dade': generateInsuranceRates(4500), // Highest coastal risk
  'Monroe': generateInsuranceRates(5200), // Keys - highest risk
  'Nassau': generateInsuranceRates(2600), // Coastal
  'Okaloosa': generateInsuranceRates(3100), // Coastal
  'Okeechobee': generateInsuranceRates(2100),
  'Orange': generateInsuranceRates(2200),
  'Osceola': generateInsuranceRates(2100),
  'Palm Beach': generateInsuranceRates(3900), // High coastal risk
  'Pasco': generateInsuranceRates(2400), // Near coast
  'Pinellas': generateInsuranceRates(3400), // High coastal risk
  'Polk': generateInsuranceRates(2000),
  'Putnam': generateInsuranceRates(1850),
  'Santa Rosa': generateInsuranceRates(2900), // Coastal
  'Sarasota': generateInsuranceRates(3300), // Coastal
  'Seminole': generateInsuranceRates(2100),
  'St. Johns': generateInsuranceRates(2800), // Coastal
  'St. Lucie': generateInsuranceRates(2900), // Coastal
  'Sumter': generateInsuranceRates(1950),
  'Suwannee': generateInsuranceRates(1700),
  'Taylor': generateInsuranceRates(2000), // Coastal
  'Union': generateInsuranceRates(1650),
  'Volusia': generateInsuranceRates(2800), // Coastal
  'Wakulla': generateInsuranceRates(2200), // Near coast
  'Walton': generateInsuranceRates(3200), // Coastal
  'Washington': generateInsuranceRates(1650),
};

export const ENVIRONMENTAL_DATA: Record<string, EnvironmentalData> = {
  'Alachua': {
    climateChange: 'Moderate - Increasing temperatures and precipitation patterns',
    storms: 'Low to Moderate - Occasional severe thunderstorms',
    coastDistance: '~40 miles from Gulf Coast',
    avgRainfall: '52 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Baker': {
    climateChange: 'Moderate - Rising temperatures, changing rainfall',
    storms: 'Low - Minimal hurricane risk, occasional thunderstorms',
    coastDistance: '~25 miles from Atlantic Coast',
    avgRainfall: '54 inches per year',
    solarPotential: 'High - 5.1 peak sun hours daily',
  },
  'Bay': {
    climateChange: 'High - Vulnerable to sea level rise and increased storm intensity',
    storms: 'Very High - Hurricane-prone area (Cat 5 Michael in 2018)',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '62 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Bradford': {
    climateChange: 'Moderate - Warmer temperatures, variable rainfall',
    storms: 'Low - Inland location reduces hurricane impact',
    coastDistance: '~50 miles from Atlantic Coast',
    avgRainfall: '53 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Brevard': {
    climateChange: 'High - Sea level rise threatens coastal areas',
    storms: 'High - Hurricane vulnerable, space coast location',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '50 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Broward': {
    climateChange: 'Very High - Significant sea level rise concerns',
    storms: 'Very High - Major hurricane risk area',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '62 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Calhoun': {
    climateChange: 'Low to Moderate - Inland protection',
    storms: 'Low - Reduced hurricane impact',
    coastDistance: '~35 miles from Gulf Coast',
    avgRainfall: '56 inches per year',
    solarPotential: 'High - 5.1 peak sun hours daily',
  },
  'Charlotte': {
    climateChange: 'High - Coastal vulnerability to climate impacts',
    storms: 'High - Hurricane prone (Ian 2022, Charley 2004)',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '54 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Citrus': {
    climateChange: 'Moderate to High - Coastal influence',
    storms: 'Moderate to High - Hurricane risk',
    coastDistance: 'Near Coast - ~5-10 miles from Gulf',
    avgRainfall: '55 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Clay': {
    climateChange: 'Moderate - Suburban growth impacts',
    storms: 'Moderate - Some hurricane influence',
    coastDistance: '~20 miles from Atlantic Coast',
    avgRainfall: '52 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Collier': {
    climateChange: 'Very High - Everglades and coastal ecosystems at risk',
    storms: 'Very High - Major hurricane corridor (Irma 2017)',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '55 inches per year',
    solarPotential: 'Excellent - 5.7 peak sun hours daily',
  },
  'Columbia': {
    climateChange: 'Moderate - Inland location provides some protection',
    storms: 'Low to Moderate - Reduced coastal storm impact',
    coastDistance: '~60 miles from Atlantic Coast',
    avgRainfall: '54 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'DeSoto': {
    climateChange: 'Moderate - Agricultural impacts from changing patterns',
    storms: 'Moderate - Some hurricane risk',
    coastDistance: '~35 miles from Gulf Coast',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Dixie': {
    climateChange: 'High - Coastal wetlands vulnerable',
    storms: 'High - Gulf coast hurricane exposure',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '54 inches per year',
    solarPotential: 'High - 5.3 peak sun hours daily',
  },
  'Duval': {
    climateChange: 'High - Coastal city with sea level concerns',
    storms: 'High - Hurricane risk, Atlantic exposure',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '52 inches per year',
    solarPotential: 'High - 5.3 peak sun hours daily',
  },
  'Escambia': {
    climateChange: 'High - Pensacola Bay vulnerable to sea rise',
    storms: 'Very High - Hurricane prone (Sally 2020, Ivan 2004)',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '65 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Flagler': {
    climateChange: 'High - Beach erosion and sea level concerns',
    storms: 'High - Atlantic hurricane exposure',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '49 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Franklin': {
    climateChange: 'High - Oyster industry threatened by warming waters',
    storms: 'High - Gulf coast hurricane risk',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '58 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Gadsden': {
    climateChange: 'Moderate - Inland agricultural impacts',
    storms: 'Low to Moderate - Reduced hurricane impact',
    coastDistance: '~45 miles from Gulf Coast',
    avgRainfall: '56 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Gilchrist': {
    climateChange: 'Moderate - Springs vulnerable to climate shifts',
    storms: 'Low - Inland protection',
    coastDistance: '~40 miles from Gulf Coast',
    avgRainfall: '54 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Glades': {
    climateChange: 'Moderate to High - Lake Okeechobee impacts',
    storms: 'Moderate - Some hurricane risk',
    coastDistance: '~40 miles from both coasts',
    avgRainfall: '50 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Gulf': {
    climateChange: 'High - Coastal areas at risk',
    storms: 'Very High - Hurricane exposure (Michael 2018)',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '60 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Hamilton': {
    climateChange: 'Moderate - Suwannee River ecosystem changes',
    storms: 'Low - Inland location',
    coastDistance: '~70 miles from Gulf Coast',
    avgRainfall: '55 inches per year',
    solarPotential: 'High - 5.1 peak sun hours daily',
  },
  'Hardee': {
    climateChange: 'Moderate - Agricultural adaptation needed',
    storms: 'Moderate - Inland with some hurricane influence',
    coastDistance: '~45 miles from Gulf Coast',
    avgRainfall: '51 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Hendry': {
    climateChange: 'Moderate - Agricultural and water management challenges',
    storms: 'Moderate to High - Some hurricane risk',
    coastDistance: '~30 miles from Gulf Coast',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Hernando': {
    climateChange: 'Moderate to High - Nature Coast vulnerability',
    storms: 'High - Gulf coast hurricane risk',
    coastDistance: 'Near Coast - ~5 miles from Gulf',
    avgRainfall: '54 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Highlands': {
    climateChange: 'Moderate - Lake systems affected',
    storms: 'Moderate - Central Florida location',
    coastDistance: '~50 miles from both coasts',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Hillsborough': {
    climateChange: 'High - Tampa Bay vulnerable to sea rise',
    storms: 'High - Major hurricane risk area',
    coastDistance: 'Coastal - On Tampa Bay/Gulf',
    avgRainfall: '46 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Holmes': {
    climateChange: 'Low to Moderate - Inland panhandle',
    storms: 'Low - Reduced coastal impact',
    coastDistance: '~50 miles from Gulf Coast',
    avgRainfall: '60 inches per year',
    solarPotential: 'High - 5.1 peak sun hours daily',
  },
  'Indian River': {
    climateChange: 'High - Treasure Coast sea level concerns',
    storms: 'High - Atlantic hurricane exposure',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Jackson': {
    climateChange: 'Moderate - Inland panhandle changes',
    storms: 'Moderate - Some hurricane remnant impact',
    coastDistance: '~60 miles from Gulf Coast',
    avgRainfall: '56 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Jefferson': {
    climateChange: 'Moderate - Agricultural and forestry impacts',
    storms: 'Low to Moderate - Inland protection',
    coastDistance: '~25 miles from Gulf Coast',
    avgRainfall: '56 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Lafayette': {
    climateChange: 'Moderate - Rural ecosystems adapting',
    storms: 'Low - Inland location',
    coastDistance: '~40 miles from Gulf Coast',
    avgRainfall: '55 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Lake': {
    climateChange: 'Moderate - Numerous lakes affected by warming',
    storms: 'Moderate - Central Florida storm activity',
    coastDistance: '~40 miles from both coasts',
    avgRainfall: '51 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Lee': {
    climateChange: 'Very High - Southwest coast highly vulnerable',
    storms: 'Very High - Major hurricane corridor (Ian 2022)',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '54 inches per year',
    solarPotential: 'Excellent - 5.7 peak sun hours daily',
  },
  'Leon': {
    climateChange: 'Moderate - State capital planning for resilience',
    storms: 'Moderate - Some hurricane impact (Hermine 2016)',
    coastDistance: '~20 miles from Gulf Coast',
    avgRainfall: '62 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Levy': {
    climateChange: 'Moderate to High - Nature Coast ecosystems',
    storms: 'Moderate to High - Gulf hurricane risk',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '54 inches per year',
    solarPotential: 'High - 5.3 peak sun hours daily',
  },
  'Liberty': {
    climateChange: 'Low to Moderate - Rural and forested',
    storms: 'Low - Inland panhandle protection',
    coastDistance: '~40 miles from Gulf Coast',
    avgRainfall: '58 inches per year',
    solarPotential: 'High - 5.1 peak sun hours daily',
  },
  'Madison': {
    climateChange: 'Moderate - Agricultural sector adapting',
    storms: 'Low to Moderate - Inland location',
    coastDistance: '~50 miles from Gulf Coast',
    avgRainfall: '55 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Manatee': {
    climateChange: 'High - Coastal development vulnerable',
    storms: 'High - Gulf coast hurricane risk',
    coastDistance: 'Coastal - On Tampa Bay/Gulf',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Marion': {
    climateChange: 'Moderate - Springs and aquifer concerns',
    storms: 'Moderate - Inland central Florida',
    coastDistance: '~30 miles from Gulf Coast',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Martin': {
    climateChange: 'High - Treasure Coast vulnerability',
    storms: 'High - Atlantic hurricane exposure',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '58 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Miami-Dade': {
    climateChange: 'Very High - Among most vulnerable urban areas globally',
    storms: 'Very High - Major hurricane zone (Andrew 1992, Irma 2017)',
    coastDistance: 'Coastal - On Atlantic Ocean/Biscayne Bay',
    avgRainfall: '62 inches per year',
    solarPotential: 'Excellent - 5.7 peak sun hours daily',
  },
  'Monroe': {
    climateChange: 'Extremely High - Keys most vulnerable to sea rise',
    storms: 'Extremely High - Hurricane alley (Irma 2017)',
    coastDistance: 'Island Chain - Surrounded by water',
    avgRainfall: '40 inches per year',
    solarPotential: 'Excellent - 5.8 peak sun hours daily',
  },
  'Nassau': {
    climateChange: 'High - Coastal island vulnerable',
    storms: 'High - Atlantic hurricane exposure',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '52 inches per year',
    solarPotential: 'High - 5.3 peak sun hours daily',
  },
  'Okaloosa': {
    climateChange: 'High - Emerald Coast at risk',
    storms: 'High - Gulf hurricane exposure',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '64 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Okeechobee': {
    climateChange: 'Moderate to High - Lake Okeechobee central concern',
    storms: 'Moderate to High - Hurricane impact area',
    coastDistance: '~40 miles from Atlantic Coast',
    avgRainfall: '50 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Orange': {
    climateChange: 'Moderate to High - Urban heat island effects',
    storms: 'Moderate to High - Central Florida hurricanes',
    coastDistance: '~40 miles from Atlantic Coast',
    avgRainfall: '48 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Osceola': {
    climateChange: 'Moderate - Growing urban impacts',
    storms: 'Moderate to High - Hurricane corridor',
    coastDistance: '~45 miles from Atlantic Coast',
    avgRainfall: '50 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Palm Beach': {
    climateChange: 'Very High - Extensive coastline at risk',
    storms: 'Very High - Major hurricane zone',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '62 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Pasco': {
    climateChange: 'Moderate to High - Rapid development impacts',
    storms: 'High - Gulf coast hurricane risk',
    coastDistance: 'Near Coast - ~5 miles from Gulf',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Pinellas': {
    climateChange: 'Very High - Peninsula highly vulnerable',
    storms: 'Very High - Hurricane prone area',
    coastDistance: 'Coastal - Peninsula on Gulf/Tampa Bay',
    avgRainfall: '50 inches per year',
    solarPotential: 'Excellent - 5.6 peak sun hours daily',
  },
  'Polk': {
    climateChange: 'Moderate - Inland lakes and agriculture affected',
    storms: 'Moderate - Central Florida position',
    coastDistance: '~50 miles from both coasts',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Putnam': {
    climateChange: 'Moderate - St. Johns River ecosystem impacts',
    storms: 'Moderate - Inland protection',
    coastDistance: '~35 miles from Atlantic Coast',
    avgRainfall: '52 inches per year',
    solarPotential: 'High - 5.3 peak sun hours daily',
  },
  'Santa Rosa': {
    climateChange: 'High - Pensacola area coastal vulnerability',
    storms: 'High - Gulf hurricane risk (Sally 2020)',
    coastDistance: 'Coastal - On Gulf of Mexico/Pensacola Bay',
    avgRainfall: '64 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Sarasota': {
    climateChange: 'High - Barrier islands and bays at risk',
    storms: 'High - Gulf coast hurricane exposure',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '54 inches per year',
    solarPotential: 'Excellent - 5.7 peak sun hours daily',
  },
  'Seminole': {
    climateChange: 'Moderate - Suburban growth impacts',
    storms: 'Moderate - Central Florida hurricanes',
    coastDistance: '~30 miles from Atlantic Coast',
    avgRainfall: '52 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'St. Johns': {
    climateChange: 'High - Historic city threatened by sea rise',
    storms: 'High - Atlantic hurricane exposure',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '50 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'St. Lucie': {
    climateChange: 'High - Treasure Coast vulnerability',
    storms: 'High - Atlantic hurricane corridor',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '54 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Sumter': {
    climateChange: 'Moderate - Central Florida adaptation',
    storms: 'Moderate - Inland location',
    coastDistance: '~45 miles from Gulf Coast',
    avgRainfall: '51 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Suwannee': {
    climateChange: 'Moderate - River ecosystem changes',
    storms: 'Low to Moderate - Inland north Florida',
    coastDistance: '~30 miles from Gulf Coast',
    avgRainfall: '54 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Taylor': {
    climateChange: 'Moderate to High - Big Bend coast vulnerable',
    storms: 'Moderate to High - Gulf exposure',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '56 inches per year',
    solarPotential: 'High - 5.3 peak sun hours daily',
  },
  'Union': {
    climateChange: 'Moderate - Small rural county adapting',
    storms: 'Low - Inland protection',
    coastDistance: '~55 miles from Atlantic Coast',
    avgRainfall: '53 inches per year',
    solarPotential: 'High - 5.2 peak sun hours daily',
  },
  'Volusia': {
    climateChange: 'High - Daytona Beach area at risk',
    storms: 'High - Atlantic hurricane exposure',
    coastDistance: 'Coastal - On Atlantic Ocean',
    avgRainfall: '50 inches per year',
    solarPotential: 'Excellent - 5.4 peak sun hours daily',
  },
  'Wakulla': {
    climateChange: 'Moderate to High - Coastal marshes vulnerable',
    storms: 'Moderate to High - Gulf coast exposure',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '60 inches per year',
    solarPotential: 'High - 5.3 peak sun hours daily',
  },
  'Walton': {
    climateChange: 'High - Emerald Coast development at risk',
    storms: 'High - Gulf hurricane exposure (Michael 2018)',
    coastDistance: 'Coastal - On Gulf of Mexico',
    avgRainfall: '64 inches per year',
    solarPotential: 'Excellent - 5.5 peak sun hours daily',
  },
  'Washington': {
    climateChange: 'Low to Moderate - Inland panhandle',
    storms: 'Low to Moderate - Reduced coastal impact',
    coastDistance: '~50 miles from Gulf Coast',
    avgRainfall: '60 inches per year',
    solarPotential: 'High - 5.1 peak sun hours daily',
  },
};
