import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../style/dashboared.css"
import SideBar from "../components/SideBar";
import HomeSection from "../components/HomeSection";

const DirectorDashBoard = () => {

  return (
   <div className="dashbored">
    <SideBar/>
    <HomeSection />
   </div>
  );
};

export default DirectorDashBoard;
