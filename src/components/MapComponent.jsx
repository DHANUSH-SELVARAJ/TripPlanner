import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap} from 'react-leaflet';
import L from 'leaflet';
import { useSelector, useDispatch } from 'react-redux';
import RoutingMachine from './RoutingMachine';
import locationPin from '../assets/locationPin.png';

// Center map when target changes
const MapCenterer = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position)
      map.flyTo([position.lat, position.lng], 14, {
        animate: true,
        duration: 1.5, // seconds
      });
  }, [position, map]);

  return null;
};

// Reverse geocode function unchanged, could also move to Redux thunk if needed
const reverseGeocode = async ({ lat, lng }) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();
    return {
      lat,
      lng,
      name: data.display_name,
      place_id: data.place_id || `${lat},${lng}`,
    };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
};

export default function MapComponent() {
  const dispatch = useDispatch();

  // Get state from redux
  const current = useSelector((state) => state.map.current);
  const defaultCurrent = useSelector((state) => state.map.defaultCurrent);
  const target = useSelector((state) => state.map.target);
  const shouldRoute = useSelector((state) => state.map.shouldRoute);
  const isRouting = useSelector((state) => state.map.isRouting);
  const routePath = useSelector(state => state.map.routePath);

  // Local states for travel and simulation tracking
  const [isTraveling, setIsTraveling] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [travelMarkerPos, setTravelMarkerPos] = useState(null);

  const travelWatchId = useRef(null);
  const simulationRef = useRef(null);

  // On mount, get current location and dispatch to redux
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const resolved = await reverseGeocode(coords);
        if (resolved) {
          dispatch({ type: 'map/setCurrent', payload: resolved });
          dispatch({ type: 'map/setDefaultCurrent', payload: resolved });
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Could not get your current location.');
      }
    );
  }, [dispatch]);

  // User photo from session
  const user = JSON.parse(sessionStorage.getItem('user'));
  const userPhoto = user?.picture;

  // Functions previously used inside component, now dispatch to redux
  const resetOrigin = () => {
    dispatch({ type: 'map/setCurrent', payload: defaultCurrent });
  };

  const handleDirection = () => {
    if (!current || !target) return alert('Set both origin and destination.');
    dispatch({ type: 'map/setShouldRoute', payload: true });
    dispatch({ type: 'map/setIsRouting', payload: true });
  };

  const isSameLocation = (loc1, loc2) => {
    if (!loc1 || !loc2) return false;
    return loc1.lat === loc2.lat && loc1.lng === loc2.lng;
  };

  // Travel handlers
  const handleStartTravel = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');

    setIsTraveling(true);
    travelWatchId.current = navigator.geolocation.watchPosition(
      (pos) => setTravelMarkerPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        console.error('Live tracking error:', err);
        alert('Failed to get position for travel.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  };

  const stopTravel = () => {
    if (travelWatchId.current !== null) {
      navigator.geolocation.clearWatch(travelWatchId.current);
      travelWatchId.current = null;
    }
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
      simulationRef.current = null;
    }
    setIsTraveling(false);
    setSimulating(false);
    setTravelMarkerPos(null);
  };

  // Travel simulation logic unchanged
  const simulateTravel = async () => {
    if (!current || !target) return alert('Set both origin and destination.');
    setSimulating(true);

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${current.lng},${current.lat};${target.lng},${target.lat}?overview=full&geometries=geojson`
    );
    const data = await res.json();

    const fullPath = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

    // Sample max 20 steps
    const maxSteps = 20;
    const totalSteps = fullPath.length;
    const stepInterval = Math.max(1, Math.floor(totalSteps / maxSteps));

    const sampledPath = [];
    for (let i = 0; i < totalSteps; i += stepInterval) {
      sampledPath.push(fullPath[i]);
    }
    // Ensure last point
    if (sampledPath[sampledPath.length - 1] !== fullPath[totalSteps - 1]) {
      sampledPath.push(fullPath[totalSteps - 1]);
    }

    let i = 0;
    const interval = 500;
    simulationRef.current = setInterval(() => {
      if (i >= sampledPath.length) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
        setSimulating(false);
      } else {
        setTravelMarkerPos(sampledPath[i]);
        i++;
      }
    }, interval);
  };

  return (
    <div className="relative w-full h-screen" style={{ height: '100vh' }}>
      {/* Removed buttons from here - buttons should be handled in sidebar */}

      {/* Show map only if current position available */}
      {current ? (
        <MapContainer center={[current.lat, current.lng]} zoom={13} style={{ height: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Current position marker */}
          <Marker
            position={[current.lat, current.lng]}
            icon={L.icon({
              iconUrl: userPhoto,
              iconSize: [32, 32],
            })}
          />

          {/* Target position marker */}
          {target && (
            <Marker
              position={[target.lat, target.lng]}
              icon={L.icon({
                iconUrl: locationPin,
                iconSize: [32, 32],
              })}
            />
          )}

          {/* Marker for live travel position */}
          {travelMarkerPos && (
            <Marker
              position={[travelMarkerPos.lat, travelMarkerPos.lng]}
              icon={L.icon({
                iconUrl: userPhoto,
                iconSize: [32, 32],
              })}
            />
          )}

          {/* Fly map to target */}
          {target && <MapCenterer position={target} />}

          {/* Routing if needed */}
          {shouldRoute && <RoutingMachine current={current} target={target} />}
        </MapContainer>
      ) : (
        <div className="flex justify-center items-center h-full text-gray-600">
          Getting current location...
        </div>
      )}
    </div>
  );
}
