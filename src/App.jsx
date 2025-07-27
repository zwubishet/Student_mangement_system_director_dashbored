import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DirectorDashBoared from "./pages/DashboardPage"; // Update this path to your actual DashboardPage component
import LoginPage from "./pages/LoginPage"; // Update this path to your actual LoginPage component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DirectorDashBoared />} />
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default App;
