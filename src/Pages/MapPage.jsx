import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import SideBar from '../components/Sidebar';
import TopBar from '../components/TopMenuBar';

export default function MapPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) navigate('/');
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col">
      {/* Top Navigation */}
      <TopBar />

      {/* Sidebar + Map */}
      <div className="flex flex-1">
        <SideBar />
        <MapComponent />
      </div>
    </div>
  );
}
