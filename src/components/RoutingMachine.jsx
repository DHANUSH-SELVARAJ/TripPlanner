import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import L from 'leaflet';
import 'leaflet-routing-machine';

const RoutingMachine = ({ current, target }) => {
  const map = useMap();
  const routingRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const isTraveling = useSelector((state) => state.map.isTraveling);
  const isSimulating = useSelector((state) => state.map.simulating);

  useEffect(() => {
    if (!map || !current || !target) return;

    if (routingRef.current) {
      routingRef.current.remove();
      routingRef.current = null;
    }

    setLoading(true); // Start loading when initiating routing

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(current.lat, current.lng),
        L.latLng(target.lat, target.lng)
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false,
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: 'blue', opacity: 1, weight: 5 }],
      },
    })
      .on('routesfound', (e) => {
        setLoading(false); // Stop loading when route is found

        const route = e.routes[0];
        const coords = route.coordinates;
        if (!coords || coords.length === 0) return;

        const bounds = coords.reduce((bounds, coord) => {
          return bounds.extend(L.latLng(coord.lat, coord.lng));
        }, L.latLngBounds(coords[0], coords[0]));

        if (!isTraveling) {
          map.flyToBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            duration: 1.5,
          });
        }
      })
      .on('routingerror', (e) => {
        setLoading(false); // Stop loading on error
        console.error('Routing error:', e.error || e);
      })
      .addTo(map);

    return () => {
      routingRef.current?.remove();
      routingRef.current = null;
    };
  }, [map, current, target]);

  return (
    <>
      {loading && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500/50 z-999">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          </div>
      )}
    </>
  );
};

export default RoutingMachine;
