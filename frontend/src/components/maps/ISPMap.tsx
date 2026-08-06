import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Box, Typography, Chip } from '@mui/material';
import L from 'leaflet';

interface ISPMapProps {
  isps: any[];
  center?: [number, number];
  zoom?: number;
  showServiceAreas?: boolean;
  showCurrentLocation?: boolean;
}

const ISPMap: React.FC<ISPMapProps> = ({ 
  isps, 
  center = [7.9469, -1.0232], // Ghana center
  zoom = 6,
  showServiceAreas = true,
  showCurrentLocation = false
}) => {
  // Custom marker icons
  const getISPIcon = (availability: string) => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${availability === 'available' ? '#4CAF50' : '#FF9800'}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <Box sx={{ height: '500px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {isps.map((isp) => (
          <React.Fragment key={isp.id}>
            {/* ISP location marker */}
            <Marker
              position={isp.gps_coords ? [isp.gps_coords.lat, isp.gps_coords.lng] : [7.9469, -1.0232]}
              icon={getISPIcon(isp.availability)}
            >
              <Popup>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {isp.trade}
                  </Typography>
                  <Typography variant="body2">
                    Rating: {isp.rating || 'N/A'} ({isp.jobs_completed || 0} jobs)
                  </Typography>
                  <Chip
                    label={isp.availability}
                    color={isp.availability === 'available' ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Popup>
            </Marker>
            
            {/* Service area circle */}
            {showServiceAreas && isp.gps_coords && (
              <Circle
                center={[isp.gps_coords.lat, isp.gps_coords.lng]}
                radius={25000} // 25km service area
                pathOptions={{
                  color: isp.availability === 'available' ? '#4CAF50' : '#FF9800',
                  fillColor: isp.availability === 'available' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                  weight: 2
                }}
              />
            )}
          </React.Fragment>
        ))}
      </MapContainer>
    </Box>
  );
};

export default ISPMap;