import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Chip } from '@mui/material';

// Fix for default marker icons - run once
const iconSetup = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};
iconSetup();

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ISP {
  id: string;
  trade: string;
  current_location?: { lat: number; lng: number };
  gps_coords?: { lat: number; lng: number };
  availability: string;
  rating: number;
}

interface ActivityMapProps {
  isps: ISP[];
  showActiveOnly?: boolean;
  center?: [number, number];
  zoom?: number;
}

const ActivityMap: React.FC<ActivityMapProps> = ({ 
  isps, 
  showActiveOnly = false,
  center = [7.9465, -1.0232], // Ghana center
  zoom = 7 
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [ispLocations, setIspLocations] = useState<any[]>([]);

  useEffect(() => {
    // Process ISP locations
    const locations = isps.map(isp => {
      const location = isp.current_location || isp.gps_coords;
      if (location) {
        const coords = typeof location === 'string' ? JSON.parse(location) : location;
        return {
          ...isp,
          lat: coords.lat,
          lng: coords.lng
        };
      }
      return null;
    }).filter(Boolean);

    setIspLocations(locations);

    // Center map on first ISP if available
    if (locations.length > 0) {
      setMapCenter([locations[0].lat, locations[0].lng]);
    }
  }, [isps]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return '#006B3F'; // Green
      case 'busy': return '#FFD400'; // Yellow
      case 'offline': return '#CE1126'; // Red
      default: return '#666666';
    }
  };

  const filteredISPs = showActiveOnly 
    ? ispLocations.filter(isp => isp.availability === 'available' || isp.availability === 'busy')
    : ispLocations;

  if (ispLocations.length === 0) {
    return (
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {filteredISPs.map((isp) => (
        <React.Fragment key={isp.id}>
          {/* ISP Location Marker */}
          <CircleMarker
            center={[isp.lat, isp.lng]}
            radius={15}
            pathOptions={{
              color: getAvailabilityColor(isp.availability),
              fillColor: getAvailabilityColor(isp.availability),
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {isp.trade}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip 
                    label={isp.availability} 
                    size="small"
                    sx={{ 
                      bgcolor: getAvailabilityColor(isp.availability),
                      color: 'white'
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    ⭐ {isp.rating?.toFixed(1) || 'N/A'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {isp.availability === 'available' ? 'Accepting new jobs' : 'Currently working'}
                </Typography>
              </Box>
            </Popup>
          </CircleMarker>

          {/* ISP Icon */}
          <Marker
            position={[isp.lat, isp.lng]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="
                background-color: ${getAvailabilityColor(isp.availability)};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <svg style="width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })}
          >
            <Popup>
              <Box sx={{ minWidth: 200 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  {isp.trade}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip 
                    label={isp.availability} 
                    size="small"
                    sx={{ 
                      bgcolor: getAvailabilityColor(isp.availability),
                      color: 'white'
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    ⭐ {isp.rating?.toFixed(1) || 'N/A'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {isp.availability === 'available' ? 'Accepting new jobs' : 'Currently working'}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default ActivityMap;