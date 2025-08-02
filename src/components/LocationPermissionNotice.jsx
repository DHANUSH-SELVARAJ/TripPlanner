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
    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded max-w-xl mx-auto mt-10">
      <h2 className="text-lg font-bold mb-2">Location access denied</h2>
      <p className="mb-4">
        We couldn't access your location. To enable it manually:
      </p>
      <ul className="list-disc list-inside text-left space-y-1">
        <li>Click the 🔒 lock icon in your browser's address bar</li>
        <li>Select "Site settings"</li>
        <li>Find "Location" and set it to <strong>Allow</strong></li>
        <li>Reload this page</li>
      </ul>
    </div>
  );
}
