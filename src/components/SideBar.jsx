import React, { useState, useRef } from 'react';
import PlaceSearchInput from './PlaceSearchInput';
import { useDispatch, useSelector } from 'react-redux';
import { setTarget, setCurrent, setDefaultCurrent, setShouldRoute, setIsRouting  } from '../store/mapSlice';

export default function SideBar() {
  const dispatch = useDispatch();

  // Redux state
  const current = useSelector(state => state.map.current);
  const defaultCurrent = useSelector(state => state.map.defaultCurrent);
  const target = useSelector(state => state.map.target);

  // Travel and simulation states
  const [isTraveling, setIsTraveling] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [showCurrentSearch, setShowCurrentSearch] = useState(false); // show current search box after Get Directions

  // Refs for watches
  const travelWatchId = useRef(null);
  const simulationRef = useRef(null);

  // Handlers for search inputs
  const handleSetTarget = (location) => {
    dispatch(setTarget(location));
  };

  const handleSetCurrent = (location) => {
    dispatch(setCurrent(location));
  };

  const resetOrigin = () => {
    dispatch(setCurrent(defaultCurrent));
  };

  const isSameLocation = (loc1, loc2) => {
    if (!loc1 || !loc2) return false;
    return loc1.lat === loc2.lat && loc1.lng === loc2.lng;
  };

  const handleDirection = () => {
    if (!current || !target) return alert('Set both origin and destination.');
    dispatch(setShouldRoute(true));
    dispatch(setIsRouting(true));
    setShowCurrentSearch(true); // show current location input after clicking Get Directions
  };

  const handleStartTravel = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');

    setIsTraveling(true);
    travelWatchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        dispatch(setCurrent({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
      },
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
  };

  const simulateTravel = async () => {
    if (!current || !target) return alert('Set both origin and destination.');
    setSimulating(true);

    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${current.lng},${current.lat};${target.lng},${target.lat}?overview=full&geometries=geojson`
    );
    const data = await res.json();

    const fullPath = data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
    
    const maxSteps = 20;
    const totalSteps = fullPath.length;
    const stepInterval = Math.max(1, Math.floor(totalSteps / maxSteps));

    const sampledPath = [];
    for (let i = 0; i < totalSteps; i += stepInterval) {
      sampledPath.push(fullPath[i]);
    }
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
        dispatch(setCurrent(sampledPath[i]));
        i++;
      }
    }, interval);
  };

  return (
    <div className="w-100 bg-white shadow-lg h-screen overflow-y-auto border-r p-4 relative">
      <h2 className="text-xl font-bold mb-4">Trip Planner</h2>

      {/* Target Search Input */}
      <div className="mb-4 relative z-50">
        <PlaceSearchInput
          label="Search destination..."
          onFind={handleSetTarget}
          defaultValue={target}
        />
      </div>

      {/* Show Current Location Search Input only after clicking Get Directions */}
      {showCurrentSearch && (
        <div className="mb-4 relative z-50">
          <PlaceSearchInput
            label="Search current location..."
            onFind={handleSetCurrent}
            defaultValue={current}
          />
          <button
            onClick={resetOrigin}
            disabled={isSameLocation(current, defaultCurrent)}
            className={`mt-2 px-4 py-2 rounded text-white ${
              isSameLocation(current, defaultCurrent)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            Your Location
          </button>
        </div>
      )}

      {/* Buttons */}
      <div className="mb-4 flex flex-col space-y-2">
        <button
          onClick={handleDirection}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Get Directions
        </button>

        {!isTraveling && !simulating && (
          <button
            onClick={handleStartTravel}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Travel
          </button>
        )}

        {(isTraveling || simulating) && (
          <button
            onClick={stopTravel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Stop Travel
          </button>
        )}

        {!simulating && !isTraveling && (
          <button
            onClick={simulateTravel}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Simulate Travel
          </button>
        )}
      </div>
    </div>
  );
}
