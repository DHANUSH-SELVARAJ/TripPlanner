import React from 'react';
import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children }) {
  // Check if currentUserEmail exists in localStorage
  const isLoggedIn = Boolean(localStorage.getItem('currentUserEmail'));

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
