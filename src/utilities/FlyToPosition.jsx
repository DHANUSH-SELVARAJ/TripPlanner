import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function FlyToPosition({ position, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], zoom || 13);
    }
  }, [position, zoom, map]);

  return null;
}
