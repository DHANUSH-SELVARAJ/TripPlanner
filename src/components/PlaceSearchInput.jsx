import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';

export default function PlaceSearchInput({ onFind, label = 'Enter location...', value }) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Add default "Your Location" option when input is empty
  const defaultOptions = inputValue.trim() === ''
    ? [
        {
          value: 'your-location',
          label: '📍 Your Location',
          location: null,
        },
      ]
    : [];

  useEffect(() => {
    if (value) {
      setInputValue(value.name || '');
    } else {
      setInputValue('');
    }
  }, [value]);

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setOptions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/nominatim/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setOptions(
        data.map((item) => ({
          value: item.place_id,
          label: item.display_name,
          location: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            name: item.display_name,
          },
        }))
      );
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (val) => {
    setInputValue(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  const handleSelect = (option) => {
    if (option?.value === 'your-location') {
      // Get current location
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
      className="w-[100%]"
      placeholder={label}
      inputValue={inputValue}
      value={
        value
          ? { label: value.name, value: value.place_id || 'selected' }
          : null
      }
      onInputChange={handleInputChange}
      onChange={handleSelect}
      options={[...defaultOptions, ...options]}
      isClearable
      noOptionsMessage={() =>
        loading ? 'Searching...' : 'No results found'
      }
    />
  );
}
