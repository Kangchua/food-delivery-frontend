import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';

interface AddressMapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  height?: string;
}

// Fix icon issues in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AddressMap: React.FC<AddressMapProps> = ({ 
  onLocationSelect, 
  initialLat = 16.0471, 
  initialLng = 108.2068,
  height = '400px'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle search with debounce
  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=10`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Debounced search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      handleSearch(query);
    }, 500);
  };

  // Handle search result selection
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const addressName = result.display_name;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }

    updateMarker(lat, lng, addressName);
    setShowResults(false);
    setSearchQuery('');
  };

  // Update marker and notify parent
  const updateMarker = (lat: number, lng: number, addressName: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        `<div style="font-size: 12px;">
          <p style="font-weight: bold; margin: 0;">📍 Tọa độ</p>
          <p style="margin: 4px 0;">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          <p style="margin: 4px 0; color: #666; word-break: break-word; max-width: 200px;">${addressName}</p>
        </div>`
      );
    marker.openPopup();

    markerRef.current = marker;
    onLocationSelect(lat, lng, addressName);
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([initialLat, initialLng], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Handle map click
    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      let addressName = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        addressName = data.display_name || addressName;
      } catch (error) {
        console.error('Error fetching address:', error);
      }

      updateMarker(lat, lng, addressName);
    };

    map.on('click', handleMapClick);

    // Add initial marker
    const initialMarker = L.marker([initialLat, initialLng]).addTo(map);
    markerRef.current = initialMarker;

    return () => {
      map.off('click', handleMapClick);
      map.remove();
    };
  }, []);

  return (
    <div className="space-y-3 relative">
      {/* Search Bar */}
      <div className="relative z-20">
        <div className="flex gap-2">
          <Input
            placeholder="Tìm kiếm địa chỉ... (VD: 72 Tôn Đức Thắng)"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleSearch(searchQuery)}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSearchResult(result)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b last:border-b-0 text-sm"
              >
                <p className="font-medium text-gray-800 truncate">{result.name}</p>
                <p className="text-gray-600 text-xs truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        style={{
          height,
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default AddressMap;
