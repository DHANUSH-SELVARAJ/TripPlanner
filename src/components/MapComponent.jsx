import React, { useState, useRef, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import PlaceSearchInput from './PlaceSearchInput';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const MapCenterer = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], 14);
  }, [position, map]);
  return null;
};

const RoutingMachine = ({ current, target }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !current || !target) return;
    if (routingRef.current) routingRef.current.remove();

    routingRef.current = L.Routing.control({
      waypoints: [L.latLng(current.lat, current.lng), L.latLng(target.lat, target.lng)],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
    }).addTo(map);

    return () => routingRef.current?.remove();
  }, [current, target, map]);

  return null;
};

const reverseGeocode = async ({ lat, lng }) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
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
  const [current, setCurrent] = useState(null);
  const [defaultCurrent, setDefaultCurrent] = useState(null);
  const [target, setTarget] = useState(null);
  const [shouldRoute, setShouldRoute] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [travelMarkerPos, setTravelMarkerPos] = useState(null);
  const travelWatchId = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const resolved = await reverseGeocode(coords);
        if (resolved) {
          setCurrent(resolved);
          setDefaultCurrent(resolved);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Could not get your current location.');
      }
    );
  }, []);

  const handleFind = (location) => {
    setTarget(location);
    setShouldRoute(false);
    setIsRouting(false);
  };

  const handleDirection = () => {
    if (!current || !target) return alert('Set both origin and destination.');
    setShouldRoute(true);
    setIsRouting(true);
  };

  const handleTempOriginChange = (pos) => setCurrent(pos);
  const resetOrigin = () => setCurrent(defaultCurrent);

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

  const simulateTravel = async () => {
    if (!current || !target) return alert('Set both origin and destination.');
    setSimulating(true);

    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${current.lng},${current.lat};${target.lng},${target.lat}?overview=full&geometries=geojson`);
    const data = await res.json();
    const path = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

    const steps = path.length;
    const interval = 5000 / steps;
    let i = 0;
    simulationRef.current = setInterval(() => {
      if (i >= steps) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
        setSimulating(false);
      } else {
        setTravelMarkerPos(path[i]);
        i++;
      }
    }, interval);
  };

  return (
    <div className="relative w-full h-screen" style={{ height: '100%' }}>
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white p-4 rounded shadow-md w-96 space-y-2">
        {isRouting && (
          <PlaceSearchInput label="Edit origin..." onFind={handleTempOriginChange} defaultValue={defaultCurrent} />
        )}
        <PlaceSearchInput label="Search destination..." onFind={handleFind} />

        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={handleDirection} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">Get Directions</button>
          {isRouting && (
            <button onClick={resetOrigin} className="bg-gray-400 text-white px-4 py-1 rounded hover:bg-gray-500">Reset Origin</button>
          )}
          {!isTraveling && !simulating && (
            <button onClick={handleStartTravel} className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Start Travel</button>
          )}
          {(isTraveling || simulating) && (
            <button onClick={stopTravel} className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">Stop Travel</button>
          )}
          {!simulating && !isTraveling && (
            <button onClick={simulateTravel} className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700">Simulate Travel</button>
          )}
        </div>
        <p className="text-xs text-gray-500 text-center">* Simulate travel follows the actual route over 5 seconds.</p>
      </div>

      {current ? (
        <MapContainer center={[current.lat, current.lng]} zoom={13} style={{ height: '100%' }}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[current.lat, current.lng]} />
          {target && <Marker position={[target.lat, target.lng]} />}
          {travelMarkerPos && (
            <Marker
              position={[travelMarkerPos.lat, travelMarkerPos.lng]}
              icon={L.icon({
                iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
                iconSize: [32, 32],
              })}
            />
          )}
          {target && <MapCenterer position={target} />}
          {shouldRoute && <RoutingMachine current={current} target={target} />}
        </MapContainer>
      ) : (
        <div className="flex justify-center items-center h-full text-gray-600">Getting current location...</div>
      )}
    </div>
  );
}
