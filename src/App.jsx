// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './Pages/LoginPage';
import MapPage from './Pages/MapPage';

export default function App() {
  const isLoggedIn = Boolean(sessionStorage.getItem('user')); // Simple auth check

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/map"
          element={isLoggedIn ? <MapPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}
