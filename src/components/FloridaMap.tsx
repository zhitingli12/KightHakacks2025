import { MapPin } from 'lucide-react';
import floridaOutline from 'figma:asset/36e183bc46a3bbdd561fc7841fa1e459a8da0e62.png';

interface County {
  name: string;
  x: number;
  y: number;
}

interface FloridaMapProps {
  onCountyClick: (countyName: string) => void;
  counties: County[];
}

export function FloridaMap({ onCountyClick, counties }: FloridaMapProps) {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Florida Map Outline */}
      <img 
        src={floridaOutline} 
        alt="Florida Map Outline" 
        className="w-full h-auto"
      />
      
      {/* County markers overlay */}
      <div className="absolute inset-0">
        {counties.map((county) => (
          <button
            key={county.name}
            onClick={() => onCountyClick(county.name)}
            className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110"
            style={{ left: `${county.x}%`, top: `${county.y}%` }}
          >
            {/* County marker circle */}
            <div className="relative">
              <div className="w-5 h-5 bg-[#d4a574] border-2 border-[#5a5a4a] rounded-full shadow-lg group-hover:bg-[#c9b896] transition-colors flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#5a5a4a] rounded-full"></div>
              </div>
              
              {/* County label */}
              <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-2 py-1 text-xs text-[#4a5a3f] shadow-md">
                  {county.name}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}