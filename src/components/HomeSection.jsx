import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import StatusBox from "../views/StatusBox";
import graduation from "../assets/graduation.png";
import SchoolDir from "../assets/SchoolDir.png";
import arrowDown from "../assets/arrow-down.png";
import teacher from "../assets/teacher.png";
import calculation from "../assets/calculation.png";
import SchoolBudgetChart from "../views/LineChart.jsx";
import TopStudentTable from "../views/TopStudentTable.jsx";
import ActivityContainer from "../views/ActivityContainers.jsx";
import ResourceShared from "../views/ResourceShares.jsx";

const HomeSection = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers] = useState(240); // In real app, fetch from API
  const [budget] = useState("23 mill"); // In real app, fetch from API

  const nextSectionRef = useRef(null);

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setError("No refresh token found. Please log in again.");
      return null;
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/refreshtoken", { token: refreshToken });
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("authToken", newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.error("Error refreshing token:", err);
      setError("Session expired. Please log in again.");
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Fetch data with token handling
  const fetchData = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:3000/api/director/students", {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: selectedYear },
      });
      const data = response.data || [];
      setStudentsData(data);
      setTopStudents(data.filter((student) => student.average > 90));
      setTotalStudents(data.length);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Unauthorized access. Please log in.");
      } else {
        setError("Failed to fetch data. Please try again later.");
      }
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token || isTokenExpired(token)) {
      refreshAccessToken().then((newToken) => {
        if (newToken) fetchData(newToken);
        else setLoading(false);
      });
    } else {
      fetchData(token);
    }
  }, [selectedYear]);

  const scrollToNextSection = () => {
    nextSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="!p-6 text-center">
        <p className="text-red-600 text-lg">{error}</p>
        <Link to="/login" className="text-blue-500 underline !mt-4 inline-block">Log In</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Welcome Section */}
      <section className="welcome-section w-full max-w-7xl flex flex-col md:flex-row items-center gap-12 !m-8 !p-8 bg-white rounded-xl shadow-xl">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 !mb-4">Welcome Back, Director!</h1>
          <p className="text-lg md:text-xl text-gray-700">
            As the director, oversee academics, manage resources, and ensure operational efficiency. This dashboard provides key insights and tools for informed decision-making.
          </p>
        </div>
        <img src={SchoolDir} alt="School Director Illustration" className="w-80 h-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-300" />
      </section>

      {/* Scroll Indicator */}
      <button onClick={scrollToNextSection} aria-label="Scroll to dashboard" className="absolute top-3/4 right-1/2 transform translate-x-1/2 cursor-pointer">
        <img src={arrowDown} alt="" className="w-12 h-12 animate-bounce" />
      </button>

      {/* Year Selector */}
      <div className="!my-6">
        <label htmlFor="year-select" className="sr-only">Select Academic Year</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="!p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[2025, 2024, 2023, 2022, 2021].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Status Boxes */}
      <section className="status-section w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 !my-8 !px-4">
        <Link to="/student" className="transform hover:scale-105 transition-transform">
          <StatusBox name="Students" number={totalStudents} icon={graduation} />
        </Link>
        <Link to="/teacher" className="transform hover:scale-105 transition-transform">
          <StatusBox name="Teachers" number={totalTeachers} icon={teacher} />
        </Link>
        <div className="transform hover:scale-105 transition-transform">
          <StatusBox name="Budget" number={budget} icon={calculation} />
        </div>
      </section>

      {/* Main Dashboard Body */}
      <section ref={nextSectionRef} className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 !px-4 !pb-8">
        <div className="flex-1 lg:basis-4/6 flex flex-col gap-6">
          <SchoolBudgetChart year={selectedYear} />
          <TopStudentTable data={topStudents} />
        </div>
        <div className="flex flex-col gap-6 lg:basis-2/6">
          <ActivityContainer />
          <ResourceShared />
        </div>
      </section>
    </div>
  );
};

export default HomeSection;