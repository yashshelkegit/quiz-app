// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const studentData = localStorage.getItem('studentData');
  return studentData ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
