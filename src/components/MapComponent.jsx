import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSelector, useDispatch } from 'react-redux';
import RoutingMachine from './RoutingMachine';
import locationPin from '../assets/locationPin.png';
import PlaceSearchInput from './PlaceSearchInput';
import DefaultLapLocationGif from '../assets/home.gif';
import {
  setCurrent,
  setLastSearchedPlace,
  setLiveLocation
} from '../store/mapSlice';
import { setCollapse } from '../store/sidebarSlice';

// Component to center map when position changes
const MapCenterer = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { animate: true, duration: 1.5 });
    }
  }, [position, map]);
  return null;
};

let lastReverseGeocodeTime = 0;
const reverseGeocode = async ({ lat, lng }) => {
  const now = Date.now();
  if (now - lastReverseGeocodeTime < 5000) return null;
  lastReverseGeocodeTime = now;

  try {
    const res = await fetch(`/nominatim/reverse?format=json&lat=${lat}&lon=${lng}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    return {
      lat,
      lng,
      name: data.display_name,
      place_id: data.place_id || `${lat},${lng}`
    };
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return null;
  }
};


// User marker icon
const userPhotoIcon = (userPhoto) =>
  L.icon({
    iconUrl: userPhoto,
    iconSize: [32, 32],
    className: 'user-photo',
  });

export default function MapComponent() {
  const dispatch = useDispatch();
  const current = useSelector((state) => state.map.current);
  const target = useSelector((state) => state.map.target);
  const isRouting = useSelector((state) => state.map.isRouting);
  const isSimulating = useSelector((state) => state.map.simulating);
  const simulatingLocation = useSelector((state) => state.map.simulatingLocation);
  const isSideBarCollapse = useSelector((state) => state.sidebar.isCollapsed);
  const [lastSearched, setLastSearched] = useState(null);

  function getCurrentUserProfile() {
    const currentEmail = localStorage.getItem('currentUserEmail');
    if (!currentEmail) return null;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.email === currentEmail) || null;
  }

  const user = getCurrentUserProfile();
  const userPhoto = user?.profile?.picture || user?.picture || DefaultLapLocationGif;

  // Initial geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const resolved = await reverseGeocode(coords);
        if (resolved) {
          dispatch(setCurrent(resolved));
          dispatch(setLiveLocation(resolved));
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Could not get your current location.');
      }
    );
  }, [dispatch]);

  return (
    <div className="relative w-full h-full">
      {/* Floating search box when sidebar is collapsed */}
      {isSideBarCollapse && (
        <div className="absolute md:top-2 md:left-80px right-4 md:left-20 md:right-auto md:w-[400px]  w-[100%] left-0  p-2 rounded shadow-md bg-white flex gap-2 z-999">
          <PlaceSearchInput
            label="Search on map..."
            value={target}
            onFind={(location) => {
              dispatch(setLastSearchedPlace(location));
              setLastSearched(location);
            }}
          />
          <button
            disabled={!lastSearched}
            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              if (!lastSearched) return;
              dispatch(setCollapse(false));
              dispatch({ type: 'map/setTarget', payload: lastSearched });
            }}
            title="Get Directions"
            aria-label="Get Directions"
          >
            <svg xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M14 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      )}

      {current ? (
        <MapContainer
          center={[current.lat, current.lng]}
          zoom={13}
          style={{ height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Markers */}
          {userPhoto && <Marker position={[current.lat, current.lng]} icon={userPhotoIcon(userPhoto)} />}
          {target && <Marker position={[target.lat, target.lng]} icon={L.icon({ iconUrl: locationPin, iconSize: [32, 32] })} />}
          {lastSearched && !target && <Marker position={[lastSearched.lat, lastSearched.lng]} icon={L.icon({ iconUrl: locationPin, iconSize: [32, 32] })} />}
          {userPhoto && isSimulating && simulatingLocation && <Marker position={[simulatingLocation.lat, simulatingLocation.lng]} icon={userPhotoIcon(userPhoto)} />}

          {/* Map behavior */}
          {lastSearched && <MapCenterer position={lastSearched} />}
          {current && <MapCenterer position={current} />}
          {isRouting && <RoutingMachine current={current} target={target} />}
        </MapContainer>
      ) : (
        <div className="flex justify-center items-center h-full text-gray-600">
          Getting current location...
        </div>
      )}
    </div>
  );
}
