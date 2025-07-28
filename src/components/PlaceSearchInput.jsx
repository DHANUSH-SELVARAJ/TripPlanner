import React, { useState, useRef, useEffect } from 'react';
import Select from 'react-select';

export default function PlaceSearchInput({ onFind, label = 'Enter location...', defaultValue }) {
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const debounceRef = useRef(null);

  // Set default if provided (reverse geocode)
  useEffect(() => {
    if (defaultValue) {
      reverseGeocode(defaultValue.lat, defaultValue.lng).then((place) => {
        if (place) {
          const option = {
            value: place.place_id || 'default',
            label: place.display_name,
            location: {
              lat: defaultValue.lat,
              lng: defaultValue.lng,
              name: place.display_name,
            },
          };
          setSelectedOption(option);
        }
      });
    }
  }, [defaultValue]);


  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      return await res.json();
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      return null;
    }
  };

  const [loading, setLoading] = useState(false);

const fetchSuggestions = async (query) => {
  if (!query.trim()) return setOptions([]);
  setLoading(true);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await res.json();

    const mapped = data.map((item) => ({
      value: item.place_id,
      label: item.display_name,
      location: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name,
      },
    }));

    setOptions(mapped);
  } catch (err) {
    console.error('Fetch error:', err);
    setOptions([]);
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (value) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 500);
  };

  const handleSelect = (option) => {
    setSelectedOption(option);
    if (option?.location) {
      onFind(option.location);
    }
  };

  return (
  <Select
    placeholder={label}
    inputValue={inputValue}
    value={selectedOption}
    onInputChange={handleInputChange}
    onChange={handleSelect}
    options={options}
    isClearable
    styles={{
      container: (base) => ({
        ...base,
        width: '100%', // fixed width here, change as needed
      }),
      menu: (base) => ({
        ...base,
        zIndex: 9999,
      }),
    }}
    noOptionsMessage={() => {
      if (loading) return 'Searching...';
      if (inputValue) return 'No results found';
      return 'Type to search';
    }}
  />

  );
}
