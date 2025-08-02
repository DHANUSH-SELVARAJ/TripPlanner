import React, { useEffect, useState } from "react";
import MapComponent from "../components/MapComponent.jsx";
import SideBar from "../components/SideBar.jsx";
import TopBar from "../components/TopMenuBar.jsx";
import LocationPermissionNotice from "../components/LocationPermissionNotice.jsx";

export default function MapPage() {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile toggle

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionDenied(false);
        setPermissionChecked(true);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setPermissionChecked(true);
        }
      }
    );
  }, []);

 return (
    <div className="h-screen flex flex-col relative">
      {/* Fixed TopBar */}
      <TopBar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      {!permissionChecked ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg text-gray-700">Checking location permission...</p>
        </div>
      ) : permissionDenied ? (
        <div className="flex-grow flex items-center justify-center bg-red-50">
          <LocationPermissionNotice />
        </div>
      ) : (
        <div className="flex-1 relative">
         
             {/* Sidebar overlay (doesn't shrink map) */}
            
            <SideBar closeSidebar={() => setIsSidebarOpen(false)} />
            
             
             {/* Map always full size */}
          <div className="absolute inset-0 z-0 ">
            <MapComponent />
          </div>

          

          {/* Mobile overlay background */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
