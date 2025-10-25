import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { ArrowLeft, X, MapPin, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';

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

interface FloridaMapOSMProps {
    counties: CountyData[];
    userLatitude?: number;
    userLongitude?: number;
    onLocationReady?: (county: CountyData | null) => void;
}

function MapController({ center, zoom }: { center: LatLngExpression; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [map, center, zoom]);

    return null;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
        },
    });
    return null;
}

type ViewMode = 'state' | 'county' | 'city';

// Helper function to calculate distance between two coordinates (Haversine formula)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

export function FloridaMapOSM({
    counties,
    userLatitude,
    userLongitude,
    onLocationReady
}: FloridaMapOSMProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('state');
    const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([27.6648, -81.5158]);
    const [mapZoom, setMapZoom] = useState(7);
    const [locationStatus, setLocationStatus] = useState<'loading' | 'success' | 'error' | 'outside-florida'>('loading');
    const [locationError, setLocationError] = useState<string>('');
    const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Process user location when lat/lng props are provided
    useEffect(() => {
        if (userLatitude === undefined || userLongitude === undefined) {
            setLocationStatus('loading');
            return;
        }

        // Check if user is in Florida (rough bounds)
        const inFlorida =
            userLatitude >= 24.5 && userLatitude <= 31.0 &&
            userLongitude >= -87.6 && userLongitude <= -80.0;

        if (!inFlorida) {
            setLocationStatus('outside-florida');
            setLocationError('Location is not in Florida');
            onLocationReady?.(null);
            return;
        }

        // Find nearest county
        let nearestCounty = counties[0];
        let minDistance = getDistance(userLatitude, userLongitude, counties[0].lat, counties[0].lng);

        counties.forEach(county => {
            const distance = getDistance(userLatitude, userLongitude, county.lat, county.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearestCounty = county;
            }
        });

        // Auto-select the nearest county
        setSelectedCounty(nearestCounty);
        setMapCenter([nearestCounty.lat, nearestCounty.lng]);
        setMapZoom(10);
        setViewMode('county');
        setLocationStatus('success');

        // Notify parent component
        onLocationReady?.(nearestCounty);
    }, [userLatitude, userLongitude, counties, onLocationReady]);

    const handleMapClick = (lat: number, lng: number) => {
        setClickedCoords({ lat, lng });
        console.log('═══════════════════════════════════════');
        console.log('🗺️  MAP CLICKED!');
        console.log('═══════════════════════════════════════');
        console.log('📍 Latitude:', lat);
        console.log('📍 Longitude:', lng);
        console.log('📋 Formatted:', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        console.log('═══════════════════════════════════════');
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
            setMapCenter([27.6648, -81.5158]);
            setMapZoom(7);
            setViewMode('state');
        }
    };

    const handleCloseInfo = () => {
        setSelectedCity(null);
        setViewMode('county');
    };

    // Show loading screen while waiting for location data
    if (locationStatus === 'loading') {
        return (
            <div className="relative w-full mx-auto">
                <div className="rounded-2xl overflow-hidden border-4 border-[#5a5a4a] shadow-2xl bg-[#e8e8d8] h-[600px] flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Loader className="w-12 h-12 text-[#7a8c6f] animate-spin mx-auto" />
                        <div className="text-[#4a5a3f]">
                            <p className="text-lg font-medium">Loading location data...</p>
                            <p className="text-sm text-[#6b7b5f] mt-2">Please wait</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error screen if location is invalid
    if (locationStatus === 'error' || locationStatus === 'outside-florida') {
        return (
            <div className="relative w-full mx-auto">
                <div className="rounded-2xl overflow-hidden border-4 border-[#5a5a4a] shadow-2xl bg-[#e8e8d8] h-[600px] flex items-center justify-center">
                    <div className="text-center space-y-4 max-w-md px-6">
                        <MapPin className="w-12 h-12 text-[#d4a574] mx-auto" />
                        <div className="text-[#4a5a3f]">
                            <p className="text-lg font-medium mb-2">
                                {locationStatus === 'outside-florida' ? 'Not in Florida' : 'Location Error'}
                            </p>
                            <p className="text-sm text-[#6b7b5f]">{locationError}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full mx-auto">
            {viewMode !== 'state' && (
                <button
                    onClick={handleBack}
                    className="absolute top-4 left-4 z-[1000] bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-4 py-2 text-[#4a5a3f] shadow-lg hover:bg-[#d4a574] transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to {viewMode === 'city' ? 'County' : 'Florida'}
                </button>
            )}

            <div className="absolute top-4 right-4 z-[1000] bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-4 py-2 text-[#4a5a3f] shadow-lg">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7a8c6f]" />
                    <h2 className="font-medium text-sm">
                        {viewMode === 'county' && selectedCounty?.name}
                        {viewMode === 'city' && selectedCounty?.name}
                    </h2>
                </div>
            </div>

            {/* Display clicked coordinates on screen */}
            {clickedCoords && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-4 py-2 shadow-lg">
                    <div className="text-xs text-[#4a5a3f]">
                        <div className="font-medium mb-1">Last Clicked:</div>
                        <div>Lat: {clickedCoords.lat.toFixed(6)}</div>
                        <div>Lng: {clickedCoords.lng.toFixed(6)}</div>
                    </div>
                </div>
            )}

            <div className="rounded-2xl overflow-hidden border-4 border-[#5a5a4a] shadow-2xl">
                <div style={{ height: '600px', width: '100%' }}>
                    <MapContainer
                        center={[27.6648, -81.5158]}
                        zoom={7}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <MapController center={mapCenter} zoom={mapZoom} />
                        <MapClickHandler onMapClick={handleMapClick} />

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        {/* Show county marker */}
                        {selectedCounty && (
                            <CircleMarker
                                center={[selectedCounty.lat, selectedCounty.lng]}
                                pathOptions={{
                                    fillColor: '#d4a574',
                                    color: '#5a5a4a',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8,
                                    radius: 8,
                                }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong style={{ color: '#4a5a3f' }}>{selectedCounty.name}</strong>
                                        <br />
                                        <span style={{ fontSize: '0.75rem', color: '#5a5a4a' }}>
                                            Your current county
                                        </span>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        )}

                        {/* Show clicked location marker */}
                        {clickedCoords && (
                            <CircleMarker
                                center={[clickedCoords.lat, clickedCoords.lng]}
                                pathOptions={{
                                    fillColor: '#ff6b6b',
                                    color: '#ffffff',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.8,
                                    radius: 6,
                                }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong style={{ color: '#4a5a3f' }}>Clicked Location</strong>
                                        <br />
                                        <span style={{ fontSize: '0.75rem', color: '#5a5a4a' }}>
                                            {clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)}
                                        </span>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        )}

                        {/* Show city markers when in county view */}
                        {viewMode === 'county' && selectedCounty && selectedCounty.cities.map((city) => (
                            <CircleMarker
                                key={city.name}
                                center={[city.lat, city.lng]}
                                pathOptions={{
                                    fillColor: '#c9b896',
                                    color: '#5a5a4a',
                                    weight: 2,
                                    opacity: 1,
                                    fillOpacity: 0.9,
                                    radius: 6,
                                }}
                                eventHandlers={{
                                    click: () => handleCityClick(city),
                                }}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong style={{ color: '#4a5a3f' }}>{city.name}</strong>
                                        <br />
                                        {city.population && (
                                            <span style={{ fontSize: '0.75rem', color: '#5a5a4a' }}>
                                                Pop: {city.population.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {viewMode === 'city' && selectedCity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
                    <div className="bg-[#e8e8d8] border-4 border-[#5a5a4a] rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl relative">
                        <button
                            onClick={handleCloseInfo}
                            className="absolute top-4 right-4 text-[#5a5a4a] hover:text-[#4a5a3f] transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-medium text-[#4a5a3f] mb-4 pr-8">
                            {selectedCity.name}
                        </h2>

                        <div className="space-y-3 text-[#5a5a4a]">
                            {selectedCity.population && (
                                <div>
                                    <span className="font-medium">Population:</span>{' '}
                                    {selectedCity.population.toLocaleString()}
                                </div>
                            )}

                            {selectedCity.description && (
                                <div>
                                    <span className="font-medium">About:</span>
                                    <p className="mt-1">{selectedCity.description}</p>
                                </div>
                            )}

                            {Object.entries(selectedCity).map(([key, value]) => {
                                if (key !== 'name' && key !== 'lat' && key !== 'lng' && key !== 'population' && key !== 'description' && value) {
                                    return (
                                        <div key={key}>
                                            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
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