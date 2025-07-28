import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

export default function TopMenuBar() {
  const user = JSON.parse(sessionStorage.getItem('user'));

  return (
    <header className="bg-gray-900 text-white h-14 flex items-center justify-between px-6 shadow-md">
      {/* Left: Logo or App Title */}
      <div className="text-lg font-semibold tracking-wide">
        🚗 Trip Planner
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-3">
        <span className="text-sm hidden sm:inline">
          {user?.name || 'Guest'}
        </span>
        {user?.picture ? (
          <img
            src={user.picture}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
          />
        ) : (
          <FaUserCircle size={28} />
        )}
      </div>
    </header>
  );
}
