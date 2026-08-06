import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import L from 'leaflet';
import api from '../../services/api';

interface LiveTrackingMapProps {
  jobId: string;
  customerLocation?: { lat: number; lng: number };
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ jobId, customerLocation }) => {
  const [jobProgress, setJobProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  const loadJobProgress = useCallback(async () => {
    try {
      const response = await api.get(`/api/jobs/${jobId}/progress`);
      setJobProgress(response.data.data);
      setEta(response.data.data.eta);
      setDistance(response.data.data.distance);
    } catch (error) {
      console.error('Failed to load job progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadJobProgress();
    const interval = setInterval(loadJobProgress, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [loadJobProgress]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!jobProgress) {
    return <Typography>No job progress data available</Typography>;
  }

  const getISPIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #006B3F; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.3);"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  const getDestinationIcon = () => {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #FFD400; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  // Route path if ISP is en route
  const routePath = jobProgress.current_location && jobProgress.destination
    ? (() => {
        const currentLoc = typeof jobProgress.current_location === 'string' ? JSON.parse(jobProgress.current_location) : jobProgress.current_location;
        const destLoc = typeof jobProgress.destination === 'string' ? JSON.parse(jobProgress.destination) : jobProgress.destination;
        if (currentLoc && destLoc) {
          return [
            [currentLoc.lat, currentLoc.lng],
            [destLoc.lat, destLoc.lng]
          ];
        }
        return null;
      })()
    : null;

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Live Tracking
        </Typography>
        <Chip
          label={jobProgress.status ? jobProgress.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
          color={jobProgress.status === 'en_route' ? 'warning' : 'success'}
          size="small"
        />
      </Box>
      
      {eta && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Estimated Arrival: {eta} minutes {distance && `(${distance} km)`}
          </Typography>
        </Box>
      )}

      <Box sx={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={customerLocation || [7.9469, -1.0232]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          
          {/* ISP current location */}
          {jobProgress.current_location && (() => {
            const currentLoc = typeof jobProgress.current_location === 'string' ? JSON.parse(jobProgress.current_location) : jobProgress.current_location;
            return currentLoc ? (
              <Marker
                position={[currentLoc.lat, currentLoc.lng]}
                icon={getISPIcon()}
              >
                <Popup>
                  <Typography variant="body2">
                    ISP Location • Last updated: Just now
                  </Typography>
                </Popup>
              </Marker>
            ) : null;
          })()}
          
          {/* Destination (job location) */}
          {jobProgress.destination && (() => {
            const destLoc = typeof jobProgress.destination === 'string' ? JSON.parse(jobProgress.destination) : jobProgress.destination;
            return destLoc ? (
              <Marker
                position={[destLoc.lat, destLoc.lng]}
                icon={getDestinationIcon()}
              >
                <Popup>
                  <Typography variant="body2">
                    Destination • {jobProgress.address}
                  </Typography>
                </Popup>
              </Marker>
            ) : null;
          })()}
          
          {/* Route line */}
          {routePath && (
            <Polyline
              positions={routePath}
              color="#006B3F"
              weight={4}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default LiveTrackingMap;