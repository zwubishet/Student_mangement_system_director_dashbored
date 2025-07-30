import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DirectorDashBoared from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage"; 
import StudentPage from "./pages/StudentPage";
import TeacherDashboard from "./pages/TeacherPage";
import StudentDetails from "./views/StudentDetail";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DirectorDashBoared />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<DirectorDashBoared />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/student/:id" element={<StudentDetails />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
