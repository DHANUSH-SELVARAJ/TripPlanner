import React, { useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaBars, FaChevronLeft, FaRegCircle, FaMapMarkerAlt,
  FaExchangeAlt, FaCar, FaWalking, FaMotorcycle
} from 'react-icons/fa';
import PlaceSearchInput from './PlaceSearchInput';
import {
  setTarget, setCurrent, setIsRouting,
  setIsTraveling, setSimulating, setSimulatingLocation, setMode
} from '../store/mapSlice';
import { toggleCollapse } from '../store/sidebarSlice';

export default function SideBar() {
  const dispatch = useDispatch();
  const isCollapsed = useSelector((state) => state.sidebar.isCollapsed);
  const current = useSelector((state) => state.map.current);
  const target = useSelector((state) => state.map.target);
  const isTraveling = useSelector((state) => state.map.isTraveling);
  const simulating = useSelector((state) => state.map.simulating);
  const liveLocation = useSelector((state) => state.map.liveLocation);

  const [routeDetails, setRouteDetails] = useState({});
  const [selectedMode, setSelectedMode] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [customAlert, setCustomAlert] = useState(null);

  const travelWatchId = useRef(null);
  const simulationRef = useRef(null);
  const totalDurationRef = useRef(null);
  const progressRef = useRef(0);

  const handleToggle = () => dispatch(toggleCollapse());
  const handleSetTarget = (location) => {
    stopTravel();
    dispatch(setTarget(location));
  }
  const handleSetCurrent = (location) => {
    stopTravel();
    location && dispatch(setCurrent(location));
  }

  const speedMap = { car: 55, bike: 54, walk: 3 };

  useEffect(() => {
    dispatch(setIsRouting(!!(current && target)));
  }, [current, target, dispatch]);

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!current || !target) return;

      let details = {};
      const fetchRoute = async (mode, profile, speed) => {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/${profile}/${current.lng},${current.lat};${target.lng},${target.lat}?overview=full&geometries=geojson&steps=true`
        );
        const data = await res.json();
        if (data.routes?.[0]) {
          const route = data.routes[0];
          const distKm = route.distance / 1000;

          // Build geometry with names
          const geometryWithNames = [];
          route.legs[0].steps.forEach((step, idx) => {
            step.geometry.coordinates.forEach(([lng, lat]) => {
              geometryWithNames.push({
                lat,
                lng,
                name: step.name || `Step ${idx + 1}`,
                place_id: `step-${idx + 1}`
              });
            });
          });

          details[mode] = {
            duration: Math.ceil((distKm / speed) * 60),
            distance: distKm.toFixed(1),
            steps: route.legs?.[0]?.steps?.map(step => step.name).filter(name => name?.trim() !== ""),
            geometry: geometryWithNames 
          };
        }
      };
      await fetchRoute("car", "driving", speedMap.car);
      await fetchRoute("bike", "driving", speedMap.bike);
      await fetchRoute("walk", "walking", speedMap.walk);
      setRouteDetails(details);
    };
    fetchRoutes();
  }, [current, target]);

  useEffect(() => {
    if ((simulating && (current || target))) {
      stopTravel();
    }
  }, [current, target]);

  useEffect(() => {
    stopTravel();
  }, [selectedMode]);

  const showAlert = (message) => {
    setCustomAlert(message);
    setTimeout(() => setCustomAlert(null), 3000);
  };

 const handleStartTravel = () => {
  if (!navigator.geolocation) return showAlert('Geolocation not supported');
  if (!current || !target) return showAlert("Please select both start and destination.");
  if (!selectedMode) return showAlert("Please select a mode of travel.");

  dispatch(setIsTraveling(true));

  travelWatchId.current = navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        // Reverse geocode to get place details
        const res = await fetch(
          `/nominatim/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const place = await res.json();

        dispatch(
          setCurrent({
            lat: latitude,
            lng: longitude,
            name: place.display_name || 'Current Location',
            place_id: place.place_id || `loc-${Date.now()}`, // fallback id
          })
        );
      } catch (err) {
        console.error('Reverse geocoding failed:', err);
        dispatch(
          setCurrent({
            lat: latitude,
            lng: longitude,
            name: 'Unknown Location',
            place_id: `loc-${Date.now()}`, // fallback id
          })
        );
      }
    },
    () => showAlert('Failed to get position.'),
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  );
};


  const stopTravel = () => {
    if (travelWatchId.current) navigator.geolocation.clearWatch(travelWatchId.current);
    if (simulationRef.current) clearInterval(simulationRef.current);
    travelWatchId.current = null;
    simulationRef.current = null;
    dispatch(setIsTraveling(false));
    dispatch(setSimulating(false));
    setRemainingTime(null);
  };

 const simulateTravel = () => {
  if (!current || !target) return showAlert("Please select both start and destination.");
  if (!selectedMode) return showAlert("Please select a mode of travel.");

  const modeRoute = routeDetails[selectedMode];
  if (!modeRoute) return showAlert("Route details unavailable for selected mode.");

  dispatch(setIsTraveling(true));

  const path = modeRoute.geometry; // geometry already contains { lat, lng, name, place_id }
   totalDurationRef.current = modeRoute.duration;
  progressRef.current = 0;
  setRemainingTime(modeRoute.duration);

  simulationRef.current = setInterval(() => {
    progressRef.current += 20;

    const currentPoint = path[progressRef.current];
    if (currentPoint) {
      dispatch(setCurrent({
        lat: currentPoint.lat,
        lng: currentPoint.lng,
        name: currentPoint.name || `Point ${progressRef.current}`,
        place_id: currentPoint.place_id || `point-${progressRef.current}`
      }));
    }

    setRemainingTime(Math.max(
      Math.ceil(totalDurationRef.current * (1 - progressRef.current / path.length)), 0
    ));

    if (progressRef.current >= path.length) {
      clearInterval(simulationRef.current);
      setRemainingTime(0);
    }
  }, 5000);
};


   useEffect(() => {
      console.log(current,"sidebar");
    },[current])
  
  
  const canStartTravel = () =>
    current && liveLocation && target &&
    Math.abs(current.lat - liveLocation.lat) < 0.0001 &&
    Math.abs(current.lng - liveLocation.lng) < 0.0001;

  const formatDuration = (min) =>
    min >= 60 ? `${Math.floor(min / 60)} hr ${min % 60} min` : `${min} min`;

  const renderContent = (isMobile = false) => (
    <div className={`${isMobile ? 'px-4 mt-5 pb-4' : 'flex flex-col flex-1 overflow-hidden'}`}>
      {/* Search Inputs */}
      <div className="flex items-start pt-2 pb-5">
        <div className="flex flex-col mt-3">
          <FaRegCircle className="text-gray-600" />
          <div className="w-px h-9 border-l border-dotted border-gray-400 ml-2" />
          <FaMapMarkerAlt className="text-red-500" />
        </div>
        <div className="flex flex-col pl-2 w-[85%] gap-4">
          {/* <PlaceSearchInput label="Choose starting point" onFind={handleSetCurrent} defaultValue={current} />
          <PlaceSearchInput label="Choose destination" onFind={handleSetTarget} defaultValue={target} /> */}
          <PlaceSearchInput 
            label="Choose starting point" 
            onFind={handleSetCurrent} 
            value={current}
          />
          <PlaceSearchInput 
            label="Choose destination" 
            onFind={handleSetTarget} 
            value={target}
          />
        </div>
        <div className="mt-6 ml-2">
          <button
            onClick={() => {
              dispatch(setCurrent(target));
              dispatch(setTarget(current));
            }}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaExchangeAlt className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Modes */}
      {current && target && (
        <div className={`flex justify-around ${isMobile ? 'py-2' : 'px-4 py-2'}`}>
          {[
            { mode: 'car', icon: <FaCar />, label: 'Car' },
            { mode: 'bike', icon: <FaMotorcycle />, label: 'Bike' },
            { mode: 'walk', icon: <FaWalking />, label: 'Walk' },
          ].map(({ mode, icon, label }) => (
            <div
              key={mode}
              className={`flex flex-col items-center cursor-pointer p-2 rounded-lg 
                ${selectedMode === mode ? 'bg-gray-100 border border-gray-300' : ''}`}
              onClick={() => { setSelectedMode(mode); dispatch(setMode(mode)); }}
            >
              <div className="text-2xl">{icon}</div>
              <div className="text-xs">{label}</div>
              {routeDetails[mode] && (
                <div className="text-xs text-gray-600">{formatDuration(routeDetails[mode].duration)}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Travel Details */}
      {selectedMode && routeDetails[selectedMode] && (
        <div className={`mt-4 ${isMobile ? '' : 'mx-4'} p-4 rounded-lg border border-gray-200 bg-white`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100 text-gray-600">
                {selectedMode === 'car' && <FaCar />}
                {selectedMode === 'bike' && <FaMotorcycle />}
                {selectedMode === 'walk' && <FaWalking />}
              </div>
              <div className="font-semibold capitalize text-gray-800">{selectedMode}</div>
            </div>
            <div className="text-green-600 text-xl font-bold">
              {remainingTime !== null
                ? formatDuration(remainingTime)
                : formatDuration(routeDetails[selectedMode].duration)}
            </div>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="text-gray-700 font-medium">
              {routeDetails[selectedMode].distance} km
            </div>
            <button
              className="text-blue-600 text-sm font-medium hover:underline"
              onClick={() => setShowDetails(prev => !prev)}
            >
              {showDetails ? "Hide Details" : "View Details"}
            </button>
          </div>
          {showDetails && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 space-y-1 max-h-40 overflow-y-auto">
              {routeDetails[selectedMode].steps?.length > 0 ? (
                [...new Set(routeDetails[selectedMode].steps)].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-gray-400">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No step-by-step details available.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className={`${isMobile ? 'mt-4' : 'm-4 px-4'} flex flex-col space-y-3`}>
        {!isTraveling && !simulating && (
          <div className="relative group w-full">
            <button
              onClick={handleStartTravel}
              disabled={!canStartTravel()}
              className={`w-full px-4 py-2 rounded-lg border shadow-sm transition 
                ${canStartTravel()
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-200 cursor-not-allowed"}`}
            >
              Start Travel
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                              px-2 py-1 text-xs text-white bg-gray-800 rounded shadow 
                              opacity-0 group-hover:opacity-100 transition-opacity
                              whitespace-nowrap">
              {canStartTravel()
                ? "Ready to start travel"
                : "Your current location does not match the source"}
            </span>
          </div>
        )}
        {(isTraveling || simulating) && (
          <button
            onClick={stopTravel}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
          >
            Stop Travel
          </button>
        )}
        {!simulating && !isTraveling && current && target && (
          <button
            onClick={simulateTravel}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-black"
          >
            Simulate Travel
          </button>
        )}
      </div>
    </div>
  );

  return (
     <div className="absolute z-10 transition-all duration-300 ease-in-out"
      style={{ width: isCollapsed ? "80px" : "40%", height:isCollapsed? "auto" : "100%"}}
      >
      
      <div
        className={`hidden md:flex bg-white border border-gray-200 rounded-lg shadow-sm m-2 flex-col
           overflow-hidden transition-all duration-300 ease-in-out
           ${isCollapsed ? 'p-0' : 'p-5' }`}
   
          style={{ height: '96%' }}
      >
        
        <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-end pr-0'} p-2`}>
          <button
            onClick={handleToggle}
            className={`p-2 rounded-full border bg-blue-600 text-white`}
          >
            {isCollapsed ? <FaBars /> : <FaChevronLeft />}
          </button>
        </div>
        {!isCollapsed && renderContent()}
      </div>

      {/* Mobile Bottom Sheet */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl  rounded-t-lg transition-transform duration-300
        ${isCollapsed ? 'translate-y-[80%]' : 'translate-y-0'}`}
        style={{ height: isCollapsed ? "30%" : "auto" ,maxHeight: "70%"}}
        
      >
        <div className="absolute -top-4 left-9/10 -translate-x-1/2 z-50">
          <button
            onClick={handleToggle}
            className="bg-blue-600 text-white p-2 rounded-full shadow-md"
          >
            {isCollapsed ? <FaChevronLeft className="rotate-90" /> : <FaChevronLeft className="-rotate-90" />}
          </button>
        </div>
        <div className={` h-450 overflow-scroll`}>
          {!isCollapsed && renderContent(true)} 
        </div>
      </div>
      
      {customAlert && (
        <div 
          className="fixed bottom-2 left-2 bg-red-600 text-white px-4 py-2 text-xs rounded-lg shadow-lg animate-bounce z-50"
        >
          {customAlert}
        </div>
        )}
    </div>
    
  );
}
