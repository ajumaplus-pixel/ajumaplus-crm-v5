import React from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { Box } from '@mui/material';

interface ServiceAreaMapProps {
  isps: any[];
  center?: [number, number];
  zoom?: number;
}

const ServiceAreaMap: React.FC<ServiceAreaMapProps> = ({ 
  isps, 
  center = [7.9469, -1.0232], 
  zoom = 6 
}) => {
  return (
    <Box sx={{ height: '500px', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Service areas only - no specific ISP locations */}
        {isps.map((isp) => {
          if (!isp.gps_coords) return null;
          const gpsCoords = typeof isp.gps_coords === 'string' ? JSON.parse(isp.gps_coords) : isp.gps_coords;
          return (
            <Circle
              key={isp.id}
              center={[gpsCoords.lat, gpsCoords.lng]}
              radius={25000} // 25km service area
              pathOptions={{
                color: '#006B3F',
                fillColor: 'rgba(0, 107, 63, 0.15)',
                weight: 2,
                fillOpacity: 0.3
              }}
            />
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default ServiceAreaMap;