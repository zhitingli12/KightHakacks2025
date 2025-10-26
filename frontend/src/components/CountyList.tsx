import { useState } from 'react';
import { Input } from './ui/input';
import { Search, MapPin } from 'lucide-react';

interface CountyListProps {
  onCountyClick: (countyName: string) => void;
}

const ALL_COUNTIES = [
  'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte',
  'Citrus', 'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia',
  'Flagler', 'Franklin', 'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton', 'Hardee',
  'Hendry', 'Hernando', 'Highlands', 'Hillsborough', 'Holmes', 'Indian River', 'Jackson',
  'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee',
  'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa', 'Okeechobee', 'Orange',
  'Osceola', 'Palm Beach', 'Pasco', 'Pinellas', 'Polk', 'Putnam', 'Santa Rosa', 'Sarasota',
  'Seminole', 'St. Johns', 'St. Lucie', 'Sumter', 'Suwannee', 'Taylor', 'Union', 'Volusia',
  'Wakulla', 'Walton', 'Washington'
];

export function CountyList({ onCountyClick }: CountyListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCounties = ALL_COUNTIES.filter((county) =>
    county.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#a0a089]" />
        <Input
          type="text"
          placeholder="Search counties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-5 bg-[#f5f5e8] border-3 border-[#a0a089] focus:border-[#7a8c6f] rounded-full h-12 text-[#4a5a3f] placeholder:text-[#a0a089] shadow-inner"
        />
      </div>

      {/* County Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[450px] overflow-y-auto pr-2">
        {filteredCounties.map((county) => (
          <button
            key={county}
            onClick={() => onCountyClick(county)}
            className="bg-[#e8e8d8] border-3 border-[#a0a089] hover:border-[#7a8c6f] hover:bg-[#c9d4bc] rounded-xl p-4 shadow-md transition-all group"
          >
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-5 h-5 text-[#7a8c6f] group-hover:text-[#6b7b5f]" />
              <span className="text-sm text-[#4a5a3f] text-center">{county}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="text-center text-sm text-[#6b7b5f]">
        Showing {filteredCounties.length} of {ALL_COUNTIES.length} counties
      </div>
    </div>
  );
}