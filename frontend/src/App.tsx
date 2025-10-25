import { useState } from 'react';
import { FloridaMap } from './components/FloridaMap';
import { CountyDetails } from './components/CountyDetails';
import { CityDetails } from './components/CityDetails';
import { CountyList } from './components/CountyList';
import { ChatBox } from './components/ChatBox';
import { Map, List, MessageSquare } from 'lucide-react';

const FLORIDA_COUNTIES = [
  // Panhandle - West to East
  { name: 'Escambia', x: 7, y: 24 },
  { name: 'Santa Rosa', x: 13, y: 23 },
  { name: 'Okaloosa', x: 18, y: 24 },
  { name: 'Walton', x: 23, y: 25 },
  { name: 'Holmes', x: 20, y: 20 },
  { name: 'Washington', x: 25, y: 20 },
  { name: 'Bay', x: 28, y: 27 },
  { name: 'Gulf', x: 31, y: 32 },
  { name: 'Calhoun', x: 28, y: 22 },
  { name: 'Jackson', x: 22, y: 18 },
  { name: 'Gadsden', x: 31, y: 16 },
  { name: 'Liberty', x: 33, y: 21 },
  { name: 'Franklin', x: 35, y: 30 },
  { name: 'Leon', x: 36, y: 18 },
  { name: 'Wakulla', x: 38, y: 24 },
  
  // North Florida
  { name: 'Jefferson', x: 40, y: 18 },
  { name: 'Madison', x: 44, y: 17 },
  { name: 'Taylor', x: 43, y: 23 },
  { name: 'Hamilton', x: 48, y: 17 },
  { name: 'Suwannee', x: 50, y: 19 },
  { name: 'Lafayette', x: 47, y: 23 },
  { name: 'Dixie', x: 48, y: 27 },
  { name: 'Columbia', x: 53, y: 19 },
  { name: 'Gilchrist', x: 52, y: 24 },
  { name: 'Union', x: 55, y: 23 },
  { name: 'Baker', x: 58, y: 20 },
  { name: 'Bradford', x: 56, y: 25 },
  { name: 'Nassau', x: 63, y: 18 },
  { name: 'Duval', x: 67, y: 21 },
  
  // North Central
  { name: 'Alachua', x: 58, y: 28 },
  { name: 'Levy', x: 53, y: 30 },
  { name: 'Clay', x: 65, y: 24 },
  { name: 'St. Johns', x: 70, y: 23 },
  { name: 'Putnam', x: 63, y: 28 },
  
  // Central Florida
  { name: 'Marion', x: 60, y: 33 },
  { name: 'Citrus', x: 52, y: 35 },
  { name: 'Hernando', x: 54, y: 39 },
  { name: 'Sumter', x: 59, y: 38 },
  { name: 'Lake', x: 64, y: 38 },
  { name: 'Flagler', x: 72, y: 30 },
  { name: 'Volusia', x: 69, y: 34 },
  { name: 'Seminole', x: 69, y: 40 },
  { name: 'Pasco', x: 57, y: 43 },
  { name: 'Hillsborough', x: 57, y: 47 },
  { name: 'Pinellas', x: 54, y: 48 },
  { name: 'Polk', x: 63, y: 46 },
  { name: 'Orange', x: 69, y: 44 },
  { name: 'Osceola', x: 69, y: 50 },
  { name: 'Brevard', x: 77, y: 47 },
  
  // Southwest Florida
  { name: 'Manatee', x: 58, y: 53 },
  { name: 'Sarasota', x: 58, y: 57 },
  { name: 'Hardee', x: 63, y: 53 },
  { name: 'DeSoto', x: 63, y: 57 },
  { name: 'Charlotte', x: 63, y: 61 },
  { name: 'Highlands', x: 68, y: 55 },
  { name: 'Okeechobee', x: 73, y: 56 },
  { name: 'Indian River', x: 77, y: 53 },
  { name: 'Lee', x: 65, y: 66 },
  { name: 'Glades', x: 70, y: 61 },
  { name: 'St. Lucie', x: 78, y: 58 },
  { name: 'Martin', x: 81, y: 60 },
  { name: 'Hendry', x: 70, y: 67 },
  
  // Southeast Florida
  { name: 'Collier', x: 69, y: 75 },
  { name: 'Palm Beach', x: 79, y: 66 },
  { name: 'Broward', x: 81, y: 73 },
  { name: 'Miami-Dade', x: 82, y: 79 },
  
  // Florida Keys
  { name: 'Monroe', x: 72, y: 88 }
];

type TabType = 'map' | 'list' | 'chat';

export default function App() {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('map');

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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    activeTab === 'map'
                      ? 'bg-[#7a8c6f] border-[#5a5a4a] text-[#e8e8d8] shadow-md'
                      : 'bg-[#e8e8d8] border-[#a0a089] text-[#4a5a3f] hover:bg-[#d4d4c4]'
                  }`}
                >
                  <Map className="w-4 h-4" />
                  <span className="text-sm">Map</span>
                </button>
                <button
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    activeTab === 'list'
                      ? 'bg-[#7a8c6f] border-[#5a5a4a] text-[#e8e8d8] shadow-md'
                      : 'bg-[#e8e8d8] border-[#a0a089] text-[#4a5a3f] hover:bg-[#d4d4c4]'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="text-sm">County List</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    activeTab === 'chat'
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
                      <h1 className="text-[#4a5a3f] mb-2">Florida's 67 Counties</h1>
                      <p className="text-[#6b7b5f]">Click on any county to learn more about it</p>
                    </div>

                    {/* Map Area */}
                    <div 
                      className="p-8 min-h-[500px] flex items-center justify-center"
                      style={{ 
                        backgroundImage: 'radial-gradient(circle, #e8e8d8 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                      }}
                    >
                      <FloridaMap counties={FLORIDA_COUNTIES} onCountyClick={handleCountyClick} />
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-[#c9d4bc] border-t-4 border-[#a0a089] text-center">
                      <p className="text-sm text-[#6b7b5f]">
                        Hover over county markers to see names • Click to view detailed information
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