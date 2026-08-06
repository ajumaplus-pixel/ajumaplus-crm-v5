import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, IconButton } from '@mui/material';
import { MyLocation as MyLocationIcon } from '@mui/icons-material';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLocation = { lat: 7.9465, lng: -1.0232 }, // Ghana center
  height = '400px'
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLocation.lat, initialLocation.lng]);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (initialLocation) {
      setPosition([initialLocation.lat, initialLocation.lng]);
    }
  }, [initialLocation]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          onLocationSelect({ lat: newPos[0], lng: newPos[1] });
          reverseGeocode(newPos[0], newPos[1]);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setAddress(data.display_name || 'Location selected');
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="textSecondary">
          Click on the map to select your location
        </Typography>
        <IconButton onClick={handleGetCurrentLocation} size="small">
          <MyLocationIcon />
        </IconButton>
      </Box>
      
      <MapContainer
        center={position}
        zoom={13}
        style={{ height, width: '100%', borderRadius: 2 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapClickHandler />
      </MapContainer>
      
      {address && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Selected Location:
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {address}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
            Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LocationPicker;