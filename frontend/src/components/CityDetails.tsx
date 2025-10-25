import { Button } from './ui/button';
import { ArrowLeft, MapPin, MessageSquare, DollarSign, CloudRain, Wind, Waves, Sun, Shield } from 'lucide-react';
import { INSURANCE_RATES, ENVIRONMENTAL_DATA } from '../data/countyInsuranceData';

interface CityDetailsProps {
  cityName: string;
  countyName: string;
  onBack: () => void;
  onOpenChat: () => void;
}

const INSURANCE_TYPES = [
  { code: 'HO-1', name: 'Basic Form', description: 'Protects against a small list of named perils (fire, lightning, windstorm, theft)' },
  { code: 'HO-2', name: 'Broad Form', description: 'Covers about 16 named perils (freezing, water damage, falling objects, etc.)' },
  { code: 'HO-3', name: 'Special Form', description: 'Covers all perils except those specifically excluded (floods, earthquakes, neglect)' },
  { code: 'HO-4', name: 'Renters Insurance', description: 'For renters — protects belongings and provides liability, not the building' },
  { code: 'HO-5', name: 'Comprehensive Form', description: 'Premium HO-3 — covers dwelling and property on open-perils basis' },
  { code: 'HO-6', name: 'Condo Form', description: 'For condo owners — covers interior walls, floors, ceilings, and personal property' },
  { code: 'HO-7', name: 'Mobile Home Form', description: 'Similar to HO-3 but tailored for manufactured or mobile homes' },
  { code: 'HO-8', name: 'Older Home Form', description: 'For historic/older homes where replacement cost exceeds market value' },
];

export function CityDetails({ cityName, countyName, onBack, onOpenChat }: CityDetailsProps) {
  const insuranceRates = INSURANCE_RATES[countyName];
  const environmentalData = ENVIRONMENTAL_DATA[countyName];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        onClick={onBack}
        className="mb-6 bg-[#7a8c6f] hover:bg-[#6b7b5f] border-3 border-[#5a5a4a] rounded-full shadow-lg text-[#e8e8d8]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to {countyName} County
      </Button>

      {/* City Info Card */}
      <div className="bg-[#e8e8d8] rounded-2xl border-4 border-[#5a5a4a] shadow-2xl overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-[#7a8c6f] border-b-4 border-[#5a5a4a] px-6 py-4">
          <h1 className="text-[#e8e8d8] flex items-center gap-3">
            <MapPin className="w-8 h-8" />
            {cityName}, Florida
          </h1>
        </div>

        {/* Content */}
        <div className="p-6 bg-[#f5f5e8] space-y-6">
          {/* Insurance Rates Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#4a5a3f]">
              <Shield className="w-6 h-6" />
              <h2>Home Insurance Rates</h2>
            </div>
            <p className="text-[#6b7b5f] text-sm">
              Estimated annual home insurance rates for {cityName} (rates based on {countyName} County data)
            </p>

            {insuranceRates && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {INSURANCE_TYPES.map((type, index) => {
                  const rateKey = `ho${index + 1}` as keyof typeof insuranceRates;
                  const rate = insuranceRates[rateKey];
                  
                  return (
                    <div key={type.code} className="bg-[#c9d4bc] border-3 border-[#a0a089] rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-[#4a5a3f] text-sm">{type.code}</h3>
                          <p className="text-[#5a5a4a] text-xs">{type.name}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#7a8c6f] text-[#e8e8d8] px-3 py-1 rounded-full">
                          {/* <DollarSign className="w-4 h-4" /> */}
                          <span className="text-m">{rate}</span>
                        </div>
                      </div>
                      <p className="text-[#6b7b5f] text-xs leading-relaxed">{type.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Environmental Data Section */}
          {environmentalData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#4a5a3f]">
                <CloudRain className="w-6 h-6" />
                <h2>Environmental & Climate Data</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#c9d4bc] border-3 border-[#a0a089] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-[#4a5a3f] mb-2">
                    <CloudRain className="w-5 h-5" />
                    <span className="text-sm">Climate Change Impact</span>
                  </div>
                  <p className="text-[#5a5a4a] text-sm">{environmentalData.climateChange}</p>
                </div>

                <div className="bg-[#c9d4bc] border-3 border-[#a0a089] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-[#4a5a3f] mb-2">
                    <Wind className="w-5 h-5" />
                    <span className="text-sm">Storm Risk</span>
                  </div>
                  <p className="text-[#5a5a4a] text-sm">{environmentalData.storms}</p>
                </div>

                <div className="bg-[#c9d4bc] border-3 border-[#a0a089] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-[#4a5a3f] mb-2">
                    <Waves className="w-5 h-5" />
                    <span className="text-sm">Distance to Coast</span>
                  </div>
                  <p className="text-[#5a5a4a] text-sm">{environmentalData.coastDistance}</p>
                </div>

                <div className="bg-[#c9d4bc] border-3 border-[#a0a089] rounded-xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-[#4a5a3f] mb-2">
                    <CloudRain className="w-5 h-5" />
                    <span className="text-sm">Average Rainfall</span>
                  </div>
                  <p className="text-[#5a5a4a] text-sm">{environmentalData.avgRainfall}</p>
                </div>

                <div className="bg-[#c9d4bc] border-3 border-[#a0a089] rounded-xl p-4 shadow-md md:col-span-2">
                  <div className="flex items-center gap-2 text-[#4a5a3f] mb-2">
                    <Sun className="w-5 h-5" />
                    <span className="text-sm">Solar Energy Potential</span>
                  </div>
                  <p className="text-[#5a5a4a] text-sm">{environmentalData.solarPotential}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Button */}
          <div className="pt-4 border-t-3 border-[#a0a089]">
            <Button
              onClick={onOpenChat}
              className="w-full bg-[#7a8c6f] hover:bg-[#6b7b5f] border-3 border-[#5a5a4a] rounded-xl shadow-lg text-[#e8e8d8] py-6"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Have questions? Chat with our AI assistant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
