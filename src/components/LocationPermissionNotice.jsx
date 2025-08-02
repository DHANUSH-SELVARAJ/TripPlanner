import React, { useEffect, useState } from 'react';

export default function LocationPermissionNotice() {
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionDenied(false); // access granted
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true); // show error message
        }
      }
    );
  }, []);

  if (!permissionDenied) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 
                    px-4 sm:px-6 py-3 sm:py-4 
                    rounded-lg max-w-sm sm:max-w-md md:max-w-xl 
                    mx-2 sm:mx-auto mt-6 sm:mt-10 shadow-md">
      <h2 className="text-base sm:text-lg font-bold mb-2 text-center sm:text-left">
        Location Access Denied
      </h2>
      <p className="text-sm sm:text-base mb-3">
        We couldn't access your location. To enable it manually:
      </p>
      <ul className="list-disc list-inside text-left space-y-1 text-sm sm:text-base">
        <li>Click the 🔒 lock icon in your browser's address bar</li>
        <li>Select "Site settings"</li>
        <li>Find "Location" and set it to <strong>Allow</strong></li>
        <li>Reload this page</li>
      </ul>
    </div>
  );
}
