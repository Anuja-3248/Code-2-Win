import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AmbulancePage } from './pages/AmbulancePage';
import { HospitalResultsPage } from './pages/HospitalResultsPage';
import { HospitalLogin } from './pages/HospitalLogin';
import { HospitalDashboard } from './pages/HospitalDashboard';

export const App: React.FC = () => {
  // Hospital Authentication state for mock prototype
  const [isHospitalLoggedIn, setIsHospitalLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('resqlink_hospital_logged_in') === 'true';
  });
  const [currentHospitalId, setCurrentHospitalId] = useState<string>(() => {
    return sessionStorage.getItem('resqlink_hospital_id') || 'hosp-001';
  });
  const [currentHospitalName, setCurrentHospitalName] = useState<string>(() => {
    return sessionStorage.getItem('resqlink_hospital_name') || 'Ruby Care Hospital';
  });

  const handleHospitalLogin = (hospitalId: string, hospitalName: string) => {
    setIsHospitalLoggedIn(true);
    setCurrentHospitalId(hospitalId);
    setCurrentHospitalName(hospitalName);
    sessionStorage.setItem('resqlink_hospital_logged_in', 'true');
    sessionStorage.setItem('resqlink_hospital_id', hospitalId);
    sessionStorage.setItem('resqlink_hospital_name', hospitalName);
  };

  const handleHospitalLogout = () => {
    setIsHospitalLoggedIn(false);
    sessionStorage.removeItem('resqlink_hospital_logged_in');
    sessionStorage.removeItem('resqlink_hospital_id');
    sessionStorage.removeItem('resqlink_hospital_name');
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar
          isHospitalLoggedIn={isHospitalLoggedIn}
          hospitalName={currentHospitalName}
          onHospitalLogout={handleHospitalLogout}
        />

        {/* Dynamic Route Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/ambulance" element={<AmbulancePage />} />
            <Route path="/ambulance/results" element={<HospitalResultsPage />} />
            <Route
              path="/hospital/login"
              element={<HospitalLogin onLoginSuccess={handleHospitalLogin} />}
            />
            <Route
              path="/hospital/dashboard"
              element={
                isHospitalLoggedIn ? (
                  <HospitalDashboard hospitalId={currentHospitalId} />
                ) : (
                  <HospitalDashboard hospitalId={currentHospitalId} />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;
