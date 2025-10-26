import { useState, useEffect, useCallback } from 'react';
import logo from './assets/logo.png';
import { FloridaMapOSM } from './components/FloridaMapOSM';
import { CountyDetails } from './components/CountyDetails';
import { CityDetails } from './components/CityDetails';
import { CountyList } from './components/CountyList';
import { ChatBox } from './components/ChatBox';
import { Map, List, MessageSquare } from 'lucide-react';

interface ClickedLocationInfo {
  lat: number;
  lon: number;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
}

interface LocationData {
  clicked_location: {
    lat: number;
    lon: number;
  };
  location_info: {
    country: string | null;
    state: string | null;
    county: string | null;
    city: string | null;
    all_cities_nearby: string[];
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  nearby_cities: string[];
}

type TabType = 'map' | 'list' | 'chat';

// API configuration - Update this to match your backend
const API_URL = 'http://localhost:8000';

export default function App() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('map');

  // User location state
  const [userLatitude, setUserLatitude] = useState<number>(28.5383); // Default: Orlando
  const [userLongitude, setUserLongitude] = useState<number>(-81.3792);

  // Clicked location info
  const [clickedLocation, setClickedLocation] = useState<ClickedLocationInfo | null>(null);
  const [nearbyCities, setNearbyCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get user's initial location on mount
  useEffect(() => {
    // Try to get user's geolocation from browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          console.log('📍 Browser geolocation:', lat, lon);
          setUserLatitude(lat);
          setUserLongitude(lon);
        },
        (error) => {
          console.error('❌ Geolocation error:', error);
          // Fallback to Orlando coordinates
          setUserLatitude(28.5383);
          setUserLongitude(-81.3792);
        }
      );
    }
  }, []);

  // Fetch location info from backend
  const fetchLocationInfo = async (lat: number, lon: number) => {
    console.log('\n🔄 Starting fetchLocationInfo...');
    console.log('📍 Coordinates:', lat, lon);
    console.log('🌐 API URL:', API_URL);

    setIsLoading(true);
    setError(null);

    try {
      const url = `${API_URL}/reverse-geocode?lat=${lat}&lon=${lon}&radius_km=25`;

      console.log('📤 Request URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Success! Data received:', JSON.stringify(data, null, 2));

      // Update state with location info - data is now LocationResponse format
      setClickedLocation({
        lat: data.latitude || lat,
        lon: data.longitude || lon,
        city: data.city || undefined,
        county: data.county || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
      });

      // For now, set empty nearby cities since reverse-geocode doesn't return them
      // You could make a separate call to get nearby cities if needed
      setNearbyCities([]);

    } catch (error) {
      console.error('❌ ERROR in fetchLocationInfo:');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));

      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Cannot connect to backend. Is it running on http://localhost:8000?');
      } else {
        setError(error instanceof Error ? error.message : 'Failed to fetch location information');
      }

      setClickedLocation({
        lat,
        lon,
        city: 'Error loading',
        county: 'Error loading',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lon: number) => {
    console.log('\n═══════════════════════════════════════');
    console.log('🗺️  MAP CLICK HANDLER in App.tsx');
    console.log('═══════════════════════════════════════');
    console.log('📍 Coordinates:', lat, lon);

    // Update coordinates
    setUserLatitude(lat);
    setUserLongitude(lon);

    // Fetch location info from backend
    await fetchLocationInfo(lat, lon);
  }, []);

  // Handle when initial location is determined
  const handleLocationReady = useCallback((lat: number, lon: number) => {
    console.log('📍 Initial location ready:', lat, lon);
    // Optionally fetch info for initial location
    // fetchLocationInfo(lat, lon);
  }, []);

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

  // Test backend connection on mount
  useEffect(() => {
    const testBackend = async () => {
      try {
        console.log('🔍 Testing backend connection...');
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Backend is healthy:', data);
        } else {
          console.error('❌ Backend health check failed:', response.status);
        }
      } catch (error) {
        console.error('❌ Cannot connect to backend:', error);
        console.log('💡 Make sure backend is running: python main.py');
      }
    };
    testBackend();
  }, []);

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
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#d4a574] border-2 border-[#5a5a4a]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#c9b896] border-2 border-[#5a5a4a]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#a0a089] border-2 border-[#5a5a4a]"></div>
                  </div>
                  <span className="text-[#e8e8d8]">Florida Explorer</span>
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
                    <div className="bg-[#c9d4bc] border-b-4 border-[#a0a089] p-4 text-center">
                      {isLoading ? (
                        <h1 className="text-[#4a5a3f] mb-2">Loading location...</h1>
                      ) : error ? (
                        <>
                          <h1 className="text-red-600 mb-2">⚠️ {error}</h1>
                          <p className="text-xs text-[#6b7b5f]">Check console for details (F12)</p>
                        </>
                      ) : clickedLocation ? (
                        <>
                          <h1 className="text-[#4a5a3f] mb-2 text-lg font-semibold">
                            {clickedLocation.city || 'Unknown City'}
                            {clickedLocation.county && `, ${clickedLocation.county} County`}
                            {clickedLocation.state && `, ${clickedLocation.state}`}
                          </h1>
                          <p className="text-sm text-[#6b7b5f]">
                            Coordinates: {clickedLocation.lat.toFixed(4)}°, {clickedLocation.lon.toFixed(4)}°
                          </p>
                          {nearbyCities.length > 0 && (
                            <p className="text-xs text-[#6b7b5f] mt-1">
                              Nearby cities: {nearbyCities.slice(0, 5).join(', ')}
                              {nearbyCities.length > 5 && ` +${nearbyCities.length - 5} more`}
                            </p>
                          )}
                        </>
                      ) : (
                        <h1 className="text-[#4a5a3f] mb-2">Click anywhere on the map to explore</h1>
                      )}
                    </div>

                    {/* Map Area */}
                    <div className="p-4">
                      <FloridaMapOSM
                        userLatitude={userLatitude}
                        userLongitude={userLongitude}
                        onLocationReady={handleLocationReady}
                        onMapClick={handleMapClick}
                        clickedLocation={clickedLocation}
                      />
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-[#c9d4bc] border-t-4 border-[#a0a089] text-center">
                      <p className="text-sm text-[#6b7b5f]">
                        Click anywhere on the map to get location details from the backend
                      </p>
                      <p className="text-xs text-[#6b7b5f] mt-1">
                        Backend: {API_URL}
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
                      <CountyList onCountyClick={handleCountyClick} apiUrl={API_URL} />
                    </div>
                  </>
                )}

                {activeTab === 'chat' && <ChatBox />}
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