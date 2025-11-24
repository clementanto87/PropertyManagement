import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Building2, Users, AlertCircle } from 'lucide-react';

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
};

interface PropertyMapProps {
    properties: Property[];
}

export default function PropertyMap({ properties }: PropertyMapProps) {
    // Center map on the first property or default to New York
    const center: [number, number] = properties.length > 0
        ? [properties[0].latitude, properties[0].longitude]
        : [40.7128, -74.0060];

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
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
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[200px]">
                                {property.image && (
                                    <img
                                        src={property.image}
                                        alt={property.name}
                                        className="w-full h-32 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <h3 className="font-bold text-gray-900 text-lg mb-1">{property.name}</h3>
                                <p className="text-gray-500 text-sm mb-3">{property.address}</p>

                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${property.status === 'OCCUPIED' ? 'bg-emerald-100 text-emerald-700' :
                                            property.status === 'VACANT' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {property.status}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">
                                        {property.occupancyRate}% Occupied
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg z-[1000] border border-gray-200">
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
