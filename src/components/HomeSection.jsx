import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
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
  const [studentsData, setStudentsData] = useState(null);
  const [selectedYear, setSelectedYear] = useState("2025");
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nextSectionRef = useRef(null);

  // Function to refresh the access token
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      setError("No refresh token found.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/refreshtoken",
        { token: refreshToken }
      );

      const newAccessToken = response.data.accessToken;
      localStorage.setItem("authToken", newAccessToken); // Store the new token
      return newAccessToken; // Return the new access token
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Failed to refresh token.");
      return null;
    }
  };

  // Function to check if the token is expired
  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  // Fetch data from API
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    // If the token is expired, try to refresh it
    if (isTokenExpired(token)) {
      refreshAccessToken().then((newToken) => {
        if (newToken) {
          fetchData(newToken);
        } else {
          setLoading(false);
        }
      });
    } else {
      fetchData(token);
    }
  }, [selectedYear]);

  const fetchData = (token) => {
    axios
      .get("http://localhost:3000/api/director/students", {
        headers: { Authorization: `Bearer ${token}` },
        // params: { year: selectedYear },
      })
      .then((response) => {
        setStudentsData(response.data);
        console.log(studentsData)
        setTopStudents(response.data.filter((student) => student.average > 90));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students data:", error);
        setError("Failed to fetch data. Please try again.");
        setLoading(false);
      });
  };

  const scrollToNextSection = () => {
    if (nextSectionRef.current) {
      nextSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="welcome-section flex flex-row items-center gap-12 !m-11 !pl-12 !pr-12 !pb-6 !pt-2 bg-gray-50 rounded-xl shadow-xl">
        <div className="flex flex-col gap-4 !mr-11 !ml-11 max-w-lvw">
          <h1 className="text-5xl font-bold text-blue-600 leading-tight animate__animated animate__fadeInUp">
            Welcome Back, Director!
          </h1>
          <h3 className="text-2xl text-gray-700 leading-relaxed animate__animated animate__fadeInUp animate__delay-1s">
            Welcome! As the director, you’re key to overseeing academics, managing resources, and ensuring smooth operations. This system
            provides easy access to tools and insights for effective decision-making.
          </h3>
        </div>
        <img
          src={SchoolDir}
          alt="School Director"
          className="w-96 h-98 rounded-4xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl animate__animated animate__fadeIn animate__delay-2s"
        />
      </div>
      <div
        className="absolute bottom-1/12 right-2/4 cursor-pointer"
        onClick={scrollToNextSection}
      >
        <img src={arrowDown} alt="Arrow Down" className="w-12 h-12" />
      </div>
      <div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="2025">2025</option>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
          <option value="2021">2020</option>
        </select>
      </div>
      <div className="!p-2">
        <div className="home-section-header flex flex-row justify-around !m-6 flex-wrap">
          <Link to="/student">
            <StatusBox name={"Students"} number={"2400"} icon={graduation} />
          </Link>
          <Link to="/teacher">
            <StatusBox name={"Teachers"} number={"240"} icon={teacher} />
          </Link>
          <StatusBox name={"Budget"} number={"23 mill"} icon={calculation} />
        </div>

        <div
          className="home-section-body w-full h-auto flex flex-row gap-6"
          ref={nextSectionRef}
        >
          <div className="flex flex-col basis-4/6">
            <SchoolBudgetChart />
            <div className="flex flex-col gap-2">
              {/* Render Top Students */}
              {topStudents && <TopStudentTable data={topStudents} />}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <ActivityContainer className="basis-2/6" />
            <ResourceShared className="basis-64" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
