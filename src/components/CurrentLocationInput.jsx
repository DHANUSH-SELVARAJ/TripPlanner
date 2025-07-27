import React, { useState, useEffect } from 'react';

export default function CurrentLocationInput({ current, onChange }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const reverseGeocode = async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${current.lat}&lon=${current.lng}&format=json`
        );
        const data = await res.json();
        setQuery(data.display_name || '');
      } catch (err) {
        console.error(err);
      }
    };
    reverseGeocode();
  }, [current]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        onChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert('Location not found');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Edit current location"
        className="flex-1 px-3 py-2 border rounded focus:ring focus:outline-none"
      />
      <button
        onClick={handleSearch}
        className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
      >
        Update
      </button>
    </div>
  );
}
