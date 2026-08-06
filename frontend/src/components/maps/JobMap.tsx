import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Typography, Chip } from '@mui/material';
import L from 'leaflet';

interface JobMapProps {
  jobs: any[];
  isps: any[];
  center?: [number, number];
  zoom?: number;
}

const JobMap: React.FC<JobMapProps> = ({ jobs, isps, center = [7.9469, -1.0232], zoom = 6 }) => {
  const getJobIcon = (priority: string) => {
    const colors = {
      urgent: '#F44336',
      high: '#FF9800',
      normal: '#2196F3',
      low: '#4CAF50'
    };
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${colors[priority] || '#2196F3'}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  return (
    <Box sx={{ height: '600px', width: '100%' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {/* Job markers */}
        {jobs.map((job) => (
          <Marker
            key={job.id}
            position={job.gps_coords ? [job.gps_coords.lat, job.gps_coords.lng] : [7.9469, -1.0232]}
            icon={getJobIcon(job.priority)}
          >
            <Popup>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {job.job_number}
                </Typography>
                <Typography variant="body2">
                  {job.category} - {job.description ? job.description.substring(0, 50) : 'No description'}...
                </Typography>
                <Chip label={job.status} size="small" sx={{ mt: 1 }} />
                <Chip label={job.priority} size="small" sx={{ mt: 1 }} />
              </Box>
            </Popup>
          </Marker>
        ))}
        
        {/* ISP markers */}
        {isps.map((isp) => (
          <Marker
            key={isp.id}
            position={isp.gps_coords ? [isp.gps_coords.lat, isp.gps_coords.lng] : [7.9469, -1.0232]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #006B3F; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            })}
          >
            <Popup>
              <Typography variant="body2">{isp.trade}</Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default JobMap;