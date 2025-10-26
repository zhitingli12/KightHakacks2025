import { MapContainer, TileLayer, CircleMarker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface ClickedLocationInfo {
    lat: number;
    lon: number;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
}

interface FloridaMapOSMProps {
    userLatitude: number;
    userLongitude: number;
    onLocationReady?: (lat: number, lon: number) => void;
    onMapClick?: (lat: number, lon: number) => void;
    clickedLocation?: ClickedLocationInfo | null;
}

function MapController({ center, zoom, shouldUpdate }: { center: LatLngExpression; zoom: number; shouldUpdate: boolean }) {
    const map = useMap();

    useEffect(() => {
        if (shouldUpdate) {
            map.setView(center, zoom);
        }
    }, [map, center, zoom, shouldUpdate]);

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

export function FloridaMapOSM({
    userLatitude,
    userLongitude,
    onLocationReady,
    onMapClick,
    clickedLocation
}: FloridaMapOSMProps) {
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([userLatitude, userLongitude]);
    const [mapZoom, setMapZoom] = useState(9);
    const [shouldUpdateView, setShouldUpdateView] = useState(true);
    const hasInitialized = useRef(false);
    const [localClickedCoords, setLocalClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Only zoom once on initial load
    useEffect(() => {
        if (!hasInitialized.current && userLatitude && userLongitude) {
            setMapCenter([userLatitude, userLongitude]);
            setMapZoom(9);
            setShouldUpdateView(true);
            hasInitialized.current = true;

            if (onLocationReady) {
                onLocationReady(userLatitude, userLongitude);
            }

            // Disable auto-update after initial load
            setTimeout(() => setShouldUpdateView(false), 100);
        }
    }, [userLatitude, userLongitude, onLocationReady]);

    const handleMapClick = (lat: number, lng: number) => {
        // Store local coordinates for display
        setLocalClickedCoords({ lat, lng });

        // Log to console
        console.log('═══════════════════════════════════════');
        console.log('🗺️  MAP CLICKED!');
        console.log('═══════════════════════════════════════');
        console.log('📍 Latitude:', lat);
        console.log('📍 Longitude:', lng);
        console.log('📋 Formatted:', `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        console.log('═══════════════════════════════════════');

        // Send to parent component (which will send to backend)
        if (onMapClick) {
            console.log('🚀 Sending coordinates to parent component...');
            onMapClick(lat, lng);
        }
    };

    return (
        <div className="relative w-full mx-auto">
            {/* Location info display */}
            <div className="absolute top-4 right-4 z-[1000] bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-4 py-2 text-[#4a5a3f] shadow-lg max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[#7a8c6f]" />
                    <h2 className="font-medium text-sm">
                        {clickedLocation?.city || 'Click to explore'}
                    </h2>
                </div>
                {clickedLocation && (
                    <div className="text-xs space-y-1">
                        {clickedLocation.county && (
                            <div>County: {clickedLocation.county}</div>
                        )}
                        {clickedLocation.state && (
                            <div>State: {clickedLocation.state}</div>
                        )}
                        <div className="text-[#6b7b5f] mt-1">
                            {clickedLocation.lat.toFixed(4)}°, {clickedLocation.lon.toFixed(4)}°
                        </div>
                    </div>
                )}
            </div>

            {/* Quick coordinates display */}
            {localClickedCoords && (
                <div className="absolute bottom-4 left-4 z-[1000] bg-[#e8e8d8] border-2 border-[#5a5a4a] rounded-lg px-3 py-2 shadow-lg">
                    <div className="text-xs text-[#4a5a3f]">
                        <div className="font-medium mb-1">Last Click:</div>
                        <div>Lat: {localClickedCoords.lat.toFixed(6)}</div>
                        <div>Lng: {localClickedCoords.lng.toFixed(6)}</div>
                    </div>
                </div>
            )}

            {/* Map container */}
            <div className="rounded-2xl overflow-hidden border-4 border-[#5a5a4a] shadow-2xl">
                <div style={{ height: '600px', width: '100%' }}>
                    <MapContainer
                        center={[userLatitude, userLongitude]}
                        zoom={9}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <MapController center={mapCenter} zoom={mapZoom} shouldUpdate={shouldUpdateView} />
                        <MapClickHandler onMapClick={handleMapClick} />

                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        {/* User's initial/current location marker (blue) */}
                        <CircleMarker
                            center={[userLatitude, userLongitude]}
                            pathOptions={{
                                fillColor: '#4A90E2',
                                color: '#ffffff',
                                weight: 3,
                                opacity: 1,
                                fillOpacity: 0.7,
                                radius: 10,
                            }}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong style={{ color: '#4a5a3f' }}>Your Location</strong>
                                    <br />
                                    <span style={{ fontSize: '0.75rem', color: '#5a5a4a' }}>
                                        {userLatitude.toFixed(4)}°, {userLongitude.toFixed(4)}°
                                    </span>
                                </div>
                            </Popup>
                        </CircleMarker>

                        {/* Clicked location marker (red) - only show if different from user location */}
                        {clickedLocation &&
                            (Math.abs(clickedLocation.lat - userLatitude) > 0.0001 ||
                                Math.abs(clickedLocation.lon - userLongitude) > 0.0001) && (
                                <CircleMarker
                                    center={[clickedLocation.lat, clickedLocation.lon]}
                                    pathOptions={{
                                        fillColor: '#E74C3C',
                                        color: '#ffffff',
                                        weight: 3,
                                        opacity: 1,
                                        fillOpacity: 0.8,
                                        radius: 8,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <strong style={{ color: '#4a5a3f' }}>
                                                {clickedLocation.city || 'Selected Location'}
                                            </strong>
                                            {clickedLocation.county && (
                                                <>
                                                    <br />
                                                    <span style={{ fontSize: '0.75rem', color: '#5a5a4a' }}>
                                                        {clickedLocation.county} County
                                                    </span>
                                                </>
                                            )}
                                            <br />
                                            <span style={{ fontSize: '0.7rem', color: '#6b7b5f' }}>
                                                {clickedLocation.lat.toFixed(4)}°, {clickedLocation.lon.toFixed(4)}°
                                            </span>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )}

                        {/* Local clicked coordinates marker (yellow/orange) - temporary until backend responds */}
                        {localClickedCoords &&
                            (!clickedLocation ||
                                (Math.abs(localClickedCoords.lat - clickedLocation.lat) > 0.0001 ||
                                    Math.abs(localClickedCoords.lng - clickedLocation.lon) > 0.0001)) && (
                                <CircleMarker
                                    center={[localClickedCoords.lat, localClickedCoords.lng]}
                                    pathOptions={{
                                        fillColor: '#F39C12',
                                        color: '#ffffff',
                                        weight: 2,
                                        opacity: 0.7,
                                        fillOpacity: 0.5,
                                        radius: 6,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-center">
                                            <strong style={{ color: '#4a5a3f' }}>Loading...</strong>
                                            <br />
                                            <span style={{ fontSize: '0.75rem', color: '#5a5a4a' }}>
                                                {localClickedCoords.lat.toFixed(4)}°, {localClickedCoords.lng.toFixed(4)}°
                                            </span>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )}
                    </MapContainer>
                </div>
            </div>

            
        </div>
    );
}