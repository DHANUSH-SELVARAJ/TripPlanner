import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

const RoutingMachine = ({ current, target }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!map || !current || !target) return;

    // Remove previous control if exists
    if (routingRef.current) {
      routingRef.current.remove();
      routingRef.current = null;
    }

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(current.lat, current.lng),
        L.latLng(target.lat, target.lng)
      ],
      routeWhileDragging: false,
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false, // we'll do fitBounds ourselves
      createMarker: () => null, // disable default markers
    })
      .on('routesfound', (e) => {
        if (!e.routes || e.routes.length === 0) return;

        const route = e.routes[0];
        const coords = route.coordinates;

        if (!coords || coords.length === 0) return;

        const bounds = coords.reduce((bounds, coord) => {
          return bounds.extend(L.latLng(coord.lat, coord.lng));
        }, L.latLngBounds(coords[0], coords[0]));

        map.flyToBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          duration: 1.5,
        });
      })
      .on('routingerror', (e) => {
        console.error('Routing error:', e.error || e);
      })
      .addTo(map);

    return () => {
      routingRef.current?.remove();
      routingRef.current = null;
    };
  }, [map, current, target]);

  return null;
};

export default RoutingMachine;
