import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';

export default function MapPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) navigate('/');
  }, [navigate]);

  return (
    <div className="w-full h-screen">
      <MapComponent />
    </div>
  );
}
