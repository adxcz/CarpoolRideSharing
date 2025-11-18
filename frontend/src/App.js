import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Lazy load the auth components
const PassengerLogin = lazy(() => import('./pages/auth/PassengerLogin'));
const DriverLogin = lazy(() => import('./pages/auth/DriverLogin'));
const Register = lazy(() => import('./pages/auth/Register'));

// Lazy load dashboard components
const DriverDashboard = lazy(() => import('./pages/dashboard/DriverDashboard'));
const PassengerDashboard = lazy(() => import('./pages/dashboard/PassengerDashboard'));

// Lazy load ride components
const CreateRide = lazy(() => import('./pages/rides/CreateRide'));
const EditRide = lazy(() => import('./pages/rides/EditRide'));
const SearchRides = lazy(() => import('./pages/rides/SearchRides'));

// Lazy load home component
const Home = lazy(() => import('./pages/Home'));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/passenger" element={<PassengerLogin />} />
          <Route path="/login/driver" element={<DriverLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
          <Route path="/create-ride" element={<CreateRide />} />
          <Route path="/edit-ride/:id" element={<EditRide />} />
          <Route path="/search-rides" element={<SearchRides />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;