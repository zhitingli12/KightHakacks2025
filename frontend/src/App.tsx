import { useState, useEffect } from 'react';
import { FloridaMapOSM } from './components/FloridaMapOSM';
import { CountyDetails } from './components/CountyDetails';
import { CityDetails } from './components/CityDetails';
import { CountyList } from './components/CountyList';
import { ChatBox } from './components/ChatBox';
import { Map, List, MessageSquare } from 'lucide-react';

interface City {
  name: string;
  lat: number;
  lng: number;
  population?: number;
  description?: string;
  [key: string]: any;
}

interface CountyData {
  name: string;
  lat: number;
  lng: number;
  cities: City[];
}

const FLORIDA_COUNTIES: CountyData[] = [
  // Major Counties with Cities
  {
    name: 'Miami-Dade',
    lat: 25.7617,
    lng: -80.1918,
    cities: [
      { name: 'Miami', lat: 25.7617, lng: -80.1918, population: 467963, description: 'Vibrant coastal city and cultural hub' },
      { name: 'Hialeah', lat: 25.8576, lng: -80.2781, population: 223109, description: 'Major commercial center' },
      { name: 'Miami Beach', lat: 25.7907, lng: -80.1300, population: 82890, description: 'Famous resort destination' },
    ],
  },
  {
    name: 'Broward',
    lat: 26.1224,
    lng: -80.1373,
    cities: [
      { name: 'Fort Lauderdale', lat: 26.1224, lng: -80.1373, population: 182760, description: 'Venice of America' },
      { name: 'Hollywood', lat: 26.0112, lng: -80.1495, population: 153067, description: 'Beach city with broadwalk' },
      { name: 'Pembroke Pines', lat: 26.0034, lng: -80.2240, population: 171178, description: 'Family-friendly suburban city' },
    ],
  },
  {
    name: 'Palm Beach',
    lat: 26.7153,
    lng: -80.0534,
    cities: [
      { name: 'West Palm Beach', lat: 26.7153, lng: -80.0534, population: 117415, description: 'Cultural and business center' },
      { name: 'Boca Raton', lat: 26.3683, lng: -80.1289, population: 97422, description: 'Upscale coastal community' },
      { name: 'Delray Beach', lat: 26.4615, lng: -80.0728, population: 69451, description: 'All-America City winner' },
    ],
  },
  {
    name: 'Orange',
    lat: 28.5383,
    lng: -81.3792,
    cities: [
      { name: 'Orlando', lat: 28.5383, lng: -81.3792, population: 307573, description: 'Theme park capital of the world' },
      { name: 'Winter Park', lat: 28.6000, lng: -81.3392, population: 29795, description: 'Charming city with parks and museums' },
      { name: 'Apopka', lat: 28.6934, lng: -81.5322, population: 54873, description: 'Indoor foliage capital' },
    ],
  },
  {
    name: 'Hillsborough',
    lat: 27.9506,
    lng: -82.4572,
    cities: [
      { name: 'Tampa', lat: 27.9506, lng: -82.4572, population: 399700, description: 'Major business and cultural hub' },
      { name: 'Brandon', lat: 27.9378, lng: -82.2859, population: 114626, description: 'Fast-growing suburban area' },
      { name: 'Temple Terrace', lat: 28.0356, lng: -82.3898, population: 26690, description: 'Golf and riverfront community' },
    ],
  },
  {
    name: 'Pinellas',
    lat: 27.9008,
    lng: -82.6747,
    cities: [
      { name: 'St. Petersburg', lat: 27.7676, lng: -82.6403, population: 265351, description: 'Sunshine City with beaches and arts' },
      { name: 'Clearwater', lat: 27.9659, lng: -82.8001, population: 117292, description: 'Beautiful Gulf coast beaches' },
      { name: 'Largo', lat: 27.9095, lng: -82.7873, population: 84753, description: 'Central Pinellas city' },
    ],
  },
  {
    name: 'Duval',
    lat: 30.3322,
    lng: -81.6557,
    cities: [
      { name: 'Jacksonville', lat: 30.3322, lng: -81.6557, population: 949611, description: 'Largest city by area in the continental US' },
      { name: 'Jacksonville Beach', lat: 30.2816, lng: -81.3931, population: 23562, description: 'Coastal community with beaches' },
      { name: 'Atlantic Beach', lat: 30.3369, lng: -81.3995, population: 13831, description: 'Small beach town' },
    ],
  },
  {
    name: 'Lee',
    lat: 26.5628,
    lng: -81.9495,
    cities: [
      { name: 'Cape Coral', lat: 26.5629, lng: -81.9495, population: 194016, description: 'City of canals' },
      { name: 'Fort Myers', lat: 26.6406, lng: -81.8723, population: 86395, description: 'Gateway to Southwest Florida' },
      { name: 'Bonita Springs', lat: 26.3398, lng: -81.7787, population: 53644, description: 'Coastal community' },
    ],
  },
  {
    name: 'Polk',
    lat: 28.0395,
    lng: -81.7820,
    cities: [
      { name: 'Lakeland', lat: 28.0395, lng: -81.9498, population: 112641, description: 'City between Tampa and Orlando' },
      { name: 'Winter Haven', lat: 28.0222, lng: -81.7329, population: 49219, description: 'Chain of Lakes City' },
      { name: 'Bartow', lat: 27.8964, lng: -81.8431, population: 20147, description: 'County seat with historic downtown' },
    ],
  },
  {
    name: 'Brevard',
    lat: 28.3922,
    lng: -80.6077,
    cities: [
      { name: 'Melbourne', lat: 28.0836, lng: -80.6081, population: 84678, description: 'Tech corridor city' },
      { name: 'Palm Bay', lat: 27.9859, lng: -80.5887, population: 119760, description: 'Fast-growing coastal city' },
      { name: 'Titusville', lat: 28.6122, lng: -80.8076, population: 48789, description: 'Gateway to Kennedy Space Center' },
    ],
  },
  {
    name: 'Volusia',
    lat: 29.0280,
    lng: -81.0998,
    cities: [
      { name: 'Daytona Beach', lat: 29.2108, lng: -81.0228, population: 72647, description: 'World\'s Most Famous Beach' },
      { name: 'Deltona', lat: 28.9005, lng: -81.2637, population: 93692, description: 'Residential community' },
      { name: 'Port Orange', lat: 29.1383, lng: -81.0062, population: 64842, description: 'Coastal suburban city' },
    ],
  },
  {
    name: 'Seminole',
    lat: 28.7419,
    lng: -81.2776,
    cities: [
      { name: 'Sanford', lat: 28.8029, lng: -81.2690, population: 60337, description: 'Historic downtown on Lake Monroe' },
      { name: 'Altamonte Springs', lat: 28.6611, lng: -81.3656, population: 46231, description: 'Shopping and business hub' },
      { name: 'Oviedo', lat: 28.6700, lng: -81.2081, population: 41062, description: 'Family-friendly community' },
    ],
  },
  {
    name: 'Collier',
    lat: 26.1420,
    lng: -81.7948,
    cities: [
      { name: 'Naples', lat: 26.1420, lng: -81.7948, population: 22088, description: 'Upscale Gulf coast paradise' },
      { name: 'Marco Island', lat: 25.9412, lng: -81.7187, population: 17963, description: 'Barrier island resort city' },
      { name: 'Immokalee', lat: 26.4187, lng: -81.4173, population: 28060, description: 'Agricultural community' },
    ],
  },
  {
    name: 'Sarasota',
    lat: 27.3364,
    lng: -82.5307,
    cities: [
      { name: 'Sarasota', lat: 27.3364, lng: -82.5307, population: 57738, description: 'Cultural coast city' },
      { name: 'North Port', lat: 27.0442, lng: -82.2359, population: 70140, description: 'Growing suburban city' },
      { name: 'Venice', lat: 27.0998, lng: -82.4543, population: 23572, description: 'Shark tooth capital' },
    ],
  },
  {
    name: 'Manatee',
    lat: 27.4989,
    lng: -82.5748,
    cities: [
      { name: 'Bradenton', lat: 27.4989, lng: -82.5748, population: 59439, description: 'River city with beaches nearby' },
      { name: 'Palmetto', lat: 27.5214, lng: -82.5723, population: 13740, description: 'Historic waterfront town' },
      { name: 'Anna Maria', lat: 27.5289, lng: -82.7326, population: 1503, description: 'Charming island community' },
    ],
  },
  {
    name: 'Leon',
    lat: 30.4383,
    lng: -84.2807,
    cities: [
      { name: 'Tallahassee', lat: 30.4383, lng: -84.2807, population: 196169, description: 'State capital and college town' },
    ],
  },
  {
    name: 'Alachua',
    lat: 29.6516,
    lng: -82.3248,
    cities: [
      { name: 'Gainesville', lat: 29.6516, lng: -82.3248, population: 141085, description: 'Home of University of Florida' },
    ],
  },
  {
    name: 'St. Lucie',
    lat: 27.4467,
    lng: -80.3256,
    cities: [
      { name: 'Port St. Lucie', lat: 27.2730, lng: -80.3582, population: 204851, description: 'Fast-growing treasure coast city' },
    ],
  },
  {
    name: 'Escambia',
    lat: 30.4213,
    lng: -87.2169,
    cities: [
      { name: 'Pensacola', lat: 30.4213, lng: -87.2169, population: 54312, description: 'Historic port city' },
    ],
  },
  {
    name: 'Bay',
    lat: 30.1588,
    lng: -85.6602,
    cities: [
      { name: 'Panama City', lat: 30.1588, lng: -85.6602, population: 36484, description: 'Beach resort destination' },
    ],
  },

  // Rest of counties (without detailed city data for brevity)
  { name: 'Santa Rosa', lat: 30.6318, lng: -87.0000, cities: [] },
  { name: 'Okaloosa', lat: 30.6318, lng: -86.5000, cities: [] },
  { name: 'Walton', lat: 30.6318, lng: -86.0000, cities: [] },
  { name: 'Holmes', lat: 30.8000, lng: -85.8500, cities: [] },
  { name: 'Washington', lat: 30.6000, lng: -85.5000, cities: [] },
  { name: 'Gulf', lat: 29.9500, lng: -85.2500, cities: [] },
  { name: 'Calhoun', lat: 30.4000, lng: -85.1000, cities: [] },
  { name: 'Jackson', lat: 30.7800, lng: -85.2500, cities: [] },
  { name: 'Gadsden', lat: 30.5800, lng: -84.6400, cities: [] },
  { name: 'Liberty', lat: 30.2400, lng: -84.8800, cities: [] },
  { name: 'Franklin', lat: 29.8500, lng: -84.8700, cities: [] },
  { name: 'Wakulla', lat: 30.1400, lng: -84.4000, cities: [] },
  { name: 'Jefferson', lat: 30.5500, lng: -83.8700, cities: [] },
  { name: 'Madison', lat: 30.4700, lng: -83.4100, cities: [] },
  { name: 'Taylor', lat: 30.0200, lng: -83.5800, cities: [] },
  { name: 'Hamilton', lat: 30.5100, lng: -82.9500, cities: [] },
  { name: 'Suwannee', lat: 30.1900, lng: -82.9800, cities: [] },
  { name: 'Lafayette', lat: 30.1000, lng: -83.2200, cities: [] },
  { name: 'Dixie', lat: 29.5900, lng: -83.0900, cities: [] },
  { name: 'Columbia', lat: 30.1900, lng: -82.6300, cities: [] },
  { name: 'Gilchrist', lat: 29.7000, lng: -82.8100, cities: [] },
  { name: 'Union', lat: 30.0600, lng: -82.4300, cities: [] },
  { name: 'Baker', lat: 30.3300, lng: -82.2800, cities: [] },
  { name: 'Bradford', lat: 29.9500, lng: -82.1700, cities: [] },
  { name: 'Nassau', lat: 30.6100, lng: -81.8100, cities: [] },
  { name: 'Levy', lat: 29.3000, lng: -82.7700, cities: [] },
  { name: 'Clay', lat: 30.0700, lng: -81.8000, cities: [] },
  { name: 'St. Johns', lat: 29.8900, lng: -81.3100, cities: [] },
  { name: 'Putnam', lat: 29.6300, lng: -81.6600, cities: [] },
  { name: 'Marion', lat: 29.1900, lng: -82.1400, cities: [] },
  { name: 'Citrus', lat: 28.8700, lng: -82.4800, cities: [] },
  { name: 'Hernando', lat: 28.5700, lng: -82.4700, cities: [] },
  { name: 'Sumter', lat: 28.6900, lng: -82.0500, cities: [] },
  { name: 'Lake', lat: 28.8000, lng: -81.6300, cities: [] },
  { name: 'Flagler', lat: 29.4700, lng: -81.2500, cities: [] },
  { name: 'Pasco', lat: 28.3300, lng: -82.4300, cities: [] },
  { name: 'Osceola', lat: 28.1100, lng: -81.1000, cities: [] },
  { name: 'Hardee', lat: 27.4900, lng: -81.8000, cities: [] },
  { name: 'DeSoto', lat: 27.1600, lng: -81.8100, cities: [] },
  { name: 'Charlotte', lat: 26.8900, lng: -82.0000, cities: [] },
  { name: 'Highlands', lat: 27.3200, lng: -81.3500, cities: [] },
  { name: 'Okeechobee', lat: 27.2400, lng: -80.8300, cities: [] },
  { name: 'Indian River', lat: 27.7400, lng: -80.5500, cities: [] },
  { name: 'Glades', lat: 26.9200, lng: -81.1500, cities: [] },
  { name: 'Martin', lat: 27.1200, lng: -80.3900, cities: [] },
  { name: 'Hendry', lat: 26.5500, lng: -81.1500, cities: [] },
  { name: 'Monroe', lat: 24.7500, lng: -81.2500, cities: [] },
];

type TabType = 'map' | 'list' | 'chat';

export default function App() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('map');

  // Initialize with Orlando coordinates for testing
  // Replace with actual backend values when ready
  const [userLatitude, setUserLatitude] = useState<number>(28.5383); // Orlando
  const [userLongitude, setUserLongitude] = useState<number>(-81.3792); // Orlando

  // Fetch location from backend when component mounts
  useEffect(() => {
    // Uncomment this when your backend is ready
    /*
    fetch('http://your-backend-api.com/api/user-location', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setUserLatitude(data.latitude);
        setUserLongitude(data.longitude);
      })
      .catch(error => {
        console.error('Failed to fetch location:', error);
        // Fallback to Orlando if API fails
        setUserLatitude(28.5383);
        setUserLongitude(-81.3792);
      });
    */
  }, []);

  const handleLocationReady = (county: CountyData | null) => {
    console.log('User is in county:', county?.name);
    console.log('Coordinates:', userLatitude, userLongitude);

    // Send to backend when ready
    /*
    fetch('http://your-backend-api.com/api/save-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: userLatitude,
        longitude: userLongitude,
        county: county?.name
      })
    });
    */
  };

  const handleCountyClick = (countyName: string) => {
    setSelectedCounty(countyName);
    setSelectedCity(null);
  };

  const handleCityClick = (cityName: string) => {
    setSelectedCity(cityName);
  };

  const handleBackToMap = () => {
    setSelectedCounty(null);
    setSelectedCity(null);
  };

  const handleBackToCounty = () => {
    setSelectedCity(null);
  };

  const handleOpenChat = () => {
    setSelectedCounty(null);
    setSelectedCity(null);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-[#9b9b87] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-[#7a8c6f]"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full bg-[#b8b89d]"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 rounded-full bg-[#6b7b5f]"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full bg-[#a0a089]"></div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl relative z-10">
        {selectedCity && selectedCounty ? (
          <CityDetails
            cityName={selectedCity}
            countyName={selectedCounty}
            onBack={handleBackToCounty}
            onOpenChat={handleOpenChat}
          />
        ) : selectedCounty ? (
          <CountyDetails
            countyName={selectedCounty}
            onBack={handleBackToMap}
            onCityClick={handleCityClick}
          />
        ) : (
          <>
            {/* Window Frame */}
            <div className="bg-[#e8e8d8] rounded-t-2xl border-4 border-[#5a5a4a] shadow-2xl overflow-hidden">
              {/* Title Bar */}
              <div className="bg-[#7a8c6f] border-b-4 border-[#5a5a4a] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#d4a574] border-2 border-[#5a5a4a]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#c9b896] border-2 border-[#5a5a4a]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#a0a089] border-2 border-[#5a5a4a]"></div>
                  </div>
                  <span className="text-[#e8e8d8] ml-2">Explore Florida Counties</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-[#c9d4bc] border-b-4 border-[#a0a089] px-4 py-2 flex gap-2">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${activeTab === 'map'
                      ? 'bg-[#7a8c6f] border-[#5a5a4a] text-[#e8e8d8] shadow-md'
                      : 'bg-[#e8e8d8] border-[#a0a089] text-[#4a5a3f] hover:bg-[#d4d4c4]'
                    }`}
                >
                  <Map className="w-4 h-4" />
                  <span className="text-sm">Map</span>
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${activeTab === 'list'
                      ? 'bg-[#7a8c6f] border-[#5a5a4a] text-[#e8e8d8] shadow-md'
                      : 'bg-[#e8e8d8] border-[#a0a089] text-[#4a5a3f] hover:bg-[#d4d4c4]'
                    }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm">County List</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${activeTab === 'chat'
                      ? 'bg-[#7a8c6f] border-[#5a5a4a] text-[#e8e8d8] shadow-md'
                      : 'bg-[#e8e8d8] border-[#a0a089] text-[#4a5a3f] hover:bg-[#d4d4c4]'
                    }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">Chat</span>
                </button>
              </div>

              {/* Content */}
              <div className="bg-[#f5f5e8]">
                {activeTab === 'map' && (
                  <>
                    {/* Header */}
                    <div className="bg-[#c9d4bc] border-b-4 border-[#a0a089] p-6 text-center">
                      <h1 className="text-[#4a5a3f] mb-2">Your Florida County</h1>
                      <p className="text-[#6b7b5f]">Showing your current location</p>
                    </div>

                    {/* Map Area */}
                    <div className="p-4">
                      <FloridaMapOSM
                        counties={FLORIDA_COUNTIES}
                        userLatitude={userLatitude}
                        userLongitude={userLongitude}
                        onLocationReady={handleLocationReady}
                      />
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-[#c9d4bc] border-t-4 border-[#a0a089] text-center">
                      <p className="text-sm text-[#6b7b5f]">
                        Click city markers to view details
                      </p>
                    </div>
                  </>
                )}

                {activeTab === 'list' && (
                  <>
                    {/* Header */}
                    <div className="bg-[#c9d4bc] border-b-4 border-[#a0a089] p-6 text-center">
                      <h1 className="text-[#4a5a3f] mb-2">Browse All Counties</h1>
                      <p className="text-[#6b7b5f]">Search and select a county to view details</p>
                    </div>

                    {/* List Area */}
                    <div
                      className="p-6"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #e8e8d8 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      <CountyList onCountyClick={handleCountyClick} />
                    </div>
                  </>
                )}

                {activeTab === 'chat' && (
                  <ChatBox />
                )}
              </div>
            </div>

            {/* Window Shadow */}
            <div className="h-2 bg-[#5a5a4a] rounded-b-2xl opacity-50"></div>
          </>
        )}
      </div>
    </div>
  );
}