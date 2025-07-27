import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DirectorDashBoard = () => {
  const {user, logout} = useAuth();
 
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log(token);
    if (!token && !user) {
      // Redirect to login page if no token found
      <Navigate to="/login" replace />;
    }
  }, [user]);
  console.log(user);
  const _logout = () => {
    logout();
    localStorage.removeItem("authToken");
    // Redirect to login after logout
    return <Navigate to="/login" replace />;
  };

  if (!user) {
    return <p>Loading...</p>; // Show loading until user is loaded
  }

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>Username: {user.fullName}</p>
      <p>Role: {user.role}</p>
      <button onClick={_logout}>Logout</button>

      {/* Add more content for the dashboard here */}
      <div>
        <h2>Director Dashboard</h2>
        {user.role === "admin" ? (
          <p>You have admin privileges.</p>
        ) : (
          <p>You are a regular user.</p>
        )}
      </div>
    </div>
  );
};

export default DirectorDashBoard;
