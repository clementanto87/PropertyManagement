import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, Users, AlertCircle, Maximize2, Minimize2, Home, Wrench, ArrowRight } from 'lucide-react';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

type Property = {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    status: 'OCCUPIED' | 'VACANT' | 'PARTIAL';
    occupancyRate: number;
    image?: string | null;
    totalUnits?: number;
    vacantUnits?: number;
    occupiedUnits?: number;
    maintenanceCount?: number;
};

interface PropertyMapProps {
    properties: Property[];
}

// Component to handle map resizing
function MapController({ isFullScreen }: { isFullScreen: boolean }) {
    const map = useMap();

    useEffect(() => {
        // Wait for transition to finish
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [isFullScreen, map]);

    return null;
}

export default function PropertyMap({ properties }: PropertyMapProps) {
    const navigate = useNavigate();
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Center map on the first property or default to New York
    const center: [number, number] = properties.length > 0
        ? [properties[0].latitude, properties[0].longitude]
        : [40.7128, -74.0060];

    return (
        <div className={`relative transition-all duration-300 bg-white ${isFullScreen
            ? 'fixed inset-0 z-[9999] h-screen w-screen'
            : 'h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm'
            }`}>
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={isFullScreen}
            >
                <MapController isFullScreen={isFullScreen} />

                {/* Dark Matter Tile Layer for Premium Look */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {properties.map((property) => (
                    <Marker
                        key={property.id}
                        position={[property.latitude, property.longitude]}
                        icon={DefaultIcon}
                    >
                        <Tooltip direction="top" offset={[0, -20]} opacity={1} className="custom-tooltip">
                            <div className="text-center px-1">
                                <div className="font-bold text-gray-900 text-sm">{property.name}</div>
                                <div className="text-xs text-gray-500">{property.address}</div>
                            </div>
                        </Tooltip>
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[240px]">
                                {property.image && (
                                    <img
                                        src={property.image}
                                        alt={property.name}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{property.name}</h3>
                                <p className="text-gray-500 text-sm mb-3">{property.address}</p>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                                        <div className="text-xs text-gray-500 mb-0.5">Total Units</div>
                                        <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
                                            <Building2 className="w-3 h-3" />
                                            {property.totalUnits || 0}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg text-center">
                                        <div className="text-xs text-gray-500 mb-0.5">Maintenance</div>
                                        <div className={`font-bold flex items-center justify-center gap-1 ${(property.maintenanceCount || 0) > 0 ? 'text-amber-600' : 'text-gray-900'
                                            }`}>
                                            <Wrench className="w-3 h-3" />
                                            {property.maintenanceCount || 0}
                                        </div>
                                    </div>
                                    <div className="bg-emerald-50 p-2 rounded-lg text-center">
                                        <div className="text-xs text-emerald-700 mb-0.5">Occupied</div>
                                        <div className="font-bold text-emerald-700">{property.occupiedUnits || 0}</div>
                                    </div>
                                    <div className="bg-red-50 p-2 rounded-lg text-center">
                                        <div className="text-xs text-red-700 mb-0.5">Vacant</div>
                                        <div className="font-bold text-red-700">{property.vacantUnits || 0}</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mb-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${property.status === 'OCCUPIED' ? 'bg-emerald-100 text-emerald-700' :
                                        property.status === 'VACANT' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {property.status}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">
                                        {property.occupancyRate}% Rate
                                    </span>
                                </div>

                                <button
                                    onClick={() => navigate(`/dashboard/properties/${property.id}`)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Full Screen Toggle */}
            <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg z-[10000] hover:bg-gray-50 transition-colors border border-gray-200"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
            >
                {isFullScreen ? (
                    <Minimize2 className="w-5 h-5 text-gray-700" />
                ) : (
                    <Maximize2 className="w-5 h-5 text-gray-700" />
                )}
            </button>

            {/* Overlay Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[10000] border border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Portfolio Status</h4>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-xs font-medium text-gray-700">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-xs font-medium text-gray-700">Partial</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-xs font-medium text-gray-700">Vacant</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
