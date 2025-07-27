import Select from 'react-select';
import React, { useState, useRef } from 'react';

export default function AutocompleteDropdown({ onFind }) {
  const [options, setOptions] = useState([]);
  const debounceRef = useRef(null);

  const loadOptions = async (inputValue) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5`
    );
    const data = await res.json();
    return data.map((place) => ({
      label: place.display_name,
      value: place.place_id,
      location: { lat: parseFloat(place.lat), lng: parseFloat(place.lon) },
    }));
  };

  const handleInputChange = (inputValue) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const newOptions = await loadOptions(inputValue);
      setOptions(newOptions);
    }, 1000);
  };

  const handleSelect = (selected) => {
    if (selected) onFind({ ...selected.location, name: selected.label });
  };

  return (
    <Select
      options={options}
      onInputChange={handleInputChange}
      onChange={handleSelect}
      placeholder="Search for a place..."
      className="z-50"
    />
  );
}
