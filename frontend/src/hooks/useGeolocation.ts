import { useState, useEffect, useCallback } from 'react';

export interface Coordinates {
  latitude: number;
  longitude: number;
  name?: string;
}

// Preset popular college fest hubs across India
export const PRESET_LOCATIONS: Coordinates[] = [
  { name: 'Current Location', latitude: 28.6139, longitude: 77.2090 }, // placeholder updated by browser GPS
  { name: 'Delhi NCR (IITD, DTU, DU)', latitude: 28.6139, longitude: 77.2090 },
  { name: 'Chandigarh / Mohali (PEC, CU)', latitude: 30.7333, longitude: 76.7794 },
  { name: 'Bengaluru (IISc, PES, RVCE)', latitude: 12.9716, longitude: 77.5946 },
  { name: 'Mumbai (IITB, VJTI, SPIT)', latitude: 19.0760, longitude: 72.8777 },
  { name: 'Pune (COEP, Symbiosis)', latitude: 18.5204, longitude: 73.8567 },
  { name: 'Hyderabad (IIT-H, BITS, IIIT)', latitude: 17.3850, longitude: 78.4867 },
  { name: 'Chennai (IITM, Anna Univ)', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Kolkata (IIT-KGP, Jadavpur)', latitude: 22.5726, longitude: 88.3639 },
];

export function useGeolocation() {
  const [coords, setCoords] = useState<Coordinates>({
    latitude: 28.6139,
    longitude: 77.2090,
    name: 'Delhi NCR',
  });
  const [radius, setRadius] = useState<number>(50); // 50km default radius
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const requestBrowserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: Number(pos.coords.latitude.toFixed(4)),
          longitude: Number(pos.coords.longitude.toFixed(4)),
          name: 'My Current Location',
        });
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        setError(err.message || 'Location permission denied. Using selected preset.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    // Attempt detection on first mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: Number(pos.coords.latitude.toFixed(4)),
            longitude: Number(pos.coords.longitude.toFixed(4)),
            name: 'My Current Location',
          });
        },
        () => {
          // Keep default preset without crashing
        },
        { timeout: 5000 }
      );
    }
  }, []);

  return {
    coords,
    setCoords,
    radius,
    setRadius,
    isDetecting,
    requestBrowserLocation,
    error,
  };
}
