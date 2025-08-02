import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';

export default function PlaceSearchInput({ onFind, label = 'Enter location...', value }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const defaultOptions = [
    {
      value: 'your-location',
      label: '📍 Your Location',
      location: null,
    },
  ];

  // ✅ Keep selected option in options list when value changes externally
  useEffect(() => {
    if (value && value.name) {
      const selectedOption = {
        label: value.name,
        value: value.place_id || 'selected',
        location: value,
      };
      setOptions((prev) => {
        const exists = prev.some((opt) => opt.value === selectedOption.value);
        return exists ? prev : [selectedOption, ...prev];
      });
    }
  }, [value]);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setOptions(defaultOptions);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/nominatim/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await res.json();
      const newOptions = data.map((item) => ({
        value: item.place_id,
        label: item.display_name,
        location: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          name: item.display_name,
          place_id: item.place_id,
        },
      }));
      setOptions([...defaultOptions, ...newOptions]);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (inputValue) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(inputValue), 500);
  };

  const handleSelect = (option) => {
    if (option?.value === 'your-location') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const location = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              name: 'Your Location',
            };
            onFind(location);
          },
          (err) => {
            alert('Unable to get your current location.');
            console.error(err);
          }
        );
      } else {
        alert('Geolocation is not supported by your browser.');
      }
    } else {
      onFind(option?.location || null);
    }
  };

  return (
    <Select
      className="w-full"
      placeholder={label}
      value={
        value
          ? {
              label: value.name,
              value: value.place_id || 'selected',
            }
          : null
      }
      onInputChange={handleInputChange}
      onChange={handleSelect}
      options={options}
      isClearable
      noOptionsMessage={() => (loading ? 'Searching...' : 'No results found')}
    />
  );
}
