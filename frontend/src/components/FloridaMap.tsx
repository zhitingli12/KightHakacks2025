import { MapPin, ArrowLeft, X } from 'lucide-react';
import { useState } from 'react';
import floridaOutline from 'figma:asset/36e183bc46a3bbdd561fc7841fa1e459a8da0e62.png';

interface County {
  name: string;
  x: number;
  y: number;
}

interface City {
  name: string;
  x: number;
  y: number;
  population?: number;
  description?: string;
  [key: string]: any; // For additional custom info
}

interface CountyData extends County {
  cities: City[];
}

type ViewMode = 'state' | 'county' | 'city';

interface FloridaMapProps {
  counties: CountyData[];
}

export function FloridaMap({ counties }: FloridaMapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('state');
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleCountyClick = (county: CountyData) => {
    setSelectedCounty(county);
    setViewMode('county');
  };

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
    setViewMode('city');
  };

  const handleBack = () => {
    if (viewMode === 'city') {
      setSelectedCity(null);
      setViewMode('county');
    } else if (viewMode === 'county') {
      setSelectedCounty(null);
      setViewMode('state');
    }
  };

  const handleCloseInfo = () => {
    setSelectedCity(null);
    setViewMode('county');
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Back Button */}
      {viewMode !== 'state' && (
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 z-20 bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-4 py-2 text-[#4a5a3f] shadow-lg hover:bg-[#d4a574] transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {viewMode === 'city' ? 'County' : 'Florida'}
        </button>
      )}

      {/* Title */}
      <div className="absolute top-4 right-4 z-20 bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-4 py-2 text-[#4a5a3f] shadow-lg">
        <h2 className="font-bold">
          {viewMode === 'state' && 'Florida Counties'}
          {viewMode === 'county' && selectedCounty?.name}
          {viewMode === 'city' && selectedCounty?.name}
        </h2>
      </div>

      {/* Map Container with Zoom Effect */}
      <div
        className={`relative transition-transform duration-500 ease-in-out ${viewMode === 'county' ? 'scale-150' : viewMode === 'city' ? 'scale-150' : 'scale-100'
          }`}
        style={{
          transformOrigin: viewMode !== 'state' && selectedCounty
            ? `${selectedCounty.x}% ${selectedCounty.y}%`
            : 'center'
        }}
      >
        {/* Florida Map Outline */}
        <img
          src={floridaOutline}
          alt="Florida Map Outline"
          className="w-full h-auto"
        />

        {/* County markers - shown in state view */}
        {viewMode === 'state' && (
          <div className="absolute inset-0">
            {counties.map((county) => (
              <button
                key={county.name}
                onClick={() => handleCountyClick(county)}
                className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125"
                style={{ left: `${county.x}%`, top: `${county.y}%` }}
              >
                <div className="relative">
                  <div className="w-5 h-5 bg-[#d4a574] border-2 border-[#5a5a4a] rounded-full shadow-lg group-hover:bg-[#c9b896] transition-colors flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-[#5a5a4a] rounded-full"></div>
                  </div>

                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-2 py-1 text-xs text-[#4a5a3f] shadow-md">
                      {county.name}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* City markers - shown in county view */}
        {viewMode === 'county' && selectedCounty && (
          <div className="absolute inset-0">
            {selectedCounty.cities.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city)}
                className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 animate-fadeIn"
                style={{ left: `${city.x}%`, top: `${city.y}%` }}
              >
                <div className="relative">
                  <MapPin className="w-6 h-6 text-[#d4a574] stroke-[#5a5a4a] stroke-2 drop-shadow-lg group-hover:text-[#c9b896] transition-colors" />

                  <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-2 py-1 text-xs text-[#4a5a3f] shadow-md">
                      {city.name}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City Info Panel */}
      {viewMode === 'city' && selectedCity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 transition-opacity duration-300">
          <div className="bg-[#e8e8d8] border-4 border-[#5a5a4a] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl relative">
            <button
              onClick={handleCloseInfo}
              className="absolute top-4 right-4 text-[#5a5a4a] hover:text-[#4a5a3f] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-[#4a5a3f] mb-4 pr-8">
              {selectedCity.name}
            </h2>

            <div className="space-y-3 text-[#5a5a4a]">
              {selectedCity.population && (
                <div>
                  <span className="font-semibold">Population:</span>{' '}
                  {selectedCity.population.toLocaleString()}
                </div>
              )}

              {selectedCity.description && (
                <div>
                  <span className="font-semibold">About:</span>
                  <p className="mt-1">{selectedCity.description}</p>
                </div>
              )}

              {/* Render any additional custom fields */}
              {Object.entries(selectedCity).map(([key, value]) => {
                if (key !== 'name' && key !== 'x' && key !== 'y' && key !== 'population' && key !== 'description' && value) {
                  return (
                    <div key={key}>
                      <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                      {value.toString()}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}