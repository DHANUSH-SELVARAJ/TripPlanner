import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import Logo from '../assets/logo.png';
import { compressImage } from '../utilities/helper';

export default function TopMenuBar() {
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  const currentEmail = localStorage.getItem('currentUserEmail');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const userIndex = users.findIndex(u => u.email === currentEmail);
  const user = userIndex !== -1 ? users[userIndex] : null;

  const handleLogout = () => {
    localStorage.removeItem('currentUserEmail');
    window.location.reload();
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    compressImage(file, (compressedBase64) => {
      users[userIndex].profile.picture = compressedBase64;
      localStorage.setItem("users", JSON.stringify(users));
      window.location.reload();
    });
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-blue-700 text-white h-14 flex items-center justify-between px-4 sm:px-6 shadow-md relative">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-2 sm:gap-3 font-bold tracking-wide">
        <img src={Logo} alt="Logo" className="w-6 h-6 sm:w-7 sm:h-7" />
        <span className="text-sm sm:text-base md:text-lg">TRIP PLANNER</span>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-2 sm:gap-3 relative" ref={menuRef}>
        {/* Username - Visible on desktop only */}
        <span className="hidden sm:block text-sm sm:text-base font-semibold tracking-wide">
          {user?.name || 'Guest'}
        </span>

        {/* Avatar */}
        {user?.profile?.picture ? (
          <img
            src={user?.profile?.picture}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer"
            onClick={() => setShowMenu(prev => !prev)}
          />
        ) : (
          <FaUserCircle
            size={28}
            className="cursor-pointer"
            onClick={() => setShowMenu(prev => !prev)}
          />
        )}

        {/* Dropdown Menu */}
        <div
          className={`absolute top-12 right-0 bg-white rounded-xl shadow-xl border border-gray-100 
          w-44 sm:w-48 overflow-hidden transition-all duration-300 ease-in-out
          ${showMenu ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
          style={{ zIndex: 999 }}
        >
          {/* Mobile-only name */}
          <div className="block sm:hidden px-5 py-3 text-sm font-medium text-gray-800 border-b border-gray-100">
            👤 {user?.name || 'Guest'}
          </div>

          {/* Upload Photo */}
          <button
            onClick={() => {
              fileInputRef.current.click();
              setShowMenu(false);
            }}
            className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 
                      transition-colors duration-200"
          >
            📷 Upload Photo
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />

          {/* Logout */}
          <button
            onClick={() => {
              setShowMenu(false);
              handleLogout();
            }}
            className="w-full text-left px-5 py-3 text-sm font-medium text-gray-700 
                      hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-600 
                      transition-colors duration-200"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </header>
  );
}
