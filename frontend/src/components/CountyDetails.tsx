import { useState } from 'react';
import { Button } from './ui/button';
import { ArrowLeft, MapPin, Search } from 'lucide-react';
import { Input } from './ui/input';
import { COUNTY_CITIES } from '../data/countyCityData';

interface CountyDetailsProps {
  countyName: string;
  onBack: () => void;
  onCityClick: (cityName: string) => void;
}

export function CountyDetails({ countyName, onBack, onCityClick }: CountyDetailsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const cities = COUNTY_CITIES[countyName] || [];
  
  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        onClick={onBack}
        className="mb-6 bg-[#7a8c6f] hover:bg-[#6b7b5f] border-3 border-[#5a5a4a] rounded-full shadow-lg text-[#e8e8d8]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Map
      </Button>

      {/* County Cities Card */}
      <div className="bg-[#e8e8d8] rounded-2xl border-4 border-[#5a5a4a] shadow-2xl overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-[#7a8c6f] border-b-4 border-[#5a5a4a] px-6 py-4">
          <h1 className="text-[#e8e8d8] flex items-center gap-3">
            <MapPin className="w-8 h-8" />
            {countyName} County Cities
          </h1>
          <p className="text-[#c9d4bc] text-sm mt-1">Select a city to view insurance rates and environmental data</p>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#f5f5e8] space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a0a089]" />
            <Input
              type="text"
              placeholder="Search cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-[#e8e8d8] border-3 border-[#a0a089] focus:border-[#7a8c6f] rounded-full px-5 h-12 text-[#4a5a3f] placeholder:text-[#a0a089] shadow-inner"
            />
          </div>

          {/* Cities Grid */}
          {filteredCities.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => onCityClick(city)}
                    className="bg-[#c9d4bc] border-3 border-[#a0a089] hover:border-[#7a8c6f] hover:bg-[#b8c5ab] rounded-xl p-4 shadow-md transition-all group"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#7a8c6f] group-hover:text-[#6b7b5f]" />
                      <span className="text-sm text-[#4a5a3f] text-center">{city}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Results count */}
              <div className="text-center text-sm text-[#6b7b5f]">
                Showing {filteredCities.length} of {cities.length} cities
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-[#a0a089] mx-auto mb-4" />
              <p className="text-[#6b7b5f]">
                {searchQuery ? 'No cities found matching your search.' : 'No cities available for this county.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
